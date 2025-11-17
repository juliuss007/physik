import { MODULE_NAME_MAP } from "@/lib/modules";
import type { ModuleSlug } from "@/types/app";
import { cn } from "@/lib/utils";

interface ModuleBadgeProps {
  module: ModuleSlug;
  className?: string;
}

export function ModuleBadge({ module, className }: ModuleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border border-border px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-widest text-foreground",
        className
      )}
    >
      <span className="h-1 w-1 bg-foreground" aria-hidden />
      {MODULE_NAME_MAP[module]}
    </span>
  );
}
