"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <label className="glass-muted flex items-center gap-3 rounded-2xl border border-border/60 px-4 py-2 text-sm text-slate-300">
      <Search className="h-4 w-4 text-slate-400" aria-hidden />
      <span className="sr-only">Suche</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "Suche nach Titel, Modul oder Tags"}
        className="border-0 bg-transparent px-0 text-slate-100 focus-visible:ring-0"
      />
    </label>
  );
}
