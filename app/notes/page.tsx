"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";

import { ModuleSidebar } from "@/components/ModuleSidebar";
import { SearchBar } from "@/components/SearchBar";
import { ModuleBadge } from "@/components/ModuleBadge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { filterNotesByModule, filterNotesByTags, searchNotes, useNotes } from "@/lib/notes";
import { formatDate, formatTime } from "@/lib/utils";
import type { ModuleSlug } from "@/types/app";

export default function NotesPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { notes, createNote } = useNotes();
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

  const handleCreate = () => {
    const note = createNote();
    router.push(`/notes/${note.id}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
      <ModuleSidebar selected={moduleFilter} onSelect={setModuleFilter} />
      <div className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-50">Notiz-Übersicht</h2>
            <p className="text-sm text-slate-300">Suche, filtere und pflege deine Vorlesungsnotizen.</p>
          </div>
          <Button onClick={handleCreate} className="w-full gap-2 lg:w-auto">
            <PlusCircle className="h-4 w-4" /> Neue Notiz
          </Button>
        </div>
        <div className="flex flex-col gap-4 lg:flex-row">
          <SearchBar value={query} onChange={setQuery} />
          <input
            value={tagFilter}
            onChange={(event) => setTagFilter(event.target.value)}
            placeholder="Tags filtern (Kommagetrennt)"
            aria-label="Tag-Filter"
            className="h-12 w-full rounded-2xl border border-border/50 bg-surface/60 px-4 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/70"
          />
        </div>
        {filteredNotes.length === 0 ? (
          <GlassCard title="Keine Notizen gefunden" description="Passe deine Filter oder Suche an." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredNotes.map((note) => (
              <article
                key={note.id}
                className="glass-muted relative flex h-full flex-col gap-3 rounded-2xl p-5"
              >
                <header className="space-y-2">
                  <Link href={`/notes/${note.id}`} className="text-lg font-semibold text-slate-100">
                    {note.title}
                  </Link>
                  <ModuleBadge module={note.module} />
                  <p className="text-xs text-slate-400">
                    Aktualisiert: {formatDate(note.updatedAt)} • {formatTime(note.updatedAt)}
                  </p>
                </header>
                <p className="text-sm text-slate-300">
                  {note.content.slice(0, 160) || "Noch kein Inhalt vorhanden."}
                </p>
                {note.tags.length > 0 && (
                  <footer className="mt-auto flex flex-wrap gap-2 text-xs text-accent/80">
                    {note.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-accent/40 bg-accent/10 px-2 py-1">
                        #{tag}
                      </span>
                    ))}
                  </footer>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
