"use client";

import type { ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<HTMLMotionProps<"section">, "title" | "children"> {
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  variant?: "default" | "primary";
  animationDelay?: number;
}

export function GlassCard({
  title,
  description,
  footer,
  variant = "default",
  animationDelay = 0,
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.15,
        delay: animationDelay
      }}
      className={cn(
        "border border-border bg-card p-0 text-foreground",
        variant === "primary" && "border-primary",
        className
      )}
      {...props}
    >
      {/* Header */}
      {(title || description) && (
        <header className="border-b border-border p-4">
          {title && (
            <h2 className="text-xs font-bold tracking-widest uppercase text-foreground mb-1">
              {title}
            </h2>
          )}
          {description && (
            <p className="spec-label !text-muted-foreground">
              {description}
            </p>
          )}
        </header>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">{children}</div>

      {/* Footer */}
      {footer && (
        <footer className="border-t border-border p-4 text-[0.7rem] text-muted-foreground">
          {footer}
        </footer>
      )}
    </motion.section>
  );
}
