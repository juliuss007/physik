"use client";

import dynamic from "next/dynamic";

const CalendarView = dynamic(
  () => import("@/components/CalendarView").then((mod) => mod.CalendarView),
  {
    ssr: false,
    loading: () => <div className="text-sm text-muted-foreground">Kalender wird geladen …</div>
  }
);

export function CalendarViewClient() {
  return <CalendarView />;
}
