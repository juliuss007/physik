"use client";

import { useId } from "react";

import { MODULES } from "@/lib/modules";
import type { Note } from "@/types/app";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NoteEditorProps {
  note: Note;
  onChange: (note: Note) => void;
}

export function NoteEditor({ note, onChange }: NoteEditorProps) {
  const titleId = useId();
  const moduleId = useId();
  const tagsId = useId();
  const contentId = useId();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor={titleId}>Titel</Label>
        <Input
          id={titleId}
          aria-label="Titel der Notiz"
          value={note.title}
          onChange={(event) => onChange({ ...note, title: event.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={moduleId}>Modul</Label>
          <select
            id={moduleId}
            aria-label="Modulauswahl"
            value={note.module}
            onChange={(event) => onChange({ ...note, module: event.target.value as Note["module"] })}
            className="h-10 w-full border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            {MODULES.map((module) => (
              <option key={module.slug} value={module.slug} className="bg-card">
                {module.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={tagsId}>Tags (Kommagetrennt)</Label>
          <Input
            id={tagsId}
            aria-label="Tags für die Notiz"
            value={note.tags.join(", ")}
            onChange={(event) =>
              onChange({
                ...note,
                tags: event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              })
            }
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor={contentId}>Inhalt (Markdown + LaTeX)</Label>
        <Textarea
          id={contentId}
          aria-label="Markdown Editor"
          className="min-h-[480px] resize-vertical font-mono text-sm"
          value={note.content}
          onChange={(event) => onChange({ ...note, content: event.target.value })}
          spellCheck={false}
        />
      </div>
      <p className="spec-label">
        Aktualisiert: {new Date(note.updatedAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}
      </p>
    </div>
  );
}
