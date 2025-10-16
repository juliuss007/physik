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
    <aside className="glass-muted h-full min-w-[220px] rounded-2xl p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Module</h2>
      <nav className="flex flex-col gap-2" aria-label="Modulfilter">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "rounded-lg px-3 py-2 text-left text-sm transition-colors",
            selected === null ? "bg-accent/20 text-accent" : "hover:bg-surface/70"
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
              "rounded-lg px-3 py-2 text-left text-sm transition-colors",
              selected === module.slug ? "bg-accent/30 text-accent" : "hover:bg-surface/70"
            )}
          >
            <span className="flex items-center gap-3">
              <span
                className="h-2 w-2 rounded-full"
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
