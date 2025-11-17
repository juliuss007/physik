import { NextRequest, NextResponse } from "next/server";
import latex from "node-latex";
import { Readable } from "stream";

export async function POST(request: NextRequest) {
  try {
    const { latexContent } = await request.json();

    if (!latexContent) {
      return NextResponse.json(
        { error: "No LaTeX content provided" },
        { status: 400 }
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
