import type { ModuleSlug } from "@/types/app";

export interface ModuleDefinition {
  slug: ModuleSlug;
  name: string;
  color: string;
}

export const MODULES: ModuleDefinition[] = [
  {
    slug: "experimentalphysik-1",
    name: "Experimentalphysik I · Mechanik",
    color: "#74c0fc"
  },
  {
    slug: "mathe-physiker-1",
    name: "Mathematik für Physiker I",
    color: "#ffd43b"
  },
  {
    slug: "praktikum-exp-1",
    name: "Praktikum Experimentalphysik I",
    color: "#ffa94d"
  },
  {
    slug: "einfuehrungspraktikum",
    name: "Einführungspraktikum Physik",
    color: "#63e6be"
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
