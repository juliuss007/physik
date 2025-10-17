"use client";

import { useMemo } from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";

import { useCalendar } from "@/lib/calendar";
import { cn } from "@/lib/utils";


export function MiniCalendar() {
  const { events } = useCalendar();

  const selectedDays = useMemo(() => {
    const dates = events.map((event) => new Date(event.start));
    return dates.length ? dates : undefined;
  }, [events]);

  return (
    <DayPicker
      locale={{ ...fr }}
      selected={selectedDays}
      showOutsideDays
      numberOfMonths={1}
      className={cn(
        "mt-3 rounded-2xl border border-border/30 bg-card/60 p-3 text-foreground shadow-inner backdrop-blur-sm",
        "[&_.rdp-months]:grid [&_.rdp-months]:justify-items-center",
        "[&_.rdp-table]:w-full [&_.rdp-head_cell]:text-[0.65rem] [&_.rdp-head_cell]:text-muted-foreground",
        "[&_.rdp-day]:h-8 [&_.rdp-day]:w-8 [&_.rdp-day]:rounded-full [&_.rdp-day]:text-xs",
        "[&_.rdp-day_selected]:bg-primary [&_.rdp-day_selected]:text-primary-foreground",
        "[&_.rdp-day_today]:border [&_.rdp-day_today]:border-primary/70"
      )}
    />
  );
}
