import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isBrowser() {
  return typeof window !== "undefined";
}

export function generateId(prefix = "id") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short"
  });
  return formatter.format(date);
}

export function formatDate(iso: string) {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium"
  });
  return formatter.format(date);
}

export function formatTime(iso: string) {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat("de-DE", {
    timeStyle: "short"
  });
  return formatter.format(date);
}
