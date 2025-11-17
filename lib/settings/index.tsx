"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { SettingsState } from "@/types/app";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const SETTINGS_STORAGE_KEY = "physik-settings";

const DEFAULT_SETTINGS: SettingsState = {
  theme: "dark"
};

interface SettingsContextValue {
  settings: SettingsState;
  setTheme: (theme: SettingsState["theme"]) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(() =>
    loadFromStorage<SettingsState>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS)
  );

  useEffect(() => {
    saveToStorage(SETTINGS_STORAGE_KEY, settings);
  }, [settings]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    if (settings.theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [settings.theme]);

  const setTheme = (theme: SettingsState["theme"]) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  const value = useMemo(() => ({ settings, setTheme }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings muss innerhalb von <SettingsProvider> genutzt werden");
  }
  return context;
}
