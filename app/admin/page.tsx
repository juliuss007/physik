"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Download, FilePlus2, Import, Trash2 } from "lucide-react";

import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/lib/notes";
import { useCalendar } from "@/lib/calendar";
import { downloadJson, readFileAsJson } from "@/lib/storage";
import type { CalendarEvent, Note } from "@/types/app";

export default function AdminPage() {
  const router = useRouter();
  const { notes, createNote, deleteNote, importNotes } = useNotes();
  const { events, importEvents } = useCalendar();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleCreate = () => {
    const note = createNote();
    router.push(`/notes/${note.id}`);
  };

  const handleDuplicate = (id: string) => {
    const note = notes.find((item) => item.id === id);
    if (!note) return;
    const copy = createNote({
      title: `${note.title} (Kopie)`,
      content: note.content,
      module: note.module,
      tags: note.tags
    });
    router.push(`/notes/${copy.id}`);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Diese Notiz wirklich löschen?");
    if (!confirmed) return;
    setIsDeleting(id);
    deleteNote(id);
    setIsDeleting(null);
    router.push("/notes");
  };

  const handleExport = () => {
    downloadJson("notizen-backup.json", notes);
  };

  const handleExportEvents = () => {
    downloadJson("events-backup.json", events);
  };

  const handleImportNotes = async (file: File) => {
    const imported = await readFileAsJson<Note[]>(file);
    importNotes(imported);
  };

  const handleImportEvents = async (file: File) => {
    const imported = await readFileAsJson<CalendarEvent[]>(file);
    importEvents(imported);
  };

  const renderImport = (id: string, label: string, onFile: (file: File) => Promise<void>) => (
    <label
      htmlFor={id}
      className="flex w-full cursor-pointer items-center gap-2 rounded-full border border-border/40 bg-card/40 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <Import className="h-4 w-4" aria-hidden />
      {label}
      <input
        id={id}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) await onFile(file);
          event.target.value = "";
        }}
      />
    </label>
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Admin · Notizverwaltung</h2>
        <p className="text-sm text-muted-foreground">
          Erstelle, dupliziere oder verwalte Notizen und sichere vollständige Backups.
        </p>
      </header>

      <GlassCard title="Werkzeuge" description="Direkte Aktionen für Notizen und Kalender">
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCreate} className="gap-2">
            <FilePlus2 className="h-4 w-4" aria-hidden /> Neue Notiz
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" aria-hidden /> Notizen exportieren
          </Button>
          <Button onClick={handleExportEvents} variant="outline" className="gap-2">
            <Download className="h-4 w-4" aria-hidden /> Termine exportieren
          </Button>
          {renderImport("notes-import", "Notizen importieren", handleImportNotes)}
          {renderImport("events-import", "Termine importieren", handleImportEvents)}
        </div>
      </GlassCard>

      <GlassCard title="Alle Notizen" description="Schnelle Verwaltung pro Eintrag">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Noch keine Notizen vorhanden.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/30 bg-card/40 p-4 backdrop-blur"
              >
                <div className="space-y-1">
                  <Link href={`/notes/${note.id}`} className="text-base font-semibold tracking-tight">
                    {note.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{note.module}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/notes/${note.id}`}>
                      Öffnen
                      <ArrowRight className="ml-1 h-3 w-3" aria-hidden />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicate(note.id)}>
                    Duplizieren
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleDelete(note.id)}
                    disabled={isDeleting === note.id}
                  >
                    <Trash2 className="h-3 w-3" aria-hidden /> Löschen
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
