"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { ModuleSidebar } from "@/components/ModuleSidebar";
import { MobileModuleFilter } from "@/components/MobileModuleFilter";
import { SearchBar } from "@/components/SearchBar";
import { ModuleBadge } from "@/components/ModuleBadge";
import { filterNotesByModule, filterNotesByTags, searchNotes, useNotes } from "@/lib/notes";
import { formatDate, formatTime } from "@/lib/utils";
import type { ModuleSlug } from "@/types/app";

function NotesPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { notes } = useNotes();
  const [query, setQuery] = useState("");
  const moduleFromQuery = params.get("module") as ModuleSlug | null;
  const [moduleFilter, setModuleFilter] = useState<ModuleSlug | null>(moduleFromQuery);
  const [tagFilter, setTagFilter] = useState<string>("");
  const isClient = typeof window !== "undefined";

  useEffect(() => {
    document.title = "Physik Konsole - Notizen";
  }, []);

  const filteredNotes = useMemo(() => {
    const byModule = filterNotesByModule(notes, moduleFilter);
    const byTag = filterNotesByTags(byModule, tagFilter ? tagFilter.split(",").map((tag) => tag.trim()).filter(Boolean) : []);
    return searchNotes(byTag, query);
  }, [notes, moduleFilter, tagFilter, query]);

  return (
    <div className="space-y-6">
      <MobileModuleFilter selected={moduleFilter} onSelect={setModuleFilter} />
      <div className="grid gap-6 lg:grid-cols-[240px,1fr]">
        <div className="hidden lg:block">
          <ModuleSidebar selected={moduleFilter} onSelect={setModuleFilter} />
        </div>
        <div className="space-y-4">
          <div className="border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold tracking-widest uppercase text-foreground">NOTIZEN</h2>
                <p className="spec-label !text-muted-foreground mt-1">ARCHIV & VERWALTUNG</p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="spec-label transition-opacity hover:opacity-70 cursor-pointer"
              >
                [ADMIN →]
              </button>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex-1">
                <SearchBar value={query} onChange={setQuery} />
              </div>
              <input
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                placeholder="TAGS (KOMMA GETRENNT)"
                aria-label="Tag-Filter"
                className="h-10 border border-border bg-card px-3 text-[0.7rem] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none uppercase tracking-wider"
              />
            </div>
          </div>
          {filteredNotes.length === 0 ? (
            <div className="border border-border p-8 text-center">
              <p className="spec-label !text-muted-foreground">KEINE NOTIZEN GEFUNDEN</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredNotes.map((note) => (
                <article
                  key={note.id}
                  className="border border-border bg-card p-4 transition-opacity hover:opacity-70 cursor-pointer"
                >
                  <Link href={`/notes/${note.id}`} prefetch={false} className="block space-y-3">
                    <header>
                      <h3 className="text-sm font-bold tracking-wide uppercase text-foreground mb-2">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-3 mb-2">
                        <ModuleBadge module={note.module} />
                        <span className="spec-label font-mono" suppressHydrationWarning>
                          {isClient && `${formatDate(note.updatedAt)} · ${formatTime(note.updatedAt)}`}
                        </span>
                      </div>
                    </header>
                    <p className="text-[0.7rem] text-muted-foreground line-clamp-3">
                      {note.content.slice(0, 160) || "Noch kein Inhalt vorhanden."}
                    </p>
                    {note.attachments.length > 0 && (
                      <p className="spec-label">PDFs: {note.attachments.length}</p>
                    )}
                    {note.tags.length > 0 && (
                      <footer className="flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <span key={tag} className="spec-label border border-border px-2 py-0.5">
                            #{tag}
                          </span>
                        ))}
                      </footer>
                    )}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="space-y-6">Loading…</div>}>
      <NotesPageInner />
    </Suspense>
  );
}
