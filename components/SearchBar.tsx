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
    <label className="flex items-center gap-3 border border-border bg-card px-3 h-10 text-sm text-muted-foreground">
      <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">Suche</span>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? "SUCHE"}
        className="border-0 bg-transparent px-0 text-foreground focus-visible:ring-0 uppercase tracking-wider placeholder:text-muted-foreground text-[0.7rem]"
      />
    </label>
  );
}
