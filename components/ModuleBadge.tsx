import { MODULE_COLOR_MAP, MODULE_NAME_MAP } from "@/lib/modules";
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
        "inline-flex items-center gap-2 rounded-full border border-card/40 bg-card/30 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.3em]",
        className
      )}
      style={{ borderColor: MODULE_COLOR_MAP[module], color: MODULE_COLOR_MAP[module] }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: MODULE_COLOR_MAP[module] }} aria-hidden />
      {MODULE_NAME_MAP[module]}
    </span>
  );
}
