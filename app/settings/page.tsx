"use client";

import { useState } from "react";
import { Download, Upload, Type, Palette, FileDown } from "lucide-react";

import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/lib/notes";
import { useCalendar } from "@/lib/calendar";
import { downloadJson, readFileAsJson } from "@/lib/storage";
import { useSettings } from "@/lib/settings";
import type { CalendarEvent, Note, SettingsState } from "@/types/app";

export default function SettingsPage() {
  const { notes, importNotes } = useNotes();
  const { events, importEvents } = useCalendar();
  const {
    settings: { fontScale },
    setFontScale
  } = useSettings();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBackupNotes = () => {
    downloadJson("notizen-backup.json", notes);
    setMessage("Notizen wurden exportiert.");
  };

  const handleBackupEvents = () => {
    downloadJson("events-backup.json", events);
    setMessage("Kalendereinträge wurden exportiert.");
  };

  const handleImportNotes = async (file: File) => {
    try {
      const imported = await readFileAsJson<Note[]>(file);
      importNotes(imported);
      setMessage("Notizen-Backup erfolgreich importiert.");
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Import der Notizen fehlgeschlagen.");
    }
  };

  const handleImportEvents = async (file: File) => {
    try {
      const imported = await readFileAsJson<CalendarEvent[]>(file);
      importEvents(imported);
      setMessage("Termine erfolgreich importiert.");
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Import der Termine fehlgeschlagen.");
    }
  };

  const renderFileInput = (
    id: string,
    label: string,
    onFile: (file: File) => void
  ) => (
    <label
      htmlFor={id}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-surface/60 px-4 py-3 text-sm text-slate-200 hover:bg-surface"
    >
      <Upload className="h-4 w-4 text-accent" aria-hidden />
      {label}
      <input
        id={id}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />
    </label>
  );

  const FONT_OPTIONS: SettingsState["fontScale"][] = ["sm", "md", "lg"];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Einstellungen & Sicherung</h2>
        <p className="text-sm text-muted-foreground">
          Verwalte Schriftgröße, exportiere lokale Daten und stelle Backups wieder her.
        </p>
      </header>

      <GlassCard
        title={
          <span className="inline-flex items-center gap-2">
            <FileDown className="h-4 w-4 text-primary" aria-hidden /> Backup & Restore
          </span>
        }
        description="Sichere deine lokalen Daten oder stelle sie wieder her."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Notizen</h3>
            <Button onClick={handleBackupNotes} className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Exportieren
              </span>
            </Button>
            {renderFileInput("notes-import", "Notizen-Backup importieren", handleImportNotes)}
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Kalender</h3>
            <Button onClick={handleBackupEvents} className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Exportieren
              </span>
            </Button>
            {renderFileInput("events-import", "Kalender-Backup importieren", handleImportEvents)}
          </div>
        </div>
      </GlassCard>

      <GlassCard
        title={
          <span className="inline-flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" aria-hidden /> Darstellung
          </span>
        }
        description="Passe die Schriftgröße von Editor & Vorschau an."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Type className="h-5 w-5 text-muted-foreground" aria-hidden />
          <div className="flex gap-2">
            {FONT_OPTIONS.map((option) => (
              <Button
                key={option}
                variant={fontScale === option ? "default" : "outline"}
                onClick={() => setFontScale(option)}
              >
                {option === "sm" ? "Kompakt" : option === "md" ? "Standard" : "Groß"}
              </Button>
            ))}
          </div>
        </div>
      </GlassCard>

      {(message || error) && (
        <div
          role="status"
          className={`rounded-3xl border px-4 py-3 text-sm ${error ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-primary/40 bg-primary/10 text-primary"}`}
        >
          {error ?? message}
        </div>
      )}
    </div>
  );
}
