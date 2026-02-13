export interface NavigationItem {
  href: "/" | "/notes" | "/calendar" | "/settings" | "/admin";
  label: string;
  code: string;
  keywords: string[];
}

export const APP_NAVIGATION: NavigationItem[] = [
  {
    href: "/",
    label: "ÜBERSICHT",
    code: "00",
    keywords: ["dashboard", "start", "home", "cockpit"]
  },
  {
    href: "/notes",
    label: "NOTIZEN",
    code: "01",
    keywords: ["notes", "wissen", "markdown", "latex"]
  },
  {
    href: "/calendar",
    label: "KALENDER",
    code: "02",
    keywords: ["termine", "exam", "planung"]
  },
  {
    href: "/settings",
    label: "EINSTELLUNGEN",
    code: "03",
    keywords: ["backup", "restore", "theme"]
  },
  {
    href: "/admin",
    label: "ADMIN",
    code: "04",
    keywords: ["verwaltung", "tools"]
  }
];
