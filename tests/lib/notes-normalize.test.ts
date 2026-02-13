import { normalizeImportedNotes, normalizeNote } from "@/lib/notes/normalize";

describe("notes normalization", () => {
  it("normalizes malformed note payloads", () => {
    const normalized = normalizeNote({
      id: "  my-id  ",
      title: "  ",
      module: "unknown-module",
      tags: ["tag-a", "", "tag-a", 123],
      content: 42,
      createdAt: "invalid",
      updatedAt: "2025-01-10T12:00:00.000Z"
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.id).toBe("my-id");
    expect(normalized?.title).toBe("Neue Notiz");
    expect(normalized?.module).toBe("experimentalphysik-1");
    expect(normalized?.tags).toEqual(["tag-a"]);
    expect(normalized?.content).toBe("");
    expect(normalized?.attachments).toEqual([]);
  });

  it("deduplicates imported notes by id and keeps newest updated version", () => {
    const notes = normalizeImportedNotes([
      {
        id: "same",
        title: "Old",
        module: "experimentalphysik-1",
        tags: [],
        content: "",
        createdAt: "2025-01-10T08:00:00.000Z",
        updatedAt: "2025-01-10T09:00:00.000Z"
      },
      {
        id: "same",
        title: "New",
        module: "experimentalphysik-1",
        tags: [],
        content: "",
        createdAt: "2025-01-10T08:00:00.000Z",
        updatedAt: "2025-01-10T10:00:00.000Z"
      }
    ]);

    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe("New");
  });

  it("normalizes attachments and trims extracted text", () => {
    const normalized = normalizeNote({
      id: "note-1",
      title: "PDF Test",
      module: "experimentalphysik-1",
      tags: [],
      content: "",
      attachments: [
        {
          id: "att-1",
          fileName: "skript.pdf",
          mimeType: "application/pdf",
          size: 1200,
          pages: 3,
          uploadedAt: "2025-01-10T08:00:00.000Z",
          extractedText: "  Quantenmechanik Grundlagen  "
        }
      ],
      createdAt: "2025-01-10T08:00:00.000Z",
      updatedAt: "2025-01-10T09:00:00.000Z"
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.attachments).toHaveLength(1);
    expect(normalized?.attachments[0].fileName).toBe("skript.pdf");
    expect(normalized?.attachments[0].extractedText).toBe("Quantenmechanik Grundlagen");
  });
});
