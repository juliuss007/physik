"use client";

import { useEffect, useState } from "react";
import { Download, Upload, Type, Palette, FileDown, CalendarDays } from "lucide-react";

import { Card } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/lib/notes";
import { useCalendar } from "@/lib/calendar";
import { downloadJson, downloadTextFile, readFileAsJson } from "@/lib/storage";
import { useSettings } from "@/lib/settings";
import { buildCalendarICS } from "@/lib/calendar/ics";
import type { CalendarEvent, Note, SettingsState } from "@/types/app";

export default function SettingsPage() {
  const { notes, importNotes } = useNotes();
  const { events, importEvents } = useCalendar();
  const {
    settings: { theme },
    setTheme
  } = useSettings();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Physikonsole - Einstellungen";
  }, []);

  const handleBackupNotes = () => {
    downloadJson("notizen-backup.json", notes);
    setMessage("Notizen wurden exportiert.");
    setError(null);
  };

  const handleBackupEvents = () => {
    downloadJson("events-backup.json", events);
    setMessage("Kalendereinträge wurden exportiert.");
    setError(null);
  };

  const handleExportEventsIcs = () => {
    const ics = buildCalendarICS(events, { calendarName: "Physik Kalender" });
    downloadTextFile("termine.ics", ics, "text/calendar");
    setMessage("iCal-Datei wurde erstellt.");
    setError(null);
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
      className="flex w-full cursor-pointer items-center gap-3 border border-border bg-card px-4 py-3 text-[0.7rem] text-foreground uppercase tracking-wider font-bold transition-opacity hover:opacity-70"
    >
      <Upload className="h-3.5 w-3.5" aria-hidden />
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

  const THEME_OPTIONS: SettingsState["theme"][] = ["dark", "light"];

  return (
    <div className="space-y-4">
      <div className="border border-border p-4">
        <h2 className="text-sm font-bold tracking-widest uppercase text-foreground">EINSTELLUNGEN</h2>
        <p className="spec-label !text-muted-foreground mt-1">
          DATENSICHERUNG & KONFIGURATION
        </p>
      </div>

      <Card
        title="BACKUP & RESTORE"
        description="LOKALE DATEN SICHERN UND WIEDERHERSTELLEN"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="spec-label">NOTIZEN</h3>
            <Button onClick={handleBackupNotes} className="w-full">
              EXPORTIEREN
            </Button>
            {renderFileInput("notes-import", "Importieren", handleImportNotes)}
          </div>
          <div className="space-y-3">
            <h3 className="spec-label">KALENDER</h3>
            <Button onClick={handleBackupEvents} className="w-full">
              EXPORTIEREN
            </Button>
            <Button onClick={handleExportEventsIcs} variant="outline" className="w-full">
              iCal (.ics)
            </Button>
            {renderFileInput("events-import", "Importieren", handleImportEvents)}
          </div>
        </div>
      </Card>

      <Card
        title="DARSTELLUNG"
        description="FARBSCHEMA"
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {THEME_OPTIONS.map((option) => (
              <Button
                key={option}
                variant={theme === option ? "default" : "outline"}
                onClick={() => setTheme(option)}
              >
                {option === "dark" ? "DARK" : "LIGHT"}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {(message || error) && (
        <div
          role="status"
          className={`border px-4 py-3 text-[0.7rem] uppercase tracking-wider ${error ? "border-destructive bg-destructive/10 text-destructive" : "border-primary bg-muted text-foreground"}`}
        >
          {error ?? message}
        </div>
      )}
    </div>
  );
}
