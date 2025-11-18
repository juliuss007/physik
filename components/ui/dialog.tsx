"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-40 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
        className
      )}
      {...props}
    />
  )
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const matchesElementType = (child: React.ReactElement, target: React.ElementType) => {
  if (child.type === target) return true;
  const displayName = (child.type as { displayName?: string }).displayName;
  return Boolean(displayName && displayName === (target as { displayName?: string }).displayName);
};

const containsType = (children: React.ReactNode, target: React.ElementType): boolean => {
  return React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false;
    if (matchesElementType(child, target)) return true;
    return containsType(child.props.children, target);
  });
};

const DialogContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(
  ({ className, children, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, ...props }, ref) => {
    const [fallbackTitleId] = React.useState(() => `dialog-title-${Math.random().toString(36).slice(2)}`);
    const [fallbackDescriptionId] = React.useState(() => `dialog-description-${Math.random().toString(36).slice(2)}`);

    const hasTitle = containsType(children, DialogPrimitive.Title);
    const hasDescription = containsType(children, DialogPrimitive.Description);

    const labelledBy = ariaLabelledBy ?? (!hasTitle ? fallbackTitleId : undefined);
    const describedBy = ariaDescribedBy ?? (!hasDescription ? fallbackDescriptionId : undefined);

    return (
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className
          )}
          {...props}
        >
          {!hasTitle && (
            <DialogPrimitive.Title id={labelledBy} className="sr-only">
              Dialog
            </DialogPrimitive.Title>
          )}
          {!hasDescription && (
            <DialogPrimitive.Description id={describedBy} className="sr-only">
              Dialoginhalt
            </DialogPrimitive.Description>
          )}
          {children}
          <DialogPrimitive.Close asChild>
            <Button
              aria-label="Dialog schließen"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 h-8 w-8"
            >
              ×
            </Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);

const DialogTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
  )
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
};
