"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

import { markdownSanitizeSchema } from "@/lib/sanitize";
import type { Note } from "@/types/app";
import { ModuleBadge } from "@/components/ModuleBadge";
import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

interface NotePreviewProps {
  note: Note;
  containerId: string;
}

const markdownComponents = {
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse border border-border/60 text-sm text-left">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-border/60 bg-surface/60 px-3 py-2 font-semibold">{children}</th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-border/50 px-3 py-2 align-top text-slate-200">{children}</td>
  )
};

export function NotePreview({ note, containerId }: NotePreviewProps) {
  const {
    settings: { fontScale }
  } = useSettings();

  const fontClass = fontScale === "sm" ? "text-sm" : fontScale === "lg" ? "text-lg" : "text-base";

  return (
    <section
      id={containerId}
      aria-label="Vorschau der Notiz"
      className={cn("glass p-6 space-y-4 print-safe", fontClass)}
    >
      <header className="space-y-2 border-b border-border/50 pb-4">
        <h1 className="text-2xl font-semibold text-slate-50">{note.title}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-slate-300">
          <ModuleBadge module={note.module} />
          <span>Erstellt: {new Date(note.createdAt).toLocaleDateString("de-DE")}</span>
          <span>Zuletzt geändert: {new Date(note.updatedAt).toLocaleString("de-DE")}</span>
        </div>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-accent/90">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>
      <article className="markdown-content prose prose-invert max-w-none text-slate-100">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeSanitize, markdownSanitizeSchema], rehypeKatex, rehypeRaw]}
        >
          {note.content}
        </ReactMarkdown>
      </article>
    </section>
  );
}
