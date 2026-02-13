"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";

import type { Note } from "@/types/app";
import { DEFAULT_MODULE } from "@/lib/modules";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { normalizeImportedNotes, normalizeNote, sortNotesByUpdatedAtDesc } from "@/lib/notes/normalize";
import { deletePdfAttachmentBlobs } from "@/lib/pdf-attachments";

const NOTES_STORAGE_KEY = "physik-notes";

interface NotesState {
  notes: Note[];
}

type NotesAction =
  | { type: "create"; payload: Note }
  | { type: "update"; payload: Note }
  | { type: "delete"; id: string }
  | { type: "bulk-set"; payload: Note[] };

const initialState: NotesState = {
  notes: []
};

function createEmptyNote(partial: Partial<Note> = {}): Note {
  const now = new Date().toISOString();
  return {
    id: generateId("note"),
    title: partial.title ?? "Neue Notiz",
    module: partial.module ?? DEFAULT_MODULE,
    tags: partial.tags ?? [],
    content: partial.content ?? "",
    attachments: partial.attachments ?? [],
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now
  };
}

function noteReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case "create": {
      return { notes: [action.payload, ...state.notes] };
    }
    case "update": {
      return {
        notes: sortNotesByUpdatedAtDesc(
          state.notes.map((note) => (note.id === action.payload.id ? { ...action.payload } : note))
        )
      };
    }
    case "delete": {
      return { notes: state.notes.filter((note) => note.id !== action.id) };
    }
    case "bulk-set": {
      return {
        notes: sortNotesByUpdatedAtDesc(action.payload)
      };
    }
    default:
      return state;
  }
}

interface NotesContextValue {
  notes: Note[];
  createNote: (partial?: Partial<Note>) => Note;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string) => Note | undefined;
  importNotes: (notes: Note[]) => number;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(noteReducer, initialState, (init) => {
    const stored = normalizeImportedNotes(loadFromStorage<unknown>(NOTES_STORAGE_KEY, []));
    if (!stored.length) {
      const starter = createEmptyNote({
        title: "Willkommen beim Notiz-Tracker",
        tags: ["intro"],
        content:
          "## Erste Schritte\n\n- Wähle links deine Module aus\n- Nutze **Markdown** und $\\LaTeX$ zur Darstellung\n- Exportiere Notizen als PDF für Prüfungsunterlagen\n\n$$E = mc^2$$",
        module: DEFAULT_MODULE
      });
      return { notes: [starter] } satisfies NotesState;
    }
    return { notes: stored } satisfies NotesState;
  });

  useEffect(() => {
    saveToStorage(NOTES_STORAGE_KEY, state.notes);
  }, [state.notes]);

  const createNote = useCallback((partial?: Partial<Note>) => {
    const note = createEmptyNote(partial);
    dispatch({ type: "create", payload: note });
    return note;
  }, []);

  const updateNote = useCallback((note: Note) => {
    const normalized = normalizeNote(note);
    if (!normalized) return;
    dispatch({ type: "update", payload: normalized });
  }, []);

  const deleteNote = useCallback((id: string) => {
    const existing = state.notes.find((note) => note.id === id);
    const attachmentIds = existing?.attachments.map((attachment) => attachment.id) ?? [];
    void deletePdfAttachmentBlobs(attachmentIds);
    dispatch({ type: "delete", id });
  }, [state.notes]);

  const duplicateNote = useCallback(
    (id: string) => {
      const original = state.notes.find((note) => note.id === id);
      if (!original) return undefined;
      const copy: Note = {
        ...original,
        id: generateId("note"),
        title: `${original.title} (Kopie)`,
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dispatch({ type: "create", payload: copy });
      return copy;
    },
    [state.notes]
  );

  const importNotes = useCallback((notes: Note[]) => {
    const normalized = normalizeImportedNotes(notes);
    dispatch({ type: "bulk-set", payload: normalized });
    return normalized.length;
  }, []);

  const value = useMemo(
    () => ({ notes: state.notes, createNote, updateNote, deleteNote, duplicateNote, importNotes }),
    [state.notes, createNote, updateNote, deleteNote, duplicateNote, importNotes]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes muss innerhalb von <NotesProvider> verwendet werden");
  }
  return context;
}

export function useNote(id: string | undefined) {
  const { notes } = useNotes();
  return notes.find((note) => note.id === id);
}

export function searchNotes(notes: Note[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return notes;
  }

  return notes.filter((note) => {
    const attachmentMatch = note.attachments.some((attachment) => {
      return (
        attachment.fileName.toLowerCase().includes(normalized) ||
        attachment.extractedText?.toLowerCase().includes(normalized)
      );
    });

    return (
      note.title.toLowerCase().includes(normalized) ||
      note.content.toLowerCase().includes(normalized) ||
      note.tags.some((tag) => tag.toLowerCase().includes(normalized)) ||
      attachmentMatch
    );
  });
}

export function filterNotesByModule(notes: Note[], module: string | null) {
  if (!module) return notes;
  return notes.filter((note) => note.module === module);
}

export function filterNotesByTags(notes: Note[], tags: string[]) {
  if (!tags.length) return notes;
  const tagSet = new Set(tags.map((tag) => tag.toLowerCase()));
  return notes.filter((note) => note.tags.some((tag) => tagSet.has(tag.toLowerCase())));
}
