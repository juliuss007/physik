import { CalendarView } from "@/components/CalendarView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Physik Konsole - Kalender",
};

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <div className="border border-border p-4">
        <h2 className="text-sm font-bold tracking-widest uppercase text-foreground">KALENDER</h2>
        <p className="spec-label !text-muted-foreground mt-1">
          PRÜFUNGEN · PRAKTIKA · DEADLINES
        </p>
      </div>
      <div className="border border-border bg-card p-6">
        <CalendarView />
      </div>
    </div>
  );
}
