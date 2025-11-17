"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import type { PluggableList } from "unified";
import rehypeSanitize from "rehype-sanitize";

import { markdownSanitizeSchema } from "@/lib/sanitize";
import type { Note } from "@/types/app";
import { ModuleBadge } from "@/components/ModuleBadge";
import { cn } from "@/lib/utils";

interface NotePreviewProps {
  note: Note;
  containerId: string;
}

const markdownComponents = {
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse border border-border text-sm text-left">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border border-border bg-muted px-3 py-2 font-semibold text-foreground">{children}</th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border border-border px-3 py-2 align-top text-foreground">{children}</td>
  )
};

export function NotePreview({ note, containerId }: NotePreviewProps) {

  return (
    <section
      id={containerId}
      aria-label="Vorschau der Notiz"
      className="border border-border bg-card p-6 space-y-4 print-safe text-base"
    >
      <header className="space-y-2 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold text-foreground">{note.title}</h1>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <ModuleBadge module={note.module} />
          <span>Erstellt: {new Date(note.createdAt).toLocaleDateString("de-DE")}</span>
          <span>Zuletzt geändert: {new Date(note.updatedAt).toLocaleString("de-DE")}</span>
        </div>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="border border-border bg-muted px-2 py-1 text-muted-foreground uppercase tracking-wide"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>
      <article className="markdown-content prose prose-invert max-w-none text-foreground">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath] as PluggableList}
          rehypePlugins={[[rehypeSanitize, markdownSanitizeSchema], rehypeKatex, rehypeRaw] as PluggableList}
          components={markdownComponents as any}
        >
          {note.content}
        </ReactMarkdown>
      </article>
    </section>
  );
}
