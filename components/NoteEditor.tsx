"use client";

import { useId, useState } from "react";
import { ExternalLink, FileText, Loader2, Trash2, Upload } from "lucide-react";

import { MODULES } from "@/lib/modules";
import type { Note, NoteAttachment } from "@/types/app";
import { cn, generateId } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  deletePdfAttachmentBlob,
  loadPdfAttachmentBlob,
  savePdfAttachmentBlob
} from "@/lib/pdf-attachments";

interface NoteEditorProps {
  note: Note;
  onChange: (note: Note) => void;
}

interface PdfExtractResponse {
  fileName: string;
  mimeType: string;
  size: number;
  pageCount: number;
  text: string;
}

const MAX_UPLOAD_SIZE_BYTES = 12 * 1024 * 1024;

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function NoteEditor({ note, onChange }: NoteEditorProps) {
  const titleId = useId();
  const moduleId = useId();
  const tagsId = useId();
  const contentId = useId();
  const fileInputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [busyAttachmentId, setBusyAttachmentId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const attachments = note.attachments ?? [];

  const updateAttachments = (nextAttachments: NoteAttachment[]) => {
    onChange({ ...note, attachments: nextAttachments });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadError(null);

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setUploadError("Nur PDF-Dateien werden unterstützt.");
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      setUploadError("Die Datei ist größer als 12 MB.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/pdf-extract", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json().catch(() => null)) as
        | PdfExtractResponse
        | { error?: string };

      if (!response.ok) {
        const message =
          payload && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "PDF konnte nicht verarbeitet werden.";
        setUploadError(message);
        return;
      }

      const attachmentId = generateId("pdf");
      await savePdfAttachmentBlob(attachmentId, file.name, file);

      const attachment: NoteAttachment = {
        id: attachmentId,
        fileName:
          payload && "fileName" in payload && typeof payload.fileName === "string"
            ? payload.fileName
            : file.name,
        mimeType:
          payload && "mimeType" in payload && typeof payload.mimeType === "string"
            ? payload.mimeType
            : "application/pdf",
        size:
          payload && "size" in payload && typeof payload.size === "number"
            ? payload.size
            : file.size,
        pages:
          payload && "pageCount" in payload && typeof payload.pageCount === "number"
            ? payload.pageCount
            : 0,
        uploadedAt: new Date().toISOString(),
        extractedText:
          payload && "text" in payload && typeof payload.text === "string" ? payload.text : undefined
      };

      updateAttachments([attachment, ...attachments]);
    } catch (error) {
      console.error(error);
      setUploadError("Upload fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAttachment = async (attachment: NoteAttachment) => {
    setUploadError(null);
    setBusyAttachmentId(attachment.id);
    try {
      const blob = await loadPdfAttachmentBlob(attachment.id);
      if (!blob) {
        setUploadError("PDF-Datei nicht gefunden. Bitte erneut hochladen.");
        return;
      }

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      console.error(error);
      setUploadError("PDF konnte nicht geöffnet werden.");
    } finally {
      setBusyAttachmentId(null);
    }
  };

  const handleRemoveAttachment = async (attachment: NoteAttachment) => {
    setUploadError(null);
    setBusyAttachmentId(attachment.id);
    try {
      await deletePdfAttachmentBlob(attachment.id);
      updateAttachments(attachments.filter((item) => item.id !== attachment.id));
    } catch (error) {
      console.error(error);
      setUploadError("PDF konnte nicht entfernt werden.");
    } finally {
      setBusyAttachmentId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor={titleId}>Titel</Label>
        <Input
          id={titleId}
          aria-label="Titel der Notiz"
          value={note.title}
          onChange={(event) => onChange({ ...note, title: event.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={moduleId}>Modul</Label>
          <select
            id={moduleId}
            aria-label="Modulauswahl"
            value={note.module}
            onChange={(event) => onChange({ ...note, module: event.target.value as Note["module"] })}
            className="h-10 w-full border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          >
            {MODULES.map((module) => (
              <option key={module.slug} value={module.slug} className="bg-card">
                {module.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={tagsId}>Tags (Kommagetrennt)</Label>
          <Input
            id={tagsId}
            aria-label="Tags für die Notiz"
            value={note.tags.join(", ")}
            onChange={(event) =>
              onChange({
                ...note,
                tags: event.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              })
            }
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor={contentId}>Inhalt (Markdown + LaTeX)</Label>
        <Textarea
          id={contentId}
          aria-label="Markdown Editor"
          className="min-h-[480px] resize-vertical font-mono text-sm"
          value={note.content}
          onChange={(event) => onChange({ ...note, content: event.target.value })}
          spellCheck={false}
        />
      </div>
      <div className="space-y-2 border border-border p-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={fileInputId}>PDF-Anhänge</Label>
          <label
            htmlFor={fileInputId}
            className="inline-flex h-9 cursor-pointer items-center gap-2 border border-border px-3 text-[0.7rem] font-bold uppercase tracking-wider hover:opacity-80"
          >
            {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {isUploading ? "Wird verarbeitet..." : "PDF hochladen"}
          </label>
          <input
            id={fileInputId}
            type="file"
            accept="application/pdf"
            className="hidden"
            disabled={isUploading}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) {
                await handleFileUpload(file);
              }
              event.target.value = "";
            }}
          />
        </div>

        {uploadError && (
          <p className="text-[0.7rem] text-destructive border border-destructive/60 bg-destructive/10 px-2 py-1">
            {uploadError}
          </p>
        )}

        {attachments.length === 0 ? (
          <p className="spec-label !text-muted-foreground">
            Keine PDF-Dateien angehängt.
          </p>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="border border-border bg-card px-3 py-2 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[0.72rem] font-bold uppercase tracking-wider truncate">
                      {attachment.fileName}
                    </p>
                    <p className="spec-label">
                      {formatFileSize(attachment.size)} · {attachment.pages || 0} Seite(n)
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`${attachment.fileName} öffnen`}
                      disabled={busyAttachmentId === attachment.id}
                      onClick={() => handleOpenAttachment(attachment)}
                      className={cn("h-8 w-8")}
                    >
                      {busyAttachmentId === attachment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`${attachment.fileName} entfernen`}
                      disabled={busyAttachmentId === attachment.id}
                      onClick={() => handleRemoveAttachment(attachment)}
                      className={cn("h-8 w-8 text-destructive hover:text-destructive")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {attachment.extractedText && (
                  <p className="text-[0.7rem] text-muted-foreground line-clamp-3 border-l border-border pl-2">
                    <FileText className="h-3.5 w-3.5 inline mr-1 align-text-top" />
                    {attachment.extractedText}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="spec-label">
        Aktualisiert: {new Date(note.updatedAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}
      </p>
    </div>
  );
}
