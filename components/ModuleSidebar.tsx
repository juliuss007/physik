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
    <aside className="border border-border bg-card">
      <div className="border-b border-border p-3">
        <h2 className="spec-label">FILTER</h2>
      </div>
      <nav className="divide-y divide-border" aria-label="Modulfilter">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "w-full px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider font-bold text-muted-foreground transition-opacity hover:opacity-70 cursor-pointer",
            selected === null && "border-l-2 border-l-primary"
          )}
        >
          ALLE
        </button>
        {MODULES.map((module) => (
          <button
            key={module.slug}
            type="button"
            onClick={() => onSelect(module.slug)}
            className={cn(
              "w-full px-4 py-3 text-left text-[0.7rem] uppercase tracking-wider font-bold text-muted-foreground transition-opacity hover:opacity-70 cursor-pointer",
              selected === module.slug && "border-l-2 border-l-primary"
            )}
          >
            {module.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
