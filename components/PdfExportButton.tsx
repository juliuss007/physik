"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Note } from "@/types/app";

interface PdfExportButtonProps {
  note: Note;
  containerId: string;
}

export function PdfExportButton({ note }: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/notes-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: note.content,
          title: note.title
        }),
      });

      const ct = res.headers.get("Content-Type") || "";
      if (res.ok && ct.startsWith("application/pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "notes.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }

      // Handle errors
      const data = await res.json().catch(() => null);
      const errorMsg = data?.error ?? "Export fehlgeschlagen";

      if (data?.log) {
        alert(`PDF-Kompilierung fehlgeschlagen:\n\n${errorMsg}\n\nLog:\n${data.log}`);
      } else {
        alert(`PDF-Kompilierung fehlgeschlagen:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Netzwerkfehler bei PDF-Export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline" className="gap-2">
      {isExporting ? "KOMPILIERE PDF…" : "PDF EXPORTIEREN"}
    </Button>
  );
}
