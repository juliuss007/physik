"use client";

import type { Note } from "@/types/app";

interface PdfOptions {
  containerId: string;
}

export async function exportNoteToPdf(note: Note, { containerId }: PdfOptions) {
  if (typeof window === "undefined") return;
  const element = document.getElementById(containerId);
  if (!element) return;

  // Clone element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.backgroundColor = "#ffffff";
  clone.style.color = "#000000";
  clone.style.border = "none";
  clone.style.padding = "20px";
  clone.style.maxWidth = "100%";

  // Fix all text colors for print
  clone.querySelectorAll("*").forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.color = "#000000";
    htmlEl.style.backgroundColor = "transparent";
  });

  // Temporarily add clone to body (hidden)
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.width = "794px"; // A4 width at 96dpi minus margins
  document.body.appendChild(clone);

  try {
    const mod = await import("html2pdf.js");
    const namespace = mod as Html2PdfImport;
    const factory = (typeof namespace === "function" ? namespace : namespace.default) as Html2PdfFactory;
    if (!factory) {
      throw new Error("html2pdf.js konnte nicht geladen werden");
    }

    const safeDate = note.updatedAt.split("T")[0];
    const opt = {
      margin: [15, 15, 15, 15], // top, right, bottom, left in mm
      filename: `${safeDate}-${note.title.replace(/[^a-zA-Z0-9-_]+/g, "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        backgroundColor: "#ffffff"
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        before: ".page-break-before",
        after: ".page-break-after",
        avoid: ["h1", "h2", "h3", "img", ".katex-display"]
      }
    } satisfies Record<string, unknown>;

    await factory().set(opt).from(clone).save();
  } finally {
    // Cleanup
    document.body.removeChild(clone);
  }
}

type Html2PdfInstance = {
  set: (options: Record<string, unknown>) => Html2PdfInstance;
  from: (element: HTMLElement) => Html2PdfInstance;
  save: () => Promise<void>;
};

type Html2PdfFactory = () => Html2PdfInstance;

type Html2PdfImport = { default?: Html2PdfFactory } | Html2PdfFactory;
