"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ArrowRight, Command, FilePlus2, CalendarPlus2, Clock3 } from "lucide-react";

import { Card } from "@/components/Card";
import { ModuleBadge } from "@/components/ModuleBadge";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/lib/notes";
import { getUpcomingEvents, useCalendar, expandTimetableToRange } from "@/lib/calendar";
import { formatDate, formatTime } from "@/lib/utils";
import { downloadJson } from "@/lib/storage";
import { requestOpenCommandPalette } from "@/lib/command-palette";

type TimelineItem = {
  id: string;
  title: string;
  start: string;
  end?: string;
  module?: string;
  kind: "class" | "exam" | "special";
  source: "calendar" | "timetable";
};

function makeWindowRange() {
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { start, end };
}

export default function DashboardPage() {
  const router = useRouter();
  const { notes, createNote } = useNotes();
  const { events } = useCalendar();
  const isClient = typeof window !== "undefined";

  useEffect(() => {
    document.title = "Physik Konsole - Übersicht";
  }, []);

  const nextSevenDays = useMemo<TimelineItem[]>(() => {
    const { start, end } = makeWindowRange();
    const windowStart = start.getTime();
    const windowEnd = end.getTime();

    const timetable = expandTimetableToRange(start.toISOString(), end.toISOString()).map((event) => ({
      id: `tt:${event.id}`,
      title: event.title,
      start: event.start,
      end: event.end,
      module: event.module,
      kind: "class" as const,
      source: "timetable" as const
    }));

    const customEvents = events.map((event) => ({
      id: `ev:${event.id}`,
      title: event.title,
      start: event.start,
      end: event.end,
      module: event.module,
      kind: event.kind,
      source: "calendar" as const
    }));

    return [...timetable, ...customEvents]
      .filter((item) => {
        const startTime = new Date(item.start).getTime();
        if (Number.isNaN(startTime)) return false;
        const endTime = item.end ? new Date(item.end).getTime() : startTime;
        return endTime >= windowStart && startTime <= windowEnd;
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 16);
  }, [events]);

  const staleNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
      .slice(0, 5);
  }, [notes]);

  const upcoming = getUpcomingEvents(events, 5);
  const attachmentCount = notes.reduce((acc, note) => acc + note.attachments.length, 0);
  const notesWithPdfCount = notes.filter((note) => note.attachments.length > 0).length;
  const examCountWeek = nextSevenDays.filter((event) => event.kind === "exam").length;

  const handleCreateNote = () => {
    const note = createNote();
    router.push(`/notes/${note.id}`);
  };

  const openPalette = () => {
    requestOpenCommandPalette();
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.7fr,1fr]">
        <Card
          title="COCKPIT"
          description="NÄCHSTE 7 TAGE · KLASSE, PRÜFUNG, TERMINE"
          variant="primary"
          className="h-full"
        >
          {nextSevenDays.length === 0 ? (
            <div className="border border-border p-6 text-center">
              <p className="spec-label !text-muted-foreground">KEINE EINTRÄGE IM ZEITRAUM</p>
            </div>
          ) : (
            <div className="border border-border divide-y divide-border">
              {nextSevenDays.map((item) => (
                <Link
                  key={item.id}
                  href={item.source === "calendar" ? "/calendar" : "/notes"}
                  prefetch={false}
                  className="block p-3 transition-opacity hover:opacity-70"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-[0.72rem] uppercase tracking-wider font-bold">{item.title}</p>
                    <span className="spec-label">{item.kind.toUpperCase()}</span>
                  </div>
                  <p className="spec-label font-mono" suppressHydrationWarning>
                    {isClient &&
                      `${formatDate(item.start)} · ${formatTime(item.start)}${
                        item.end ? ` – ${formatTime(item.end)}` : ""
                      }`}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card title="SCHNELLAKTIONEN" description="FLOW OHNE KLICKWEGE">
          <div className="space-y-2">
            <Button onClick={handleCreateNote} className="w-full justify-start gap-2">
              <FilePlus2 className="h-4 w-4" />
              Neue Notiz
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/calendar?new=1")}
              className="w-full justify-start gap-2"
            >
              <CalendarPlus2 className="h-4 w-4" />
              Neuer Termin
            </Button>
            <Button variant="outline" onClick={openPalette} className="w-full justify-start gap-2">
              <Command className="h-4 w-4" />
              Command Palette
            </Button>
          </div>

          <div className="border border-border mt-4">
            <div className="grid grid-cols-2 divide-x divide-border text-[0.7rem] font-mono">
              <div className="p-3">
                <div className="spec-label mb-1">NOTIZEN</div>
                <div className="text-foreground text-lg">{String(notes.length).padStart(3, "0")}</div>
              </div>
              <div className="p-3">
                <div className="spec-label mb-1">PDFS</div>
                <div className="text-foreground text-lg">{String(attachmentCount).padStart(3, "0")}</div>
              </div>
              <div className="p-3 border-t border-border">
                <div className="spec-label mb-1">NOTIZEN MIT PDF</div>
                <div className="text-foreground text-lg">{String(notesWithPdfCount).padStart(3, "0")}</div>
              </div>
              <div className="p-3 border-t border-border">
                <div className="spec-label mb-1">PRÜFUNGEN (7T)</div>
                <div className="text-foreground text-lg">{String(examCountWeek).padStart(3, "0")}</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="FOKUS NOTIZEN" description="LANGE NICHT ANGESEHEN">
          {staleNotes.length === 0 ? (
            <p className="spec-label !text-muted-foreground">ALLE NOTIZEN AKTUELL</p>
          ) : (
            <div className="border border-border divide-y divide-border">
              {staleNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="block p-3 hover:opacity-70 transition-opacity"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.72rem] uppercase font-bold tracking-wider">{note.title}</p>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <ModuleBadge module={note.module} />
                    <span className="spec-label font-mono" suppressHydrationWarning>
                      {isClient && `${formatDate(note.updatedAt)} · ${formatTime(note.updatedAt)}`}
                    </span>
                    {note.attachments.length > 0 && (
                      <span className="spec-label">{note.attachments.length} PDF</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card title="KALENDER FOKUS" description="NÄCHSTE DEADLINES">
          {upcoming.length === 0 ? (
            <p className="spec-label !text-muted-foreground">KEINE BEVORSTEHENDEN TERMINE</p>
          ) : (
            <div className="border border-border divide-y divide-border">
              {upcoming.map((event) => (
                <Link
                  key={event.id}
                  href="/calendar"
                  className="block p-3 hover:opacity-70 transition-opacity"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[0.72rem] uppercase font-bold tracking-wider">{event.title}</p>
                      <p className="spec-label font-mono mt-1" suppressHydrationWarning>
                        {isClient &&
                          `${formatDate(event.start)} · ${formatTime(event.start)}${
                            event.end ? ` – ${formatTime(event.end)}` : ""
                          }`}
                      </p>
                    </div>
                    <Clock3 className="h-4 w-4 text-primary" />
                  </div>
                  {event.module && (
                    <div className="mt-2">
                      <ModuleBadge module={event.module} />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => downloadJson("notizen-backup.json", notes)}
          className="border border-border px-4 py-3 text-left transition-opacity hover:opacity-70"
        >
          <span className="text-[0.7rem] uppercase tracking-widest font-bold">Notizen Backup exportieren</span>
        </button>
        <button
          type="button"
          onClick={() => downloadJson("termine-backup.json", events)}
          className="border border-border px-4 py-3 text-left transition-opacity hover:opacity-70"
        >
          <span className="text-[0.7rem] uppercase tracking-widest font-bold">Termine Backup exportieren</span>
        </button>
      </section>
    </div>
  );
}
