"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MODULES } from "@/lib/modules";
import type { CalendarEvent, ModuleSlug } from "@/types/app";

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  defaultTimes?: { start: string; end: string };
  onSubmit: (event: Omit<CalendarEvent, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

const moduleOptions = [{ label: "Ohne Modul", value: "" as const }, ...MODULES.map((m) => ({ value: m.slug, label: m.name }))];

export function EventDialog({ open, onOpenChange, event, defaultTimes, onSubmit, onDelete }: EventDialogProps) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [start, setStart] = useState(event?.start ?? defaultTimes?.start ?? "");
  const [end, setEnd] = useState(event?.end ?? defaultTimes?.end ?? "");
  const [module, setModule] = useState<ModuleSlug | "" | undefined>(event?.module ?? "");
  const [kind, setKind] = useState<CalendarEvent["kind"]>(event?.kind ?? "exam");
  const [description, setDescription] = useState(event?.description ?? "");
  const isEdit = Boolean(event);

  useEffect(() => {
    if (open) {
      setTitle(event?.title ?? "");
      setStart(event?.start ?? defaultTimes?.start ?? "");
      setEnd(event?.end ?? defaultTimes?.end ?? "");
      setModule(event?.module ?? "");
      setKind(event?.kind ?? "exam");
      setDescription(event?.description ?? "");
    }
  }, [open, event, defaultTimes]);

  const handleSubmit = () => {
    if (!title || !start) return;
    onSubmit({
      id: event?.id,
      title,
      start,
      end: end || undefined,
      module: module || undefined,
      kind,
      allDay: !end,
      description: description || undefined
    });
    onOpenChange(false);
  };

  const heading = isEdit ? "Termin bearbeiten" : "Neuen Termin erstellen";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="event-dialog-description" className="space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-100">
            <CalendarClock className="h-5 w-5 text-accent" aria-hidden />
            {heading}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <Label htmlFor="event-title">Titel</Label>
            <Input
              id="event-title"
              placeholder="z. B. Klausur Experimentalphysik"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="event-start">Start</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={start ? start.slice(0, 16) : ""}
                onChange={(event) => setStart(new Date(event.target.value).toISOString())}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="event-end">Ende (optional)</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={end ? end.slice(0, 16) : ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setEnd(value ? new Date(value).toISOString() : "");
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="event-module">Modul</Label>
              <select
                id="event-module"
                value={module ?? ""}
                onChange={(event) => setModule(event.target.value as ModuleSlug | "")}
                className="h-10 w-full rounded-lg border border-border/60 bg-surface/60 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent/70"
              >
                {moduleOptions.map((option) => (
                  <option key={option.value || "none"} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="event-kind">Kategorie</Label>
              <select
                id="event-kind"
                value={kind}
                onChange={(event) => setKind(event.target.value as CalendarEvent["kind"])}
                className="h-10 w-full rounded-lg border border-border/60 bg-surface/60 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent/70"
              >
                <option value="exam" className="bg-slate-900">
                  Prüfung
                </option>
                <option value="special" className="bg-slate-900">
                  Sondertermin
                </option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="event-description">Beschreibung</Label>
            <Textarea
              id="event-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Zusätzliche Infos, Lernziele, Raum ..."
              className="min-h-[120px]"
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 pt-2">
          {isEdit && event?.id && onDelete && (
            <Button variant="destructive" onClick={() => onDelete(event.id)} className="no-print">
              Löschen
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmit}>
              {isEdit ? "Speichern" : "Erstellen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
