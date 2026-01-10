"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Note } from "@/types/app";

interface PdfExportButtonProps {
  note: Note;
}

export function PdfExportButton({ note }: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compileLog, setCompileLog] = useState<string | null>(null);

  const handleExport = async () => {
    setError(null);
    setCompileLog(null);
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

        // Extract filename from Content-Disposition header
        const contentDisposition = res.headers.get("Content-Disposition");
        let filename = "notes.pdf";
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }

      // Handle errors
      const data = await res.json().catch(() => null);
      const errorMsg = data?.error ?? "Export fehlgeschlagen";
      setError(errorMsg);
      if (data?.log) {
        setCompileLog(data.log);
      }
    } catch (error) {
      console.error("PDF export error:", error);
      setError("Netzwerkfehler bei PDF-Export");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleExport} disabled={isExporting} variant="outline" className="gap-2">
        {isExporting ? "KOMPILIERE PDF…" : "PDF EXPORTIEREN"}
      </Button>

      {error && (
        <div className="border border-accent bg-background p-3 text-sm">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="font-mono text-accent">FEHLER</span>
            <button
              onClick={() => {
                setError(null);
                setCompileLog(null);
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fehler schließen"
            >
              ✕
            </button>
          </div>
          <p className="text-foreground mb-2">{error}</p>
          {compileLog && (
            <details className="mt-2">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-mono text-xs">
                Kompilierungs-Log anzeigen
              </summary>
              <pre className="mt-2 p-2 bg-muted text-xs overflow-x-auto font-mono whitespace-pre-wrap break-words">
                {compileLog}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
