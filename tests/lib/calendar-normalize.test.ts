import { normalizeCalendarEvent, normalizeImportedEvents } from "@/lib/calendar/normalize";

describe("calendar normalization", () => {
  it("drops invalid ranges and enforces valid enum values", () => {
    const normalized = normalizeCalendarEvent({
      id: "evt-1",
      title: "Klausur",
      start: "2025-01-10T10:00:00.000Z",
      end: "2025-01-10T09:00:00.000Z",
      kind: "unknown",
      module: "unknown"
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.end).toBeUndefined();
    expect(normalized?.kind).toBe("exam");
    expect(normalized?.module).toBeUndefined();
  });

  it("filters invalid entries and deduplicates imported events", () => {
    const events = normalizeImportedEvents([
      {
        id: "same",
        title: "Termin 1",
        start: "2025-01-10T09:00:00.000Z",
        kind: "exam"
      },
      {
        id: "same",
        title: "Termin 2",
        start: "2025-01-10T11:00:00.000Z",
        kind: "exam"
      },
      {
        id: "bad",
        title: "Broken",
        start: "not-a-date",
        kind: "exam"
      }
    ]);

    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Termin 2");
  });
});
