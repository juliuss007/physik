import { MODULES } from "@/lib/modules";
import { generateId } from "@/lib/utils";
import type { CalendarEvent, ModuleSlug } from "@/types/app";

const MODULE_SLUGS = new Set<ModuleSlug>(MODULES.map((module) => module.slug));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeIsoDate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function normalizeKind(value: unknown, fallback: CalendarEvent["kind"]): CalendarEvent["kind"] {
  if (value === "class" || value === "exam" || value === "special") {
    return value;
  }
  return fallback;
}

function normalizeModule(value: unknown): ModuleSlug | undefined {
  if (typeof value === "string" && MODULE_SLUGS.has(value as ModuleSlug)) {
    return value as ModuleSlug;
  }
  return undefined;
}

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized || undefined;
}

function normalizeId(value: unknown, allowGeneratedId: boolean): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  if (allowGeneratedId) {
    return generateId("event");
  }
  return null;
}

export interface NormalizeCalendarEventOptions {
  allowGeneratedId?: boolean;
  fallbackKind?: CalendarEvent["kind"];
}

export function normalizeCalendarEvent(
  value: unknown,
  options: NormalizeCalendarEventOptions = {}
): CalendarEvent | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = normalizeId(value.id, options.allowGeneratedId ?? false);
  const title = normalizeText(value.title);
  const start = normalizeIsoDate(value.start);

  if (!id || !title || !start) {
    return null;
  }

  const parsedStart = new Date(start).getTime();
  let end: string | undefined = normalizeIsoDate(value.end) ?? undefined;

  if (end && new Date(end).getTime() < parsedStart) {
    end = undefined;
  }

  const fallbackKind = options.fallbackKind ?? "exam";
  const allDayValue = typeof value.allDay === "boolean" ? value.allDay : false;

  return {
    id,
    title,
    start,
    end,
    allDay: end ? allDayValue : allDayValue || false,
    module: normalizeModule(value.module),
    kind: normalizeKind(value.kind, fallbackKind),
    description: normalizeText(value.description)
  };
}

export function sortCalendarEventsByStartAsc(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}

export function normalizeImportedEvents(input: unknown): CalendarEvent[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const byId = new Map<string, CalendarEvent>();
  for (const entry of input) {
    const event = normalizeCalendarEvent(entry);
    if (!event) {
      continue;
    }
    byId.set(event.id, event);
  }

  return sortCalendarEventsByStartAsc(Array.from(byId.values()));
}
