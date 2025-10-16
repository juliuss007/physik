"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Note } from "@/types/app";
import { exportNoteToPdf } from "@/lib/pdf";

interface PdfExportButtonProps {
  note: Note;
  containerId: string;
}

export function PdfExportButton({ note, containerId }: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportNoteToPdf(note, { containerId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} variant="outline" className="gap-2">
      {isExporting ? "Exportiere…" : "Als PDF exportieren"}
    </Button>
  );
}
