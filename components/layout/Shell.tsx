"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarDays, LayoutDashboard, NotebookPen, Settings, Shield } from "lucide-react";
import { ReactNode, Suspense } from "react";

import { cn } from "@/lib/utils";
import { MiniCalendar } from "@/components/layout/MiniCalendar";

const navigation = [
  { href: "/" as const, label: "Übersicht", icon: LayoutDashboard },
  { href: "/notes" as const, label: "Notizen", icon: NotebookPen },
  { href: "/calendar" as const, label: "Kalender", icon: CalendarDays },
  { href: "/settings" as const, label: "Einstellungen", icon: Settings },
  { href: "/admin" as const, label: "Admin", icon: Shield }
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-5 pb-12 pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-noise opacity-10" aria-hidden />
      <header className="flex flex-col gap-8 rounded-3xl border border-border/40 bg-card/50 p-8 backdrop-blur-xl shadow-glass">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.6em] text-muted-foreground">Physikarchiv</p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Notizen · Forschung · Zeitplan</h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Organisiere Vorlesungsnotizen, Laborprotokolle und Prüfungspläne über ein einheitliches Interface.
            </p>
          </div>
          <div className="w-full max-w-xs rounded-2xl border border-border/40 bg-card/70 p-4 backdrop-blur-lg">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Kalender</span>
              <span>Diese Woche</span>
            </div>
            <Suspense fallback={<div className="mt-3 h-44 w-full animate-pulse rounded-xl bg-secondary/40" />}>
              <MiniCalendar />
            </Suspense>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Hauptnavigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "border-border/40 bg-card/40 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="relative mt-10 flex-1 space-y-8">{children}</main>
    </div>
  );
}
