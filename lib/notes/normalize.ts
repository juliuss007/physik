import { DEFAULT_MODULE, MODULES } from "@/lib/modules";
import { generateId } from "@/lib/utils";
import type { ModuleSlug, Note } from "@/types/app";

const MODULE_SLUGS = new Set<ModuleSlug>(MODULES.map((module) => module.slug));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeIsoDate(value: unknown, fallbackIso: string): string {
  if (typeof value !== "string") {
    return fallbackIso;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackIso;
  }

  return parsed.toISOString();
}

function normalizeModule(value: unknown): ModuleSlug {
  if (typeof value === "string" && MODULE_SLUGS.has(value as ModuleSlug)) {
    return value as ModuleSlug;
  }
  return DEFAULT_MODULE;
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const tagSet = new Set<string>();
  for (const entry of value) {
    if (typeof entry !== "string") {
      continue;
    }
    const normalized = entry.trim();
    if (!normalized) {
      continue;
    }
    tagSet.add(normalized);
  }

  return Array.from(tagSet);
}

function normalizeTitle(value: unknown): string {
  if (typeof value !== "string") {
    return "Neue Notiz";
  }

  const title = value.trim();
  return title || "Neue Notiz";
}

function normalizeContent(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeId(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return generateId("note");
}

export function sortNotesByUpdatedAtDesc(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    return bTime - aTime;
  });
}

export function normalizeNote(value: unknown): Note | null {
  if (!isRecord(value)) {
    return null;
  }

  const nowIso = new Date().toISOString();
  const createdAt = normalizeIsoDate(value.createdAt, nowIso);
  let updatedAt = normalizeIsoDate(value.updatedAt, createdAt);

  if (new Date(updatedAt).getTime() < new Date(createdAt).getTime()) {
    updatedAt = createdAt;
  }

  return {
    id: normalizeId(value.id),
    title: normalizeTitle(value.title),
    module: normalizeModule(value.module),
    tags: normalizeTags(value.tags),
    content: normalizeContent(value.content),
    createdAt,
    updatedAt
  };
}

export function normalizeImportedNotes(input: unknown): Note[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const byId = new Map<string, Note>();

  for (const entry of input) {
    const note = normalizeNote(entry);
    if (!note) {
      continue;
    }

    const existing = byId.get(note.id);
    if (!existing) {
      byId.set(note.id, note);
      continue;
    }

    if (new Date(note.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
      byId.set(note.id, note);
    }
  }

  return sortNotesByUpdatedAtDesc(Array.from(byId.values()));
}
