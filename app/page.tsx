"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, FileText } from "lucide-react";

import { GlassCard } from "@/components/GlassCard";
import { ModuleBadge } from "@/components/ModuleBadge";
import { MODULES } from "@/lib/modules";
import { useNotes } from "@/lib/notes";
import { getUpcomingEvents, useCalendar } from "@/lib/calendar";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";

export default function DashboardPage() {
  const { notes } = useNotes();
  const { events } = useCalendar();

  const moduleNoteCount = MODULES.map((module) => ({
    ...module,
    count: notes.filter((note) => note.module === module.slug).length
  }));

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const upcoming = getUpcomingEvents(events, 5);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <GlassCard
          title="Modulübersicht"
          description="Fortschritt und Notizstatus für jedes Modul"
          className="h-full"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {moduleNoteCount.map((module) => (
              <div key={module.slug} className="glass-muted rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <ModuleBadge module={module.slug} />
                  <span className="text-2xl font-semibold text-slate-100">{module.count}</span>
                </div>
                <p className="mt-4 text-sm text-slate-300">
                  {module.count === 0
                    ? "Noch keine Notizen."
                    : `${module.count} ${module.count === 1 ? "Notiz" : "Notizen"}.`}
                </p>
                <Button asChild variant="ghost" className="mt-4 w-full justify-between">
                  <Link href={`/notes?module=${module.slug}`} aria-label={`${module.name} Notizen öffnen`}>
                    Notizen ansehen
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard
          title="Schnelle Aktionen"
          description="Starte eine neue Notiz oder plane Prüfungen"
        >
          <div className="space-y-4">
            <Button asChild className="w-full justify-between">
              <Link href="/notes">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Neue Notiz starten
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/calendar">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Kalender öffnen
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <GlassCard title="Zuletzt bearbeitete Notizen" description="Direkter Zugriff auf deine Arbeit">
          {recentNotes.length === 0 ? (
            <p className="text-sm text-slate-400">Noch keine Notizen vorhanden.</p>
          ) : (
            <ul className="space-y-3">
              {recentNotes.map((note) => (
                <li key={note.id} className="rounded-xl border border-border/60 bg-surface/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      <Link href={`/notes/${note.id}`} className="text-base font-semibold text-slate-100">
                        {note.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <ModuleBadge module={note.module} />
                        <span>Bearbeitet am {formatDate(note.updatedAt)} um {formatTime(note.updatedAt)}</span>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/notes/${note.id}`}>Weiterarbeiten</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Anstehende Prüfungen & Termine" description="Halte Deadlines im Blick">
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-400">
              Noch keine Termine angelegt. Erstelle Prüfungen im Kalender.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((event) => (
                <li key={event.id} className="rounded-xl border border-border/60 bg-surface/60 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-slate-100">{event.title}</p>
                      <p className="text-sm text-slate-300">
                        {formatDate(event.start)} {event.end ? `• ${formatTime(event.start)} – ${formatTime(event.end)}` : `• ${formatTime(event.start)}`}
                      </p>
                      {event.module && <ModuleBadge module={event.module} className="mt-2" />}
                      {event.description && <p className="mt-2 text-xs text-slate-400">{event.description}</p>}
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/calendar">Details</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </section>
    </div>
  );
}
