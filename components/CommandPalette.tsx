"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarPlus2, Command, FilePlus2, Search } from "lucide-react";

import { APP_NAVIGATION } from "@/lib/navigation";
import { MODULES } from "@/lib/modules";
import { useNotes } from "@/lib/notes";
import { OPEN_COMMAND_PALETTE_EVENT } from "@/lib/command-palette";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface PaletteAction {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  run: () => void;
}

function isTypingInInput(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;
  const tag = element.tagName;
  return (
    element.isContentEditable ||
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT"
  );
}

function matchesQuery(action: PaletteAction, query: string) {
  if (!query.trim()) return true;
  const normalized = query.trim().toLowerCase();
  return (
    action.label.toLowerCase().includes(normalized) ||
    action.description.toLowerCase().includes(normalized) ||
    action.keywords.some((keyword) => keyword.includes(normalized))
  );
}

export function CommandPalette() {
  const pathname = usePathname();
  const router = useRouter();
  const { notes, createNote } = useNotes();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const staticActions = useMemo<PaletteAction[]>(() => {
    const navActions = APP_NAVIGATION.map((item) => ({
      id: `nav:${item.href}`,
      label: item.label,
      description: `Öffne ${item.label.toLowerCase()}`,
      keywords: [item.href, ...item.keywords],
      run: () => router.push(item.href)
    }));

    const moduleActions = MODULES.map((module) => ({
      id: `module:${module.slug}`,
      label: `Notizen: ${module.name}`,
      description: "Filtere Notizen nach Modul",
      keywords: [module.slug, module.name.toLowerCase(), "modul", "notizen"],
      run: () => router.push(`/notes?module=${module.slug}`)
    }));

    return [
      {
        id: "quick:new-note",
        label: "Neue Notiz erstellen",
        description: "Legt sofort eine neue Notiz an",
        keywords: ["new", "note", "notiz", "create"],
        run: () => {
          const note = createNote();
          router.push(`/notes/${note.id}`);
        }
      },
      {
        id: "quick:new-event",
        label: "Neuen Termin erstellen",
        description: "Öffnet den Kalender mit neuem Event-Dialog",
        keywords: ["event", "termin", "calendar", "new"],
        run: () => router.push("/calendar?new=1")
      },
      ...navActions,
      ...moduleActions
    ];
  }, [createNote, router]);

  const noteActions = useMemo<PaletteAction[]>(() => {
    return notes
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 20)
      .map((note) => ({
        id: `note:${note.id}`,
        label: note.title || "Unbenannte Notiz",
        description: "Notiz öffnen",
        keywords: [
          "note",
          "notiz",
          note.module,
          ...note.tags.map((tag) => tag.toLowerCase()),
          ...note.attachments.map((attachment) => attachment.fileName.toLowerCase())
        ],
        run: () => router.push(`/notes/${note.id}`)
      }));
  }, [notes, router]);

  const actions = useMemo(() => {
    const combined = [...staticActions, ...noteActions];
    return combined.filter((action) => matchesQuery(action, query)).slice(0, 14);
  }, [staticActions, noteActions, query]);

  const runAction = (action: PaletteAction) => {
    setOpen(false);
    setQuery("");
    action.run();
  };

  useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isPaletteShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isPaletteShortcut) {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      if (!open) return;
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const onRequestOpen = () => setOpen(true);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, onRequestOpen);
    return () => window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, onRequestOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      if (isTypingInInput(event.target)) {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [open]);

  const currentNav = APP_NAVIGATION.find(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden lg:inline-flex items-center gap-2 border border-border px-3 py-2 text-[0.65rem] font-bold uppercase tracking-wider hover:bg-primary hover:text-background transition-colors"
      >
        <Command className="h-3.5 w-3.5" />
        Cmd/Ctrl + K
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="left-1/2 top-20 w-[min(780px,92vw)] -translate-x-1/2 translate-y-0 p-0"
          aria-describedby="command-palette-description"
        >
          <DialogHeader className="border-b border-border p-4 text-left">
            <DialogTitle className="flex items-center justify-between gap-2 text-[0.78rem] uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Command Palette
              </span>
              <span className="spec-label">
                AKTIV: {currentNav?.label ?? "ÜBERSICHT"}
              </span>
            </DialogTitle>
            <p id="command-palette-description" className="sr-only">
              Suche nach Aktionen, Modulen und Notizen.
            </p>
            <Input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Suche: Notizen, Module, Aktionen ..."
              className="mt-2"
            />
          </DialogHeader>

          <div className="max-h-[65vh] overflow-y-auto p-2">
            {actions.length === 0 ? (
              <p className="p-4 text-[0.75rem] uppercase tracking-wider text-muted-foreground">
                Keine passenden Treffer.
              </p>
            ) : (
              <div className="space-y-1">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => runAction(action)}
                    className="flex w-full items-center justify-between border border-transparent px-3 py-2 text-left hover:border-border hover:bg-background transition-colors"
                  >
                    <div>
                      <p className="text-[0.74rem] font-bold uppercase tracking-wider">
                        {action.label}
                      </p>
                      <p className="text-[0.67rem] text-muted-foreground">{action.description}</p>
                    </div>
                    {action.id === "quick:new-note" && (
                      <FilePlus2 className="h-4 w-4 text-primary" />
                    )}
                    {action.id === "quick:new-event" && (
                      <CalendarPlus2 className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
