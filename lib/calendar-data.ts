import type { CalendarEvent, TimetableEntry } from "@/types/app";

export const TIMETABLE_DATA: TimetableEntry[] = [
  {
    dow: 1,
    start: "08:15",
    end: "09:45",
    title: "Mathematik für Physiker",
    module: "mathe-physiker-1"
  },
  {
    dow: 1,
    start: "12:15",
    end: "13:45",
    title: "Laborübung Softwaretools",
    module: "software-tools"
  },
  {
    dow: 2,
    start: "08:15",
    end: "09:45",
    title: "Mathematik für Physiker",
    module: "mathe-physiker-1"
  },
  {
    dow: 2,
    start: "10:15",
    end: "11:45",
    title: "Übung Mathematik für Physiker",
    module: "mathe-physiker-1"
  },
  {
    dow: 2,
    start: "12:15",
    end: "15:15",
    title: "Praktikum Experimentalphysik",
    module: "praktikum-exp-1"
  },
  {
    dow: 4,
    start: "08:15",
    end: "09:45",
    title: "Skills für Physiker",
    module: "skills-physiker"
  },
  {
    dow: 4,
    start: "12:15",
    end: "13:45",
    title: "Experimentalphysik",
    module: "experimentalphysik-1"
  },
  {
    dow: 5,
    start: "10:15",
    end: "11:45",
    title: "Experimentalphysik",
    module: "experimentalphysik-1"
  },
  {
    dow: 5,
    start: "12:15",
    end: "13:45",
    title: "Übung Experimentalphysik",
    module: "experimentalphysik-1"
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
