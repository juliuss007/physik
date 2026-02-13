import { NextRequest } from "next/server";
import pdfParse from "pdf-parse";

import { POST } from "@/app/api/pdf-extract/route";

vi.mock("pdf-parse", () => ({
  default: vi.fn()
}));

describe("POST /api/pdf-extract", () => {
  beforeEach(() => {
    vi.mocked(pdfParse).mockReset();
  });

  it("returns 400 when no file is provided", async () => {
    const formData = new FormData();
    const req = new NextRequest("http://localhost/api/pdf-extract", {
      method: "POST",
      body: formData
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Keine PDF-Datei");
  });

  it("returns 400 for non-pdf uploads", async () => {
    const formData = new FormData();
    formData.set("file", new File(["hello"], "notes.txt", { type: "text/plain" }));
    const req = new NextRequest("http://localhost/api/pdf-extract", {
      method: "POST",
      body: formData
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Nur PDF-Dateien");
  });

  it("returns 413 for oversized files", async () => {
    const tooLargeBytes = new Uint8Array(12 * 1024 * 1024 + 1);
    const formData = new FormData();
    formData.set("file", new File([tooLargeBytes], "big.pdf", { type: "application/pdf" }));

    const req = new NextRequest("http://localhost/api/pdf-extract", {
      method: "POST",
      body: formData
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(413);
    expect(body.error).toContain("zu groß");
  });

  it("extracts and returns normalized text", async () => {
    vi.mocked(pdfParse).mockResolvedValue({
      numpages: 4,
      text: "  Erste Zeile  \n\n\nZweite   Zeile\r\n\r\n"
    } as never);

    const formData = new FormData();
    formData.set(
      "file",
      new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], "script.pdf", {
        type: "application/pdf"
      })
    );

    const req = new NextRequest("http://localhost/api/pdf-extract", {
      method: "POST",
      body: formData
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.fileName).toBe("script.pdf");
    expect(body.pageCount).toBe(4);
    expect(body.text).toBe("Erste Zeile\n\nZweite Zeile");
  });
});
