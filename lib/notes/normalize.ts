import { DEFAULT_MODULE, MODULES } from "@/lib/modules";
import { generateId } from "@/lib/utils";
import type { ModuleSlug, Note, NoteAttachment } from "@/types/app";

const MODULE_SLUGS = new Set<ModuleSlug>(MODULES.map((module) => module.slug));
const MAX_ATTACHMENT_TEXT_CHARS = 20_000;

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

function normalizeNumber(value: unknown, fallback = 0): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }
  return value;
}

function normalizeAttachment(value: unknown): NoteAttachment | null {
  if (!isRecord(value)) {
    return null;
  }

  const nowIso = new Date().toISOString();
  const id =
    typeof value.id === "string" && value.id.trim() ? value.id.trim() : generateId("pdf");
  const fileName =
    typeof value.fileName === "string" && value.fileName.trim()
      ? value.fileName.trim()
      : "Anhang.pdf";
  const mimeType =
    typeof value.mimeType === "string" && value.mimeType.trim()
      ? value.mimeType.trim()
      : "application/pdf";
  const size = Math.max(0, normalizeNumber(value.size, 0));
  const pages = Math.max(0, Math.floor(normalizeNumber(value.pages, 0)));
  const uploadedAt = normalizeIsoDate(value.uploadedAt, nowIso);

  let extractedText: string | undefined;
  if (typeof value.extractedText === "string") {
    const normalizedText = value.extractedText.trim();
    if (normalizedText) {
      extractedText = normalizedText.slice(0, MAX_ATTACHMENT_TEXT_CHARS);
    }
  }

  return {
    id,
    fileName,
    mimeType,
    size,
    pages,
    uploadedAt,
    extractedText
  };
}

function normalizeAttachments(value: unknown): NoteAttachment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const byId = new Map<string, NoteAttachment>();
  for (const entry of value) {
    const attachment = normalizeAttachment(entry);
    if (!attachment) {
      continue;
    }
    byId.set(attachment.id, attachment);
  }

  return Array.from(byId.values()).sort((a, b) => {
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });
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
    attachments: normalizeAttachments(value.attachments),
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
