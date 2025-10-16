"use client";

import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventInput } from "@fullcalendar/core";

import { Button } from "@/components/ui/button";
import { EventDialog } from "@/components/EventDialog";
import { MODULE_COLOR_MAP, MODULE_NAME_MAP } from "@/lib/modules";
import { TIMETABLE_DATA, useCalendar } from "@/lib/calendar";
import type { CalendarEvent, ModuleSlug } from "@/types/app";

export function CalendarView() {
  const { events, createEvent, updateEvent, deleteEvent } = useCalendar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [draftRange, setDraftRange] = useState<{ start: string; end: string } | undefined>();
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    const loadStyles = async () => {
      try {
        const version = "6.1.19";
        const urls = [
          `https://cdn.jsdelivr.net/npm/@fullcalendar/core@${version}/index.global.min.css`,
          `https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@${version}/index.global.min.css`,
          `https://cdn.jsdelivr.net/npm/@fullcalendar/timegrid@${version}/index.global.min.css`
        ];

        await Promise.all(
          urls.map((href) => {
            if (document.querySelector(`link[data-fc-css="${href}"]`)) {
              return Promise.resolve();
            }
            return new Promise<void>((resolve, reject) => {
              const link = document.createElement("link");
              link.rel = "stylesheet";
              link.href = href;
              link.dataset.fcCss = href;
              link.onload = () => resolve();
              link.onerror = () => reject(new Error(`Konnte ${href} nicht laden`));
              document.head.appendChild(link);
            });
          })
        );
      } catch (error) {
        console.error("FullCalendar styles konnten nicht geladen werden", error);
      } finally {
        setStylesLoaded(true);
      }
    };
    loadStyles();
  }, []);

  if (!stylesLoaded) {
    return (
      <div className="glass p-6 text-sm text-slate-300">
        Kalender wird geladen …
      </div>
    );
  }

  const timetableEvents = useMemo<EventInput[]>(
    () =>
      TIMETABLE_DATA.map((entry) => ({
        id: `class-${entry.dow}-${entry.start}-${entry.module}`,
        title: `${entry.title}${entry.location ? ` • ${entry.location}` : ""}`,
        daysOfWeek: [entry.dow],
        startTime: entry.start,
        endTime: entry.end,
        display: "block",
        className: "fc-class-session",
        extendedProps: {
          kind: "class",
          module: entry.module
        },
        backgroundColor: MODULE_COLOR_MAP[entry.module],
        borderColor: MODULE_COLOR_MAP[entry.module]
      })),
    []
  );

  const dynamicEvents = useMemo<EventInput[]>(
    () =>
      events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay,
        extendedProps: event,
        backgroundColor: event.kind === "exam" ? "#8b5cf6" : "#22d3ee",
        borderColor: event.kind === "exam" ? "#c084fc" : "#22d3ee",
        className: `fc-${event.kind}-event`
      })),
    [events]
  );

  const handleSelect = (selection: DateSelectArg) => {
    setDraftRange({
      start: selection.start.toISOString(),
      end: selection.end ? selection.end.toISOString() : selection.start.toISOString()
    });
    setSelectedEvent(null);
    setDialogOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const calendarEvent = events.find((event) => event.id === clickInfo.event.id);
    if (!calendarEvent) return;
    setSelectedEvent(calendarEvent);
    setDraftRange(undefined);
    setDialogOpen(true);
  };

  const handleCreateOrUpdate = (data: Omit<CalendarEvent, "id"> & { id?: string }) => {
    if (data.id) {
      updateEvent({ ...(data as CalendarEvent) });
    } else {
      createEvent(data);
    }
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Kalender</h2>
          <p className="text-sm text-slate-300">Vorlesungen, Praktika und eigene Prüfungen im Blick.</p>
        </div>
        <Button
          onClick={() => {
            setSelectedEvent(null);
            const now = new Date();
            const end = new Date(now.getTime() + 60 * 60 * 1000);
            setDraftRange({ start: now.toISOString(), end: end.toISOString() });
            setDialogOpen(true);
          }}
          className="no-print"
        >
          Ereignis hinzufügen
        </Button>
      </div>
      <div className="glass p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek"
          }}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          locale="de"
          selectable
          selectMirror
          select={handleSelect}
          eventClick={handleEventClick}
          events={[...timetableEvents, ...dynamicEvents]}
          height="auto"
          eventDidMount={(info) => {
            const kind = info.event.extendedProps.kind as CalendarEvent["kind"] | undefined;
            const moduleSlug = info.event.extendedProps.module as ModuleSlug | undefined;
            if (kind && kind !== "class") {
              info.el.setAttribute(
                "aria-label",
                `${info.event.title} • ${new Date(info.event.startStr).toLocaleString("de-DE")}`
              );
            }
            if (kind === "class" && moduleSlug) {
              info.el.setAttribute("aria-label", `${info.event.title} (${MODULE_NAME_MAP[moduleSlug]})`);
            }
          }}
        />
      </div>
      <legend className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded" style={{ backgroundColor: "#8b5cf6" }} /> Prüfung
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded" style={{ backgroundColor: "#22d3ee" }} /> Sondertermin
        </span>
        {TIMETABLE_DATA.map((entry) => (
          <span key={entry.title} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded" style={{ backgroundColor: MODULE_COLOR_MAP[entry.module] }} />
            {MODULE_NAME_MAP[entry.module]}
          </span>
        ))}
      </legend>
      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={selectedEvent ?? undefined}
        defaultTimes={draftRange}
        onSubmit={handleCreateOrUpdate}
        onDelete={selectedEvent ? handleDelete : undefined}
      />
    </div>
  );
}
