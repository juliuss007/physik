"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarDays, LayoutDashboard, NotebookPen, Settings, Shield } from "lucide-react";
import { ReactNode, Suspense } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { MiniCalendar } from "@/components/layout/MiniCalendar";

const navigation = [
  { href: "/" as const, label: "ÜBERSICHT", code: "00", icon: LayoutDashboard },
  { href: "/notes" as const, label: "NOTIZEN", code: "01", icon: NotebookPen },
  { href: "/calendar" as const, label: "KALENDER", code: "02", icon: CalendarDays },
  { href: "/settings" as const, label: "EINSTELLUNGEN", code: "03", icon: Settings },
  { href: "/admin" as const, label: "ADMIN", code: "04", icon: Shield }
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 pb-12 pt-8">
      {/* Scanline overlay for CRT monitor effect */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-scanline opacity-100" aria-hidden />

      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col gap-0 border border-border bg-card"
      >
        <div className="flex flex-col gap-0 lg:flex-row">
          {/* Main header section */}
          <div className="flex-1 border-r border-border p-6">
            <h1 className="text-xl font-bold tracking-widest text-foreground uppercase mb-2">
              PHYSIK STUDIUM-DASHBOARD
            </h1>
            <p className="spec-label !text-muted-foreground">
              VORLESUNGEN · LABOR · PRÜFUNGEN
            </p>
          </div>

          {/* Mini calendar panel */}
          <div className="w-full lg:w-80">
            <div className="border-b border-border px-4 py-2">
              <span className="spec-label">KALENDER</span>
            </div>
            <div className="p-4">
              <Suspense fallback={<div className="h-44 w-full flex items-center justify-center spec-label">LÄDT...</div>}>
                <MiniCalendar />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-border flex" aria-label="Hauptnavigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 border-r last:border-r-0 border-border px-4 py-3 text-[0.7rem] font-bold tracking-widest uppercase text-center text-muted-foreground transition-opacity hover:opacity-70 cursor-pointer",
                  isActive && "border-b-2 border-b-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </motion.header>

      <main className="relative mt-8 flex-1 space-y-6">{children}</main>
    </div>
  );
}
