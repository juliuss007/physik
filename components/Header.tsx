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
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Physik</p>
          <h1 className="text-2xl font-semibold text-slate-100">Notiz- & Prüfungs-Tracker</h1>
        </div>
        <nav aria-label="Hauptnavigation" className="flex items-center gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-full border border-border/50 px-4 py-2 text-sm transition-colors",
                  isActive ? "bg-accent/30 text-accent" : "hover:bg-surface/70"
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
