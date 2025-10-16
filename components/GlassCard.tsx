import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
}

export function GlassCard({ title, description, footer, className, children, ...props }: GlassCardProps) {
  return (
    <section className={cn("glass p-6", className)} {...props}>
      {(title || description) && (
        <header className="mb-5 space-y-1">
          {title && <h2 className="text-xl font-semibold text-slate-50">{title}</h2>}
          {description && <p className="text-sm text-slate-300">{description}</p>}
        </header>
      )}
      <div className="space-y-4 text-slate-100">{children}</div>
      {footer && <footer className="mt-6 flex items-center justify-end gap-3 text-sm">{footer}</footer>}
    </section>
  );
}
