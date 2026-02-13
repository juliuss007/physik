import { searchNotes } from "@/lib/notes";
import type { Note } from "@/types/app";

describe("notes search", () => {
  const notes: Note[] = [
    {
      id: "n-1",
      title: "Klassische Mechanik",
      module: "experimentalphysik-1",
      tags: ["klausur"],
      content: "Impuls und Kraft",
      attachments: [
        {
          id: "pdf-1",
          fileName: "skript-mechanik.pdf",
          mimeType: "application/pdf",
          size: 1200,
          pages: 2,
          uploadedAt: "2025-01-10T10:00:00.000Z",
          extractedText: "Drehimpuls und Zentralkraft"
        }
      ],
      createdAt: "2025-01-10T08:00:00.000Z",
      updatedAt: "2025-01-10T11:00:00.000Z"
    },
    {
      id: "n-2",
      title: "Analysis",
      module: "mathe-physiker-1",
      tags: [],
      content: "Folgen und Reihen",
      attachments: [],
      createdAt: "2025-01-11T08:00:00.000Z",
      updatedAt: "2025-01-11T10:00:00.000Z"
    }
  ];

  it("finds notes by attachment filename and extracted text", () => {
    expect(searchNotes(notes, "skript-mechanik")).toHaveLength(1);
    expect(searchNotes(notes, "Zentralkraft")).toHaveLength(1);
  });

  it("falls back to title/content/tag search as before", () => {
    expect(searchNotes(notes, "analysis")).toHaveLength(1);
    expect(searchNotes(notes, "KRAFT")).toHaveLength(1);
    expect(searchNotes(notes, "klausur")).toHaveLength(1);
  });
});
