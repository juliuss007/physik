"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, FileText, NotebookPen, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import { Card } from "@/components/Card";
import { ModuleBadge } from "@/components/ModuleBadge";
import { MODULES } from "@/lib/modules";
import { useNotes } from "@/lib/notes";
import { getUpcomingEvents, useCalendar } from "@/lib/calendar";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";
import { downloadJson } from "@/lib/storage";

export default function DashboardPage() {
  const router = useRouter();
  const { notes, createNote } = useNotes();
  const { events } = useCalendar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "Physik Konsole - Übersicht";
  }, []);

  const moduleNoteCount = MODULES.map((module, index) => ({
    ...module,
    code: `MOD-${String(index + 1).padStart(2, '0')}`,
    count: notes.filter((note) => note.module === module.slug).length
  }));

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const upcoming = getUpcomingEvents(events, 5);

  const handleCreateNote = () => {
    const note = createNote();
    router.push(`/notes/${note.id}`);
  };

  const handleExportNotes = () => {
    downloadJson("notizen-backup.json", notes);
  };

  const handleExportEvents = () => {
    downloadJson("termine-backup.json", events);
  };

  return (
    <div className="space-y-6">
      {/* Main grid - module status and quick actions */}
      <section className="grid gap-4 lg:grid-cols-[1.8fr,1fr]">
        <Card
          title="MODULE"
          description="NOTIZEN PRO VORLESUNG"
          variant="default"
          animationDelay={0}
          className="h-full"
        >
          <div className="border border-border divide-y divide-border">
            {moduleNoteCount.map((module) => (
              <div key={module.slug} className="flex items-center justify-between p-3">
                <span className="spec-label">{module.name}</span>
                <span className="text-foreground font-mono text-sm">{String(module.count).padStart(3, '0')}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="AKTIONEN"
          variant="default"
          animationDelay={0.1}
        >
          <div className="border border-border divide-y divide-border">
            <button
              type="button"
              onClick={handleCreateNote}
              className="w-full block p-4 transition-opacity hover:opacity-70 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] uppercase tracking-widest text-foreground font-bold">NEUE NOTIZ</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </button>
            <Link href="/calendar" className="block p-4 transition-opacity hover:opacity-70 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] uppercase tracking-widest text-foreground font-bold">NEUEN KALENDEREINTRAG HINZUFÜGEN</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </Link>
            <button
              type="button"
              onClick={handleExportNotes}
              className="w-full block p-4 transition-opacity hover:opacity-70 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] uppercase tracking-widest text-foreground font-bold">NOTIZEN EXPORTIEREN</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </button>
            <button
              type="button"
              onClick={handleExportEvents}
              className="w-full block p-4 transition-opacity hover:opacity-70 cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] uppercase tracking-widest text-foreground font-bold">TERMINE EXPORTIEREN</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </button>
          </div>

          {/* System status */}
          <div className="border border-border mt-4">
            <div className="border-b border-border px-4 py-2">
              <div className="flex items-center justify-between">
                <span className="spec-label">STATUS</span>
                <span className="spec-label text-primary">■ AKTIV</span>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border text-[0.7rem] font-mono">
              <div className="p-3">
                <div className="spec-label mb-1">NOTIZEN</div>
                <div className="text-foreground text-lg">{String(notes.length).padStart(3, '0')}</div>
              </div>
              <div className="p-3">
                <div className="spec-label mb-1">TERMINE</div>
                <div className="text-foreground text-lg">{String(events.length).padStart(3, '0')}</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Recent entries and upcoming events */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card
          title="NOTIZEN"
          description="ZULETZT BEARBEITET"
          variant="default"
          animationDelay={0.2}
        >
          {recentNotes.length === 0 ? (
            <div className="border border-border p-6 text-center">
              <p className="spec-label !text-muted-foreground">KEINE EINTRÄGE</p>
            </div>
          ) : (
            <div className="border border-border divide-y divide-border">
              {recentNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="block p-4 transition-opacity hover:opacity-70 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="text-sm font-bold tracking-wide uppercase text-foreground flex-1">
                      {note.title}
                    </span>
                    <span className="spec-label">→</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <ModuleBadge module={note.module} />
                    <span className="spec-label font-mono" suppressHydrationWarning>
                      {mounted && `${formatDate(note.updatedAt)} · ${formatTime(note.updatedAt)}`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="TERMINE"
          description="ANSTEHENDE DEADLINES"
          variant="default"
          animationDelay={0.25}
        >
          {upcoming.length === 0 ? (
            <div className="border border-border p-6 text-center">
              <p className="spec-label !text-muted-foreground">KEINE TERMINE</p>
            </div>
          ) : (
            <div className="border border-border divide-y divide-border">
              {upcoming.map((event) => (
                <Link
                  key={event.id}
                  href="/calendar"
                  className="block p-4 transition-opacity hover:opacity-70 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <span className="text-sm font-bold uppercase text-foreground tracking-wide flex-1">{event.title}</span>
                    <span className="spec-label">→</span>
                  </div>
                  <div className="space-y-2">
                    <p className="spec-label !text-muted-foreground font-mono" suppressHydrationWarning>
                      {mounted && (
                        <>
                          {formatDate(event.start)}
                          {event.end ? ` · ${formatTime(event.start)} – ${formatTime(event.end)}` : ` · ${formatTime(event.start)}`}
                        </>
                      )}
                    </p>
                    {event.module && <ModuleBadge module={event.module} />}
                    {event.description && (
                      <p className="text-[0.7rem] text-muted-foreground pl-2 border-l border-border">{event.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
