export type ModuleSlug =
  | "experimentalphysik-1"
  | "mathe-physiker-1"
  | "praktikum-exp-1"
  | "einfuehrungspraktikum"
  | "mathematische-methoden"
  | "software-tools";

export interface Note {
  id: string;
  title: string;
  module: ModuleSlug;
  tags: string[];
  content: string;
  updatedAt: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  module?: ModuleSlug;
  kind: "class" | "exam" | "special";
  description?: string;
}

export interface TimetableEntry {
  dow: number;
  start: string;
  end: string;
  title: string;
  module: ModuleSlug;
  location?: string;
}

export interface SettingsState {
  theme: "dark" | "light";
}

declare module "html2pdf.js";
