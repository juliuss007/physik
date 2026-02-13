import { isBrowser } from "@/lib/utils";

const ATTACHMENTS_DB_NAME = "physik-attachments-db";
const ATTACHMENTS_DB_VERSION = 1;
const ATTACHMENTS_STORE = "pdf-attachments";

interface StoredAttachmentRecord {
  id: string;
  blob: Blob;
  fileName: string;
  updatedAt: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openAttachmentsDb(): Promise<IDBDatabase> {
  if (!isBrowser()) {
    return Promise.reject(new Error("IndexedDB ist nur im Browser verfügbar."));
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(ATTACHMENTS_DB_NAME, ATTACHMENTS_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ATTACHMENTS_STORE)) {
        db.createObjectStore(ATTACHMENTS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB konnte nicht geöffnet werden."));
  });

  return dbPromise;
}

export async function savePdfAttachmentBlob(id: string, fileName: string, blob: Blob): Promise<void> {
  if (!isBrowser()) return;
  const db = await openAttachmentsDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(ATTACHMENTS_STORE, "readwrite");
    const store = tx.objectStore(ATTACHMENTS_STORE);
    const record: StoredAttachmentRecord = {
      id,
      blob,
      fileName,
      updatedAt: new Date().toISOString()
    };
    store.put(record);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("PDF-Anhang konnte nicht gespeichert werden."));
    tx.onabort = () => reject(tx.error ?? new Error("PDF-Anhang speichern wurde abgebrochen."));
  });
}

export async function loadPdfAttachmentBlob(id: string): Promise<Blob | null> {
  if (!isBrowser()) return null;
  const db = await openAttachmentsDb();

  return new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(ATTACHMENTS_STORE, "readonly");
    const store = tx.objectStore(ATTACHMENTS_STORE);
    const request = store.get(id);

    request.onsuccess = () => {
      const result = request.result as StoredAttachmentRecord | undefined;
      resolve(result?.blob ?? null);
    };
    request.onerror = () => reject(request.error ?? new Error("PDF-Anhang konnte nicht geladen werden."));
  });
}

export async function deletePdfAttachmentBlob(id: string): Promise<void> {
  if (!isBrowser()) return;
  const db = await openAttachmentsDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(ATTACHMENTS_STORE, "readwrite");
    const store = tx.objectStore(ATTACHMENTS_STORE);
    store.delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("PDF-Anhang konnte nicht gelöscht werden."));
    tx.onabort = () => reject(tx.error ?? new Error("PDF-Anhang löschen wurde abgebrochen."));
  });
}

export async function deletePdfAttachmentBlobs(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await Promise.all(ids.map((id) => deletePdfAttachmentBlob(id)));
}
