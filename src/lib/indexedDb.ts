// indexedDb.ts
import { IndexedDbSound } from "@/types";

const DB_NAME = "MyAppDB";
const STORE_NAME = "sounds";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase>;

export function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" }); // 'id' is from Sound
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function getAllIndexedDbSounds(): Promise<IndexedDbSound[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as IndexedDbSound[]);
    request.onerror = () => reject(request.error);
  });
}

export async function addIndexedDbSound(sound: IndexedDbSound): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(sound);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function fetchAudioBlobs(audioPaths: string[]): Promise<Blob[]> {
  const blobs: Blob[] = [];
  for (const path of audioPaths) {
    const response = await fetch(path);
    const blob = await response.blob();
    blobs.push(blob);
  }
  return blobs;
}
