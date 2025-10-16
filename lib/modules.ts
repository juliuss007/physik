import type { ModuleSlug } from "@/types/app";

export interface ModuleDefinition {
  slug: ModuleSlug;
  name: string;
  color: string;
}

export const MODULES: ModuleDefinition[] = [
  {
    slug: "experimentalphysik-1",
    name: "Experimentalphysik I - Energie-Raum-Zeit",
    color: "#38bdf8"
  },
  {
    slug: "mathe-physiker-1",
    name: "Mathematik für Physiker I",
    color: "#facc15"
  },
  {
    slug: "praktikum-exp-1",
    name: "Praktikum zu Experimentalphysik I",
    color: "#f97316"
  },
  {
    slug: "einfuehrungspraktikum",
    name: "Einführungspraktikum Physik",
    color: "#22d3ee"
  }
];

export const MODULE_NAME_MAP: Record<ModuleSlug, string> = MODULES.reduce(
  (acc, module) => {
    acc[module.slug] = module.name;
    return acc;
  },
  {} as Record<ModuleSlug, string>
);

export const MODULE_COLOR_MAP: Record<ModuleSlug, string> = MODULES.reduce(
  (acc, module) => {
    acc[module.slug] = module.color;
    return acc;
  },
  {} as Record<ModuleSlug, string>
);

export const DEFAULT_MODULE: ModuleSlug = MODULES[0].slug;

export const MODULE_OPTIONS = MODULES.map((module) => ({
  label: module.name,
  value: module.slug
}));
