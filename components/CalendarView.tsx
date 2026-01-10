"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const shouldAutoOpen = searchParams?.get("new") === "1";
  const [dialogOpen, setDialogOpen] = useState(() => shouldAutoOpen);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [draftRange, setDraftRange] = useState<{ start: string; end: string } | undefined>(() => {
    if (!shouldAutoOpen) return undefined;
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { start: start.toISOString(), end: end.toISOString() };
  });

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
        backgroundColor: event.kind === "exam" ? "#008533" : "#660066", // GREEN for exams (darkened), MAGENTA for special
        borderColor: event.kind === "exam" ? "#008533" : "#660066",
        className: `fc-${event.kind}-event`
      })),
    [events]
  );

  const legendModules = useMemo(() => {
    const seen = new Set<ModuleSlug>();
    return TIMETABLE_DATA.filter((entry) => {
      if (seen.has(entry.module)) return false;
      seen.add(entry.module);
      return true;
    });
  }, []);

  const openNewEventDialog = useCallback((base?: Date) => {
    setSelectedEvent(null);
    const start = base ?? new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setDraftRange({ start: start.toISOString(), end: end.toISOString() });
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    if (!shouldAutoOpen) return;
    router.replace("/calendar", { scroll: false });
  }, [shouldAutoOpen, router]);

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
          onClick={() => openNewEventDialog()}
          className="no-print"
        >
          Ereignis hinzufügen
        </Button>
      </div>
      <div className="border border-border bg-card p-4">
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
      <legend className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3" style={{ backgroundColor: "#008533" }} /> Prüfung
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3" style={{ backgroundColor: "#660066" }} /> Sondertermin
        </span>
        {legendModules.map((entry) => (
          <span key={entry.module} className="flex items-center gap-2">
            <span className="h-3 w-3" style={{ backgroundColor: MODULE_COLOR_MAP[entry.module] }} />
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
