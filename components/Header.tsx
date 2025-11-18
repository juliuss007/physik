"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { NotebookPen, Calendar, Settings, LayoutDashboard } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { href: "/" as Route, label: "Dashboard", icon: LayoutDashboard },
  { href: "/notes" as Route, label: "Notizen", icon: NotebookPen },
  { href: "/calendar" as Route, label: "Kalender", icon: Calendar },
  { href: "/settings" as Route, label: "Einstellungen", icon: Settings }
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="shrink-0">
          <p className="spec-label">Physik</p>
          <h1 className="text-2xl font-semibold text-foreground">Notiz- & Prüfungs-Tracker</h1>
        </div>
        <nav
          aria-label="Hauptnavigation"
          className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end"
        >
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 min-w-[calc(50%-0.25rem)] items-center justify-center gap-2 border border-border px-3 py-2 text-sm transition-colors uppercase tracking-wide font-semibold md:min-w-0 md:flex-none md:px-4",
                  isActive ? "bg-primary text-background" : "hover:bg-muted text-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
