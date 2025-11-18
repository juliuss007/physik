import type { ModuleSlug } from "@/types/app";

export interface ModuleDefinition {
  slug: ModuleSlug;
  name: string;
  color: string;
}

export const MODULES: ModuleDefinition[] = [
  {
    slug: "experimentalphysik-1",
    name: "Experimentalphysik I – Energie – Raum – Zeit",
    color: "#000066" // BLUE
  },
  {
    slug: "mathe-physiker-1",
    name: "Mathematik für Physiker I",
    color: "#996F00" // YELLOW (darkened for contrast)
  },
  {
    slug: "praktikum-exp-1",
    name: "Praktikum Experimentalphysik I",
    color: "#660000" // RED
  },
  {
    slug: "einfuehrungspraktikum",
    name: "Einführungspraktikum Physik",
    color: "#006666" // CYAN
  },
  {
    slug: "mathematische-methoden",
    name: "Mathematische Methoden",
    color: "#004B33" // DARK GREEN
  },
  {
    slug: "software-tools",
    name: "Software Tools in der Physik",
    color: "#4B0082" // INDIGO
  },
  {
    slug: "skills-physiker",
    name: "Skills für Physiker",
    color: "#006699" // STEEL BLUE
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
