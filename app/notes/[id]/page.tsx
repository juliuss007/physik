"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { Trash2, Save } from "lucide-react";

import { NoteEditor } from "@/components/NoteEditor";
import { PdfExportButton } from "@/components/PdfExportButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/Card";
import { useNotes } from "@/lib/notes";
import type { Note } from "@/types/app";

const NotePreview = dynamic(
  () => import("@/components/NotePreview").then((mod) => mod.NotePreview),
  {
    ssr: false,
    loading: () => (
      <div className="border border-border bg-card p-6 text-sm text-muted-foreground">
        Vorschau wird geladen …
      </div>
    )
  }
);

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notes, updateNote, deleteNote } = useNotes();

  const note = useMemo(() => notes.find((item) => item.id === params.id), [notes, params.id]);

  useEffect(() => {
    document.title = note ? `Physik Konsole - ${note.title || "Notiz"}` : "Physik Konsole - Notiz";
  }, [note]);

  if (!note) {
    return (
      <Card
        title="Notiz nicht gefunden"
        description="Die angeforderte Notiz existiert nicht oder wurde gelöscht."
        className="mx-auto max-w-xl text-center"
        footer={
          <Button onClick={() => router.push("/notes")}>Zur Notizübersicht</Button>
        }
      />
    );
  }

  return (
    <NoteDetailContent key={note.id} note={note} updateNote={updateNote} deleteNote={deleteNote} />
  );
}

interface NoteDetailContentProps {
  note: Note;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
}

function NoteDetailContent({ note, updateNote, deleteNote }: NoteDetailContentProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<Note>(() => note);
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
          <PdfExportButton note={draft} />
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
