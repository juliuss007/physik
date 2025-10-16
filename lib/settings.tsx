"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { SettingsState } from "@/types/app";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const SETTINGS_STORAGE_KEY = "physik-settings";

const DEFAULT_SETTINGS: SettingsState = {
  fontScale: "md"
};

interface SettingsContextValue {
  settings: SettingsState;
  setFontScale: (scale: SettingsState["fontScale"]) => void;
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
    document.documentElement.dataset.fontScale = settings.fontScale;
  }, [settings.fontScale]);

  const setFontScale = (scale: SettingsState["fontScale"]) => {
    setSettings((prev) => ({ ...prev, fontScale: scale }));
  };

  const value = useMemo(() => ({ settings, setFontScale }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings muss innerhalb von <SettingsProvider> genutzt werden");
  }
  return context;
}
