import { NextRequest, NextResponse } from "next/server";
import latex from "node-latex";
import { Readable } from "stream";

const MAX_LATEX_CHARS = 200_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const latexContent = body?.latexContent;

    if (typeof latexContent !== "string" || latexContent.trim() === "") {
      return NextResponse.json(
        { error: "No LaTeX content provided" },
        { status: 400 }
      );
    }

    if (latexContent.length > MAX_LATEX_CHARS) {
      return NextResponse.json(
        { error: "LaTeX content too large" },
        { status: 413 }
      );
    }

    // Create a readable stream from the LaTeX content
    const input = Readable.from([latexContent]);

    // Compile LaTeX to PDF
    const output = latex(input, {
      inputs: process.cwd() + "/texinputs",
      cmd: "pdflatex",
      passes: 2, // Run twice for references
      errorLogs: process.cwd() + "/latex-errors.log",
    });

    // Collect the PDF data
    const chunks: Buffer[] = [];
    for await (const chunk of output) {
      chunks.push(chunk);
    }

    const pdfBuffer = Buffer.concat(chunks);

    if (pdfBuffer.length === 0) {
      return NextResponse.json(
        { error: "LaTeX compiler produced an empty PDF" },
        { status: 500 }
      );
    }

    // Return the PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=document.pdf",
      },
    });
  } catch (error) {
    console.error("LaTeX compilation error:", error);
    return NextResponse.json(
      {
        error: "LaTeX compilation failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
