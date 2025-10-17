"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, FileText, NotebookPen, TrendingUp } from "lucide-react";

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
    <div className="space-y-10">
      <section className="grid gap-4 lg:grid-cols-[1.8fr,1fr]">
        <GlassCard
          title={
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
              Modulfortschritt
            </span>
          }
          description="Notizstatus je Vorlesung und direkter Zugriff auf alle Inhalte"
          className="h-full"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {moduleNoteCount.map((module) => (
              <div
                key={module.slug}
                className="rounded-3xl border border-border/30 bg-card/50 p-4 shadow-inner backdrop-blur-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <ModuleBadge module={module.slug} />
                    <p className="text-[0.7rem] uppercase tracking-[0.3em] text-muted-foreground">{module.name}</p>
                  </div>
                  <span className="text-3xl font-semibold text-foreground">{module.count}</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {module.count === 0
                    ? "Noch keine Notizen"
                    : `${module.count} ${module.count === 1 ? "Notiz" : "Notizen"}`}
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
        <GlassCard title="Schnelle Aktionen" description="Starte neue Dokumentationen oder plane kommende Termine">
          <div className="space-y-4">
            <Button asChild className="w-full justify-between">
              <Link href="/notes">
                <span className="flex items-center gap-2">
                  <NotebookPen className="h-4 w-4" /> Neue Notiz beginnen
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between">
              <Link href="/calendar">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Kalender verwalten
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full justify-between">
              <Link href="/settings">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Backups & Exporte
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <GlassCard title="Zuletzt aktualisierte Notizen" description="Schnell zurück in laufende Projekte">
          {recentNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Notizen vorhanden.</p>
          ) : (
            <ul className="space-y-4">
              {recentNotes.map((note) => (
                <li
                  key={note.id}
                  className="rounded-3xl border border-border/30 bg-card/40 p-4 shadow-inner backdrop-blur"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-2">
                      <Link href={`/notes/${note.id}`} className="text-base font-semibold tracking-tight">
                        {note.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <ModuleBadge module={note.module} />
                        <span>
                          {formatDate(note.updatedAt)} · {formatTime(note.updatedAt)}
                        </span>
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

        <GlassCard title="Anstehende Deadlines" description="Prüfungen, Abgaben und Zwischenstände">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Noch keine Termine angelegt. Erstelle Prüfungen im Kalender.
            </p>
          ) : (
            <ul className="space-y-4">
              {upcoming.map((event) => (
                <li
                  key={event.id}
                  className="rounded-3xl border border-border/30 bg-card/40 p-4 shadow-inner backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.start)}
                        {event.end ? ` · ${formatTime(event.start)} – ${formatTime(event.end)}` : ` · ${formatTime(event.start)}`}
                      </p>
                      {event.module && <ModuleBadge module={event.module} className="mt-1" />}
                      {event.description && (
                        <p className="text-xs text-muted-foreground/90">{event.description}</p>
                      )}
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
