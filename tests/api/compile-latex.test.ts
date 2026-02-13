import { NextRequest } from "next/server";
import latex from "node-latex";

import { POST } from "@/app/api/compile-latex/route";

vi.mock("node-latex", () => ({
  default: vi.fn()
}));

function makeAsyncStream(chunks: Buffer[]) {
  return {
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) {
        yield chunk;
      }
    }
  };
}

describe("POST /api/compile-latex", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.mocked(latex).mockReset();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("returns 400 when latexContent is missing", async () => {
    const req = new NextRequest("http://localhost/api/compile-latex", {
      method: "POST",
      body: JSON.stringify({})
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("No LaTeX content provided");
  });

  it("returns 413 when latexContent is too large", async () => {
    const req = new NextRequest("http://localhost/api/compile-latex", {
      method: "POST",
      body: JSON.stringify({ latexContent: "x".repeat(200_001) })
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(413);
    expect(body.error).toBe("LaTeX content too large");
  });

  it("returns a pdf when node-latex compilation succeeds", async () => {
    vi.mocked(latex).mockReturnValue(makeAsyncStream([Buffer.from("%PDF-1.7")]) as never);

    const req = new NextRequest("http://localhost/api/compile-latex", {
      method: "POST",
      body: JSON.stringify({ latexContent: "\\documentclass{article}\\begin{document}Hi\\end{document}" })
    });

    const res = await POST(req);
    const body = Buffer.from(await res.arrayBuffer());

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(body.toString()).toContain("%PDF");
  });

  it("returns 500 if compiler emits empty output", async () => {
    vi.mocked(latex).mockReturnValue(makeAsyncStream([]) as never);

    const req = new NextRequest("http://localhost/api/compile-latex", {
      method: "POST",
      body: JSON.stringify({ latexContent: "\\documentclass{article}\\begin{document}Hi\\end{document}" })
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("LaTeX compiler produced an empty PDF");
  });

  it("returns 500 when node-latex throws", async () => {
    vi.mocked(latex).mockImplementation(() => {
      throw new Error("pdflatex not installed");
    });

    const req = new NextRequest("http://localhost/api/compile-latex", {
      method: "POST",
      body: JSON.stringify({ latexContent: "\\documentclass{article}\\begin{document}Hi\\end{document}" })
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("LaTeX compilation failed");
    expect(body.details).toContain("pdflatex not installed");
  });
});
