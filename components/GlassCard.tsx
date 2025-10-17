import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
}

export function GlassCard({ title, description, footer, className, children, ...props }: GlassCardProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border/40 bg-card/60 p-6 text-foreground shadow-glass backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {(title || description) && (
        <header className="mb-5 space-y-2">
          {title && <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </header>
      )}
      <div className="space-y-4 text-foreground">{children}</div>
      {footer && <footer className="mt-6 flex items-center justify-end gap-3 text-sm text-muted-foreground">{footer}</footer>}
    </section>
  );
}
