import { CalendarView } from "@/components/CalendarView";
import { GlassCard } from "@/components/GlassCard";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">Kalender & Termine</h2>
        <p className="text-sm text-muted-foreground">
          Plane Prüfungen, Praktika und Deadlines. Ereignisse werden automatisch im Dashboard hervorgehoben.
        </p>
      </header>
      <GlassCard>
        <CalendarView />
      </GlassCard>
    </div>
  );
}
