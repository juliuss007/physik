"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, Save } from "lucide-react";

import { NoteEditor } from "@/components/NoteEditor";
import { NotePreview } from "@/components/NotePreview";
import { PdfExportButton } from "@/components/PdfExportButton";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { useNotes } from "@/lib/notes";
import type { Note } from "@/types/app";

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notes, updateNote, deleteNote } = useNotes();
  const [draft, setDraft] = useState<Note | null>(null);

  const note = useMemo(() => notes.find((item) => item.id === params.id), [notes, params.id]);

  useEffect(() => {
    if (note) {
      setDraft(note);
    }
  }, [note]);

  if (!note || !draft) {
    return (
      <GlassCard
        title="Notiz nicht gefunden"
        description="Die angeforderte Notiz existiert nicht oder wurde gelöscht."
        className="mx-auto max-w-xl text-center"
        footer={
          <Button onClick={() => router.push("/notes")}>Zur Notizübersicht</Button>
        }
      />
    );
  }

  const previewContainerId = `note-preview-${note.id}`;

  const handleChange = (updated: Note) => {
    setDraft({ ...updated, updatedAt: new Date().toISOString() });
  };

  const handleSave = () => {
    if (!draft) return;
    updateNote({ ...draft, updatedAt: new Date().toISOString() });
  };

  const handleDelete = () => {
    if (window.confirm("Diese Notiz wirklich löschen?")) {
      deleteNote(note.id);
      router.push("/notes");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Notiz bearbeiten</h2>
        <div className="flex flex-wrap gap-2">
          <PdfExportButton note={draft} containerId={previewContainerId} />
          <Button variant="destructive" onClick={handleDelete} className="gap-2">
            <Trash2 className="h-4 w-4" aria-hidden /> Löschen
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" aria-hidden /> Speichern
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <NoteEditor note={draft} onChange={handleChange} />
        <NotePreview note={draft} containerId={previewContainerId} />
      </div>
    </div>
  );
}
