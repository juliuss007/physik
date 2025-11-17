"use client";

import { useMemo } from "react";
import { useCalendar } from "@/lib/calendar";

export function MiniCalendar() {
  const { events } = useCalendar();

  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Adjust to start on Monday (German standard)
    const firstDayOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    // Get days from previous month
    const prevMonthDays = new Date(year, month, 0).getDate();
    const prevMonthStart = prevMonthDays - firstDayOffset + 1;

    // Build calendar grid
    const days: Array<{ day: number; isCurrentMonth: boolean; isToday: boolean; hasEvent: boolean }> = [];

    // Previous month days
    for (let i = 0; i < firstDayOffset; i++) {
      days.push({ day: prevMonthStart + i, isCurrentMonth: false, isToday: false, hasEvent: false });
    }

    // Current month days
    const eventDays = new Set(
      events
        .filter((e) => {
          const eventDate = new Date(e.start);
          return eventDate.getMonth() === month && eventDate.getFullYear() === year;
        })
        .map((e) => new Date(e.start).getDate())
    );

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: i === today,
        hasEvent: eventDays.has(i)
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, isToday: false, hasEvent: false });
    }

    return {
      monthName: firstDay.toLocaleString("de-DE", { month: "long", year: "numeric" }),
      days: days.slice(0, 35) // Show max 5 weeks
    };
  }, [events]);

  const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  return (
    <div className="w-full">
      <div className="mb-3 text-[0.75rem] font-bold uppercase tracking-widest text-foreground">
        {calendarData.monthName}
      </div>
      <div className="grid grid-cols-7 gap-0">
        {weekDays.map((day) => (
          <div
            key={day}
            className="pb-2 text-center text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {calendarData.days.map((dayInfo, idx) => (
          <div
            key={idx}
            className={`
              flex h-8 items-center justify-center text-[0.75rem] font-mono
              ${dayInfo.isCurrentMonth ? "text-foreground" : "text-muted-foreground opacity-40"}
              ${dayInfo.isToday ? "bg-primary text-background font-bold border border-primary" : ""}
              ${dayInfo.hasEvent && !dayInfo.isToday ? "bg-muted" : ""}
            `}
          >
            {dayInfo.day}
          </div>
        ))}
      </div>
    </div>
  );
}
