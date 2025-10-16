import type { CalendarEvent, TimetableEntry } from "@/types/app";

export const TIMETABLE_DATA: TimetableEntry[] = [
  {
    dow: 1,
    start: "08:30",
    end: "10:00",
    title: "Vorlesung Experimentalphysik I",
    module: "experimentalphysik-1",
    location: "Hörsaal 1"
  },
  {
    dow: 2,
    start: "10:30",
    end: "12:00",
    title: "Übung Mathematik für Physiker I",
    module: "mathe-physiker-1",
    location: "Seminarraum M2"
  },
  {
    dow: 3,
    start: "13:00",
    end: "15:30",
    title: "Praktikum Experimentalphysik I",
    module: "praktikum-exp-1",
    location: "Labor C"
  },
  {
    dow: 4,
    start: "09:00",
    end: "11:00",
    title: "Vorlesung Mathematik für Physiker I",
    module: "mathe-physiker-1",
    location: "Hörsaal 3"
  },
  {
    dow: 5,
    start: "11:15",
    end: "13:00",
    title: "Einführungspraktikum Physik",
    module: "einfuehrungspraktikum",
    location: "Labor A"
  }
];

export const TIMETABLE = TIMETABLE_DATA;

export function expandTimetableToRange(startISO: string, endISO: string): CalendarEvent[] {
  const startDate = new Date(startISO);
  const endDate = new Date(endISO);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return [];
  }

  if (endDate.getTime() < startDate.getTime()) {
    return [];
  }

  const events: CalendarEvent[] = [];
  const cursor = new Date(startDate);

  while (cursor.getTime() <= endDate.getTime()) {
    const jsDay = cursor.getDay();
    const timetableDow = jsDay === 0 ? 7 : jsDay;
    const datePart = cursor.toISOString().split("T")[0];

    TIMETABLE_DATA.forEach((entry) => {
      if (entry.dow !== timetableDow) {
        return;
      }

      const startDateTime = new Date(`${datePart}T${entry.start}:00`);
      const endDateTime = new Date(`${datePart}T${entry.end}:00`);

      events.push({
        id: `class-${entry.module}-${datePart}-${entry.start}`,
        title: entry.title,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        allDay: false,
        module: entry.module,
        kind: "class",
        description: entry.location ? `Ort: ${entry.location}` : undefined
      });
    });

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return events;
}
