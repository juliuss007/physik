"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Download, FilePlus2, Import, Trash2 } from "lucide-react";

import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/lib/notes";
import { useCalendar } from "@/lib/calendar";
import { buildCalendarICS } from "@/lib/calendar/ics";
import { downloadJson, downloadTextFile, readFileAsJson } from "@/lib/storage";
import type { CalendarEvent, Note } from "@/types/app";

export default function AdminPage() {
  const router = useRouter();
  const { notes, createNote, deleteNote, importNotes } = useNotes();
  const { events, importEvents } = useCalendar();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Physik Konsole - Admin";
  }, []);

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

  const handleExportEventsIcs = () => {
    const ics = buildCalendarICS(events, { calendarName: "Physik Kalender" });
    downloadTextFile("termine.ics", ics, "text/calendar");
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
      className="flex cursor-pointer items-center gap-2 border border-border bg-card px-4 py-2.5 text-[0.7rem] uppercase tracking-wider font-bold text-muted-foreground transition-opacity hover:opacity-70"
    >
      <Import className="h-3.5 w-3.5" aria-hidden />
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
    <div className="space-y-4">
      <div className="border border-border p-4">
        <h2 className="text-sm font-bold tracking-widest uppercase text-foreground">ADMIN</h2>
        <p className="spec-label !text-muted-foreground mt-1">
          NOTIZEN & DATENVERWALTUNG
        </p>
      </div>

      <Card title="WERKZEUGE" description="AKTIONEN FÜR NOTIZEN UND KALENDER">
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreate}>
            NEUE NOTIZ
          </Button>
          <Button onClick={handleExport} variant="outline">
            NOTIZEN EXPORTIEREN
          </Button>
          <Button onClick={handleExportEvents} variant="outline">
            TERMINE EXPORTIEREN
          </Button>
          <Button onClick={handleExportEventsIcs} variant="outline">
            iCal (.ics)
          </Button>
          {renderImport("notes-import", "NOTIZEN IMPORTIEREN", handleImportNotes)}
          {renderImport("events-import", "TERMINE IMPORTIEREN", handleImportEvents)}
        </div>
      </Card>

      <Card title="ALLE NOTIZEN" description="VERWALTUNG & BEARBEITUNG">
        {notes.length === 0 ? (
          <div className="border border-border p-6 text-center">
            <p className="spec-label !text-muted-foreground">KEINE NOTIZEN</p>
          </div>
        ) : (
          <div className="border border-border divide-y divide-border">
            {notes.map((note) => (
              <div
                key={note.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-muted/10 transition-colors"
              >
                <div className="space-y-1">
                  <Link href={`/notes/${note.id}`} className="text-sm font-bold uppercase tracking-wide text-foreground hover:text-foreground/80">
                    {note.title}
                  </Link>
                  <p className="spec-label">{note.module}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/notes/${note.id}`}>
                      ÖFFNEN
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicate(note.id)}>
                    DUPLIZIEREN
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(note.id)}
                    disabled={isDeleting === note.id}
                  >
                    LÖSCHEN
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
