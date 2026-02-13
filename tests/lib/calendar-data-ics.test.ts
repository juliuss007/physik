import { expandTimetableToRange } from "@/lib/calendar-data";
import { buildCalendarICS } from "@/lib/calendar/ics";
import type { CalendarEvent } from "@/types/app";

describe("calendar timetable expansion", () => {
  it("returns no events for invalid ranges", () => {
    expect(expandTimetableToRange("invalid", "2025-01-06T23:59:59.000Z")).toEqual([]);
    expect(expandTimetableToRange("2025-01-07T00:00:00.000Z", "2025-01-06T00:00:00.000Z")).toEqual([]);
  });

  it("expands timetable entries into dated class events", () => {
    const events = expandTimetableToRange("2025-01-06T00:00:00.000Z", "2025-01-07T23:59:59.000Z");

    expect(events.length).toBe(5);
    expect(events.every((event) => event.kind === "class")).toBe(true);
    expect(events.every((event) => !Number.isNaN(new Date(event.start).getTime()))).toBe(true);
    expect(events.every((event) => !Number.isNaN(new Date(event.end ?? "").getTime()))).toBe(true);
  });
});

describe("ICS generation", () => {
  it("escapes text and formats all-day events", () => {
    const events: CalendarEvent[] = [
      {
        id: "evt-1",
        title: "Klausur, Teil 1; wichtig",
        start: "2025-01-10T09:00:00.000Z",
        end: "2025-01-10T11:00:00.000Z",
        kind: "exam",
        description: "Raum A\\B"
      },
      {
        id: "evt-2",
        title: "Ganztags-Event",
        start: "2025-01-11T00:00:00.000Z",
        allDay: true,
        kind: "special"
      },
      {
        id: "evt-invalid",
        title: "Broken",
        start: "not-a-date",
        kind: "exam"
      }
    ];

    const ics = buildCalendarICS(events, { calendarName: "Mein Kalender" });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("X-WR-CALNAME:Mein Kalender");
    expect(ics).toContain("SUMMARY:Klausur\\, Teil 1\\; wichtig");
    expect(ics).toContain("DESCRIPTION:Raum A\\\\B");
    expect(ics).toContain("DTSTART;VALUE=DATE:20250111");
    expect(ics).toContain("DTEND;VALUE=DATE:20250112");
    expect(ics).not.toContain("UID:evt-invalid@physik-notizen");
  });
});
