"use client";

import { CalendarProvider } from "@/lib/calendar";
import { NotesProvider } from "@/lib/notes";
import { SettingsProvider } from "@/lib/settings";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <NotesProvider>
        <CalendarProvider>{children}</CalendarProvider>
      </NotesProvider>
    </SettingsProvider>
  );
}
