import { NextRequest } from "next/server";

import { POST } from "@/app/api/notes-to-pdf/route";

describe("POST /api/notes-to-pdf", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 400 for missing content", async () => {
    const req = new NextRequest("http://localhost/api/notes-to-pdf", {
      method: "POST",
      body: JSON.stringify({ title: "Ohne Inhalt" })
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Missing content");
  });

  it("returns a pdf response when upstream compile succeeds", async () => {
    fetchMock.mockResolvedValue(
      new Response(Uint8Array.from([0x25, 0x50, 0x44, 0x46]), {
        status: 200,
        headers: { "Content-Type": "application/pdf" }
      })
    );

    const req = new NextRequest("http://localhost/api/notes-to-pdf", {
      method: "POST",
      body: JSON.stringify({ content: "# Test", title: "ÄÖ Übung" })
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain("AeOe_Uebung.pdf");
  });

  it("returns 413 when upstream URL would exceed safe length", async () => {
    const req = new NextRequest("http://localhost/api/notes-to-pdf", {
      method: "POST",
      body: JSON.stringify({ content: "a".repeat(10_000), title: "Sehr lang" })
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(413);
    expect(body.error).toContain("Content too large");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 502 for non-pdf upstream failures", async () => {
    fetchMock.mockResolvedValue(
      new Response("upstream error", {
        status: 500,
        headers: { "Content-Type": "text/plain" }
      })
    );

    const req = new NextRequest("http://localhost/api/notes-to-pdf", {
      method: "POST",
      body: JSON.stringify({ content: "x", title: "Test" })
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.error).toBe("Upstream LaTeX service error");
    expect(body.status).toBe(500);
  });

  it("returns 504 on upstream timeout abort", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";
    fetchMock.mockRejectedValue(abortError);

    const req = new NextRequest("http://localhost/api/notes-to-pdf", {
      method: "POST",
      body: JSON.stringify({ content: "# Timeout", title: "Test" })
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(504);
    expect(body.error).toBe("Upstream timeout");
  });
});
