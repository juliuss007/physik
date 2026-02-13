import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_PDF_SIZE_BYTES = 12 * 1024 * 1024;
const MAX_EXTRACTED_TEXT_CHARS = 20_000;

function normalizeExtractedText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, MAX_EXTRACTED_TEXT_CHARS);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Keine PDF-Datei gefunden." }, { status: 400 });
    }

    const fileName = file.name || "upload.pdf";
    const isPdf =
      file.type === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Nur PDF-Dateien werden unterstützt." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "Die PDF-Datei ist leer." },
        { status: 400 }
      );
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      return NextResponse.json(
        { error: "PDF ist zu groß (max. 12 MB)." },
        { status: 413 }
      );
    }

    const pdfParse = (await import("pdf-parse")).default;
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdfParse(buffer);
    const text = normalizeExtractedText(result.text || "");

    return NextResponse.json({
      fileName,
      mimeType: "application/pdf",
      size: file.size,
      pageCount: result.numpages || 0,
      text
    });
  } catch (error) {
    console.error("PDF extraction failed:", error);
    return NextResponse.json(
      {
        error: "PDF konnte nicht verarbeitet werden.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
