"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 uppercase tracking-wider transition-opacity cursor-pointer",
  {
    variants: {
      variant: {
        default: "border border-primary bg-card text-foreground hover:opacity-70",
        outline:
          "border border-border bg-card text-foreground hover:opacity-70",
        ghost: "text-muted-foreground border border-transparent hover:opacity-70",
        destructive: "border border-destructive bg-card text-foreground hover:opacity-70",
        light: "border border-border bg-card text-foreground hover:opacity-70"
      },
      size: {
        default: "h-10 px-5 text-[0.7rem]",
        sm: "h-8 px-4 text-[0.65rem]",
        lg: "h-12 px-6 text-[0.75rem]",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
