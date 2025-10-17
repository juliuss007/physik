"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Filter } from "lucide-react";

import { ModuleSidebar } from "@/components/ModuleSidebar";
import { SearchBar } from "@/components/SearchBar";
import { ModuleBadge } from "@/components/ModuleBadge";
import { GlassCard } from "@/components/GlassCard";
import { filterNotesByModule, filterNotesByTags, searchNotes, useNotes } from "@/lib/notes";
import { formatDate, formatTime } from "@/lib/utils";
import type { ModuleSlug } from "@/types/app";

function NotesPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { notes } = useNotes();
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<ModuleSlug | null>(null);
  const [tagFilter, setTagFilter] = useState<string>("");

  useEffect(() => {
    const moduleFromQuery = params.get("module") as ModuleSlug | null;
    if (moduleFromQuery) {
      setModuleFilter(moduleFromQuery);
    }
  }, [params]);

  const filteredNotes = useMemo(() => {
    const byModule = filterNotesByModule(notes, moduleFilter);
    const byTag = filterNotesByTags(byModule, tagFilter ? tagFilter.split(",").map((tag) => tag.trim()).filter(Boolean) : []);
    return searchNotes(byTag, query);
  }, [notes, moduleFilter, tagFilter, query]);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
      <ModuleSidebar selected={moduleFilter} onSelect={setModuleFilter} />
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Notizarchiv</h2>
            <p className="text-sm text-muted-foreground">Filtern, strukturieren und bearbeiten Sie Ihre Vorlesungsnotizen.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Adminansicht
            <ArrowUpRight className="h-3 w-3" aria-hidden />
          </button>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl border border-border/30 bg-card/40 p-4 backdrop-blur lg:flex-row lg:items-center">
          <div className="flex w-full flex-1 items-center gap-3">
            <Filter className="hidden h-4 w-4 text-muted-foreground lg:block" aria-hidden />
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <input
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
            placeholder="Tags filtern (Kommagetrennt)"
            aria-label="Tag-Filter"
            className="h-12 w-full rounded-full border border-border/40 bg-transparent px-4 text-sm text-muted-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        {filteredNotes.length === 0 ? (
          <GlassCard title="Keine Notizen gefunden" description="Passe deine Filter oder Suche an." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredNotes.map((note) => (
              <article
                key={note.id}
                className="relative flex h-full flex-col gap-4 rounded-3xl border border-border/30 bg-card/40 p-5 shadow-inner backdrop-blur"
              >
                <header className="space-y-2">
                  <Link href={`/notes/${note.id}`} className="text-lg font-semibold tracking-tight text-foreground">
                    {note.title}
                  </Link>
                  <ModuleBadge module={note.module} />
                  <p className="text-xs text-muted-foreground">
                    {formatDate(note.updatedAt)} · {formatTime(note.updatedAt)}
                  </p>
                </header>
                <p className="text-sm text-muted-foreground">
                  {note.content.slice(0, 160) || "Noch kein Inhalt vorhanden."}
                </p>
                {note.tags.length > 0 && (
                  <footer className="mt-auto flex flex-wrap gap-2 text-xs text-primary/80">
                    {note.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-primary/40 bg-primary/10 px-2 py-1">
                        #{tag}
                      </span>
                    ))}
                  </footer>
                )}
                <Link
                  href={`/notes/${note.id}`}
                  className="mt-2 inline-flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Öffnen
                  <ArrowUpRight className="h-3 w-3" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        )}
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
