import { NextRequest, NextResponse } from "next/server";
import { markdownToLatex } from "@/lib/markdownToLatex";
import { buildLatexDocument } from "@/lib/latexTemplate";

export const runtime = "nodejs";

type NotesToPdfRequest = {
  content: string;
  title?: string;
};

const LATEXONLINE_TIMEOUT_MS = 15_000;
const MAX_UPSTREAM_URL_LENGTH = 7_500;

function sanitizeFilename(title: string): string {
  return title
    .trim()
    // Convert German umlauts to ASCII equivalents
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .replace(/ß/g, "ss")
    .replace(/\s+/g, "_")  // Replace spaces with underscores
    .replace(/[^\w\-_.]/g, "")  // Remove special characters except underscore, dash, dot
    .replace(/_{2,}/g, "_")  // Replace multiple underscores with single
    .substring(0, 200)  // Limit length
    || "Notizen";  // Fallback if empty after sanitization
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: NotesToPdfRequest = await request.json();

    // Validation
    if (!body.content || typeof body.content !== "string" || body.content.trim() === "") {
      return NextResponse.json(
        { error: "Missing content" },
        { status: 400 }
      );
    }

    if (body.content.length > 50_000) {
      return NextResponse.json(
        { error: "Content too large (max 50k characters)" },
        { status: 413 }
      );
    }

    // Processing
    const markdown = body.content;
    const title = body.title?.trim() || "Notizen";
    const filename = sanitizeFilename(title) + ".pdf";
    const latexBody = markdownToLatex(markdown);
    const fullDoc = buildLatexDocument(latexBody, title);

    // External compile call
    const params = new URLSearchParams();
    params.set("text", fullDoc);
    params.set("download", filename);
    const url = `https://latexonline.cc/compile?${params.toString()}`;

    if (url.length > MAX_UPSTREAM_URL_LENGTH) {
      return NextResponse.json(
        {
          error: "Content too large for upstream compiler",
          details: "Bitte kürze die Notiz oder nutze den lokalen Export."
        },
        { status: 413 }
      );
    }

    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), LATEXONLINE_TIMEOUT_MS);

    let apiRes: Response;
    try {
      apiRes = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Physik-App/1.0",
        },
        signal: abort.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    // Handle response
    const contentType = apiRes.headers.get("Content-Type") || "";

    if (apiRes.ok && contentType.startsWith("application/pdf")) {
      const arrayBuffer = await apiRes.arrayBuffer();
      const pdfBuffer = Buffer.from(arrayBuffer);

      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // Compilation failed
    if (apiRes.status === 400) {
      const log = await apiRes.text();
      return NextResponse.json(
        { error: "Compilation failed", log },
        { status: 400 }
      );
    }

    // Other upstream errors
    const errorText = await apiRes.text();
    return NextResponse.json(
      {
        error: "Upstream LaTeX service error",
        status: apiRes.status,
        details: errorText.slice(0, 1_500),
      },
      { status: 502 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Upstream timeout",
          details: "LaTeX-Compiler hat nicht rechtzeitig geantwortet."
        },
        { status: 504 }
      );
    }
    console.error("PDF generation error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
