"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode, Suspense, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { MiniCalendar } from "@/components/layout/MiniCalendar";
import { APP_NAVIGATION } from "@/lib/navigation";
import { CommandPalette } from "@/components/CommandPalette";
import { requestOpenCommandPalette } from "@/lib/command-palette";

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [time, setTime] = useState<string>("");

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];
      setTime(`${date} // ${timeStr}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const activeItem = APP_NAVIGATION.find(item => 
    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

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
          <div className="flex-1 border-r border-border p-6 flex items-center justify-between lg:block">
            <div>
              <h1 className="text-xl font-bold tracking-widest text-foreground uppercase mb-2 hidden lg:block">
                Physik Konsole
              </h1>
              <p className="spec-label !text-muted-foreground hidden lg:block">
                VORLESUNGEN · LABOR · PRÜFUNGEN
              </p>
              <div className="hidden lg:block mt-4">
                <CommandPalette />
              </div>
              
              {/* Mobile Header Content */}
              <div className="lg:hidden flex items-center justify-between h-full">
                <div className="flex flex-col justify-center">
                  <span className="spec-label mb-1">PHYSIK KONSOLE</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-primary font-mono text-xl font-bold">
                      {activeItem ? activeItem.code : "00"}
                    </span>
                    <span className="text-foreground font-bold tracking-widest uppercase">
                      {"//"} {activeItem ? activeItem.label : "ÜBERSICHT"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Mobile Menu Trigger - Absolute Position */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden absolute top-6 right-6 border border-border bg-card px-4 py-3 text-[0.7rem] font-bold tracking-widest uppercase text-foreground hover:bg-primary hover:text-background transition-colors z-40"
              >
                [ MENÜ ]
              </button>
            </div>
          </div>

          {/* Mini calendar panel (Desktop only) */}
          <div className="hidden lg:block w-full lg:w-80">
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
        <div className="border-t border-border">
          {/* Desktop Nav */}
          <nav className="hidden lg:flex" aria-label="Hauptnavigation">
            {APP_NAVIGATION.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex-1 border-r last:border-r-0 border-border px-4 py-3 text-[0.7rem] font-bold tracking-widest uppercase text-center text-muted-foreground transition-opacity hover:opacity-70 cursor-pointer",
                    isActive && "border-b-2 border-b-primary text-foreground"
                  )}
                >
                  <span className="mr-2 text-primary/50">{item.code}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Nav Trigger Placeholder to maintain layout if needed, but absolute positioning handles it now */}
        </div>
      </motion.header>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-6">
              <div>
                <p className="spec-label mb-1">SYSTEM NAVIGATION</p>
                <h1 className="text-xl font-bold tracking-widest text-foreground uppercase">
                  MENÜ AUSWAHL
                </h1>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="border border-border bg-card px-4 py-3 text-[0.7rem] font-bold tracking-widest uppercase text-foreground hover:bg-primary hover:text-background transition-colors"
              >
                [ SCHLIESSEN ]
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-6 space-y-4">
              {APP_NAVIGATION.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "group flex items-center justify-between border-b border-border pb-4 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-lg font-bold opacity-50 group-hover:opacity-100 transition-opacity">
                        {item.code}
                      </span>
                      <span className="text-2xl font-bold tracking-widest uppercase">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border p-6 bg-card/50">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  requestOpenCommandPalette();
                }}
                className="mb-3 w-full border border-border px-4 py-3 text-[0.7rem] font-bold tracking-widest uppercase text-foreground hover:bg-primary hover:text-background transition-colors"
              >
                [ COMMAND PALETTE ]
              </button>
              <div className="flex justify-between text-[0.6rem] text-muted-foreground font-mono uppercase tracking-wider">
                <span>{time || "INITIALIZING..."}</span>
                <span>SECURE CONNECTION</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative mt-8 flex-1 space-y-6">{children}</main>
    </div>
  );
}
