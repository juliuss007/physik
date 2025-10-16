import { isBrowser } from "@/lib/utils";

const memoryStore = new Map<string, unknown>();

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] konnte Schlüssel ${key} nicht laden`, error);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T) {
  if (!isBrowser()) {
    memoryStore.set(key, value);
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] konnte Schlüssel ${key} nicht speichern`, error);
  }
}

export function clearStorageKey(key: string) {
  if (!isBrowser()) {
    memoryStore.delete(key);
    return;
  }
  window.localStorage.removeItem(key);
}

export function downloadJson(filename: string, payload: unknown) {
  if (!isBrowser()) return;
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function readFileAsJson<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as T;
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
}
