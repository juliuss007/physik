"use client";

import type { Note } from "@/types/app";

interface PdfOptions {
  containerId: string;
}

export async function exportNoteToPdf(note: Note, { containerId }: PdfOptions) {
  if (typeof window === "undefined") return;
  const element = document.getElementById(containerId);
  if (!element) return;

  const mod = await import("html2pdf.js");
  const namespace = mod as Html2PdfImport;
  const factory = (typeof namespace === "function" ? namespace : namespace.default) as Html2PdfFactory;
  if (!factory) {
    throw new Error("html2pdf.js konnte nicht geladen werden");
  }

  const safeDate = note.updatedAt.split("T")[0];
  const opt = {
    margin: 0.6,
    filename: `${safeDate}-${note.title.replace(/[^a-zA-Z0-9-_]+/g, "-")}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 1.5, useCORS: true },
    jsPDF: { unit: "cm", format: "a4", orientation: "portrait" }
  } satisfies Record<string, unknown>;

  await factory().set(opt).from(element).save();
}

type Html2PdfInstance = {
  set: (options: Record<string, unknown>) => Html2PdfInstance;
  from: (element: HTMLElement) => Html2PdfInstance;
  save: () => Promise<void>;
};

type Html2PdfFactory = () => Html2PdfInstance;

type Html2PdfImport = { default?: Html2PdfFactory } | Html2PdfFactory;
