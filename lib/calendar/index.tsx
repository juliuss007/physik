"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";

import type { CalendarEvent } from "@/types/app";
import { loadFromStorage, saveToStorage } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { MODULE_NAME_MAP } from "@/lib/modules";

export { TIMETABLE, TIMETABLE_DATA, expandTimetableToRange } from "@/lib/calendar-data";

export const EVENTS_STORAGE_KEY = "physik-calendar-events";

interface CalendarState {
  events: CalendarEvent[];
}

type CalendarAction =
  | { type: "create"; payload: CalendarEvent }
  | { type: "update"; payload: CalendarEvent }
  | { type: "delete"; id: string }
  | { type: "bulk-set"; payload: CalendarEvent[] };

const initialState: CalendarState = {
  events: []
};

function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case "create":
      return { events: [...state.events, action.payload] };
    case "update":
      return {
        events: state.events.map((event) => (event.id === action.payload.id ? { ...action.payload } : event))
      };
    case "delete":
      return { events: state.events.filter((event) => event.id !== action.id) };
    case "bulk-set":
      return { events: [...action.payload] };
    default:
      return state;
  }
}

interface CalendarContextValue {
  events: CalendarEvent[];
  createEvent: (event: Omit<CalendarEvent, "id" | "kind"> & { kind?: CalendarEvent["kind"] }) => CalendarEvent;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  importEvents: (events: CalendarEvent[]) => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

function ensureKind(kind?: CalendarEvent["kind"]): CalendarEvent["kind"] {
  return kind ?? "exam";
}

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(calendarReducer, initialState, () => {
    const stored = loadFromStorage<CalendarEvent[]>(EVENTS_STORAGE_KEY, []);
    return { events: stored } satisfies CalendarState;
  });

  useEffect(() => {
    saveToStorage(EVENTS_STORAGE_KEY, state.events);
  }, [state.events]);

  const createEvent = useCallback(
    (partial: Omit<CalendarEvent, "id" | "kind"> & { kind?: CalendarEvent["kind"] }) => {
      const event: CalendarEvent = {
        id: generateId("event"),
        title: partial.title,
        start: partial.start,
        end: partial.end,
        allDay: partial.allDay,
        module: partial.module,
        kind: ensureKind(partial.kind),
        description: partial.description
      };
      dispatch({ type: "create", payload: event });
      return event;
    },
    []
  );

  const updateEvent = useCallback((event: CalendarEvent) => {
    dispatch({ type: "update", payload: event });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    dispatch({ type: "delete", id });
  }, []);

  const importEvents = useCallback((events: CalendarEvent[]) => {
    dispatch({ type: "bulk-set", payload: events });
  }, []);

  const value = useMemo(
    () => ({ events: state.events, createEvent, updateEvent, deleteEvent, importEvents }),
    [state.events, createEvent, updateEvent, deleteEvent, importEvents]
  );

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar muss innerhalb von <CalendarProvider> genutzt werden");
  }
  return context;
}

export function getModuleLabel(module?: CalendarEvent["module"]) {
  if (!module) return undefined;
  return MODULE_NAME_MAP[module];
}

export function getUpcomingEvents(events: CalendarEvent[], limit = 4) {
  return [...events]
    .filter((event) => event.kind !== "class")
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, limit);
}
