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
    <label className="flex items-center gap-3 rounded-full border border-border/40 bg-card/30 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
      <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">Suche</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "Suche nach Titel, Modul oder Tags"}
        className="border-0 bg-transparent px-0 text-foreground focus-visible:ring-0"
      />
    </label>
  );
}
