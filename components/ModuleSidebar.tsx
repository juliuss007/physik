"use client";

import { MODULES } from "@/lib/modules";
import type { ModuleSlug } from "@/types/app";
import { cn } from "@/lib/utils";

interface ModuleSidebarProps {
  selected: ModuleSlug | null;
  onSelect: (module: ModuleSlug | null) => void;
}

export function ModuleSidebar({ selected, onSelect }: ModuleSidebarProps) {
  return (
    <aside className="rounded-3xl border border-border/40 bg-card/40 p-4 backdrop-blur-xl">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Vorlesungen</h2>
      <nav className="flex flex-col gap-1.5" aria-label="Modulfilter">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "rounded-2xl px-4 py-2 text-left text-sm transition-colors",
            selected === null
              ? "bg-primary/10 text-primary shadow-glow"
              : "bg-transparent text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          )}
        >
          Alle Notizen
        </button>
        {MODULES.map((module) => (
          <button
            key={module.slug}
            type="button"
            onClick={() => onSelect(module.slug)}
            className={cn(
              "rounded-2xl px-4 py-2 text-left text-sm transition-colors",
              selected === module.slug
                ? "bg-primary/10 text-primary shadow-glow"
                : "bg-transparent text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: module.color }}
                aria-hidden
              />
              {module.name}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
