import type { CalendarEvent } from "@/types/app";
import { MODULE_NAME_MAP } from "@/lib/modules";

const CRLF = "\r\n";
const DEFAULT_PRODUCT_ID = "-//Physik Notiz-Tracker//DE";

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function formatDateValue(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function formatDateTimeValue(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function addDaysUTC(date: Date, days: number) {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function buildDescription(event: CalendarEvent) {
  const parts: string[] = [];
  if (event.description) {
    parts.push(event.description);
  }
  if (event.module) {
    parts.push(`Modul: ${MODULE_NAME_MAP[event.module]}`);
  }
  if (event.kind && event.kind !== "class") {
    parts.push(`Kategorie: ${event.kind === "exam" ? "Prüfung" : "Sondertermin"}`);
  }
  return parts.join("\n\n");
}

function buildEventBlock(event: CalendarEvent, dtStamp: string) {
  const startDate = new Date(event.start);
  if (Number.isNaN(startDate.getTime())) {
    return null;
  }

  const lines = [
    "BEGIN:VEVENT",
    `UID:${event.id}@physik-notizen`,
    `SUMMARY:${escapeText(event.title)}`,
    `DTSTAMP:${dtStamp}`
  ];

  if (event.allDay) {
    const endDate = event.end ? new Date(event.end) : addDaysUTC(startDate, 1);
    lines.push(`DTSTART;VALUE=DATE:${formatDateValue(startDate)}`);
    lines.push(`DTEND;VALUE=DATE:${formatDateValue(endDate)}`);
  } else {
    const fallbackEnd = event.end ? new Date(event.end) : addDaysUTC(startDate, 1);
    lines.push(`DTSTART:${formatDateTimeValue(startDate)}`);
    lines.push(`DTEND:${formatDateTimeValue(fallbackEnd)}`);
  }

  const description = buildDescription(event);
  if (description) {
    lines.push(`DESCRIPTION:${escapeText(description)}`);
  }

  const categories = [event.kind, event.module && MODULE_NAME_MAP[event.module]].filter(Boolean) as string[];
  if (categories.length) {
    lines.push(`CATEGORIES:${categories.map((entry) => escapeText(entry)).join(",")}`);
  }

  return `${lines.join(CRLF)}${CRLF}END:VEVENT`;
}

export interface BuildIcsOptions {
  calendarName?: string;
  productId?: string;
}

export function buildCalendarICS(events: CalendarEvent[], options: BuildIcsOptions = {}) {
  const dtStamp = formatDateTimeValue(new Date());
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${options.productId ?? DEFAULT_PRODUCT_ID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(options.calendarName ?? "Physik Notiz-Tracker")}`
  ].join(CRLF);

  const body = events
    .map((event) => buildEventBlock(event, dtStamp))
    .filter((block): block is string => Boolean(block))
    .join(CRLF);

  const footer = "END:VCALENDAR";
  return [header, body, footer].filter(Boolean).join(CRLF) + CRLF;
}
