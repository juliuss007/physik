"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Check } from "lucide-react";
import { MODULES } from "@/lib/modules";
import type { ModuleSlug } from "@/types/app";
import { cn } from "@/lib/utils";

interface MobileModuleFilterProps {
  selected: ModuleSlug | null;
  onSelect: (module: ModuleSlug | null) => void;
}

export function MobileModuleFilter({ selected, onSelect }: MobileModuleFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const selectedModule = MODULES.find((m) => m.slug === selected);

  return (
    <>
      {/* Sticky Filter Bar */}
      <div className="sticky top-[73px] z-20 -mx-6 mb-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-3 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between border border-border bg-card px-4 py-3 text-left transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold tracking-widest uppercase text-foreground">
              {selectedModule ? selectedModule.name : "ALLE MODULE"}
            </span>
          </div>
          <span className="spec-label text-primary">[ÄNDERN]</span>
        </button>
      </div>

      {/* Full Screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-background/90 backdrop-blur-sm lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
              <span className="spec-label text-lg">FILTER</span>
              <button
                onClick={() => setIsOpen(false)}
                className="border border-border p-2 text-foreground hover:bg-muted active:bg-primary active:text-background transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-3">
                <button
                  onClick={() => {
                    onSelect(null);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "group relative flex w-full items-center justify-between border p-4 text-left transition-all active:scale-[0.98]",
                    selected === null
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  <span className={cn(
                    "text-sm font-bold tracking-widest uppercase",
                    selected === null ? "text-primary" : "text-foreground"
                  )}>
                    ALLE ANZEIGEN
                  </span>
                  {selected === null && <Check className="h-5 w-5 text-primary" />}
                  
                  {/* Corner accents */}
                  <div className="absolute -left-[1px] -top-[1px] h-2 w-2 border-l border-t border-transparent group-hover:border-primary transition-colors" />
                  <div className="absolute -bottom-[1px] -right-[1px] h-2 w-2 border-b border-r border-transparent group-hover:border-primary transition-colors" />
                </button>

                {MODULES.map((module) => (
                  <button
                    key={module.slug}
                    onClick={() => {
                      onSelect(module.slug);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "group relative flex w-full items-center justify-between border p-4 text-left transition-all active:scale-[0.98]",
                      selected === module.slug
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "text-sm font-bold tracking-widest uppercase",
                        selected === module.slug ? "text-primary" : "text-foreground"
                      )}>
                        {module.name}
                      </span>
                      <span className="spec-label">{module.slug}</span>
                    </div>
                    {selected === module.slug && <Check className="h-5 w-5 text-primary" />}

                    {/* Corner accents */}
                    <div className="absolute -left-[1px] -top-[1px] h-2 w-2 border-l border-t border-transparent group-hover:border-primary transition-colors" />
                    <div className="absolute -bottom-[1px] -right-[1px] h-2 w-2 border-b border-r border-transparent group-hover:border-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Footer Decoration */}
            <div className="border-t border-border bg-background p-4 text-center">
              <span className="spec-label">PHYSIK KONSOLE V1.0</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
