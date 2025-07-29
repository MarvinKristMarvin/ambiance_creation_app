// indexedDb.ts
import { IndexedDbSound } from "@/types";

const DB_NAME = "MyAppDB";
const STORE_NAME = "sounds";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        console.log("IndexedDB upgrade needed, creating object store...");

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
          console.log("Object store created successfully");
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        console.log("IndexedDB opened successfully");

        // Verify the object store exists before resolving
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          console.error("Object store not found after opening database");
          reject(new Error(`Object store '${STORE_NAME}' not found`));
          return;
        }

        resolve(db);
      };

      request.onerror = () => {
        console.error("IndexedDB error:", request.error);
        reject(request.error);
      };

      request.onblocked = () => {
        console.warn("IndexedDB blocked - another connection may be open");
        // Optionally retry after a delay
        setTimeout(() => {
          dbPromise = null; // Reset the promise so it can be retried
          reject(new Error("IndexedDB blocked"));
        }, 1000);
      };
    });
  }
  return dbPromise;
}

// Helper function to ensure database is ready before operations
async function ensureDbReady(): Promise<IDBDatabase> {
  try {
    const db = await getDB();

    // Double-check that the object store exists
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      console.error("Object store still not available");
      // Reset the promise and try again
      dbPromise = null;
      throw new Error(`Object store '${STORE_NAME}' not available`);
    }

    return db;
  } catch (error) {
    console.error("Error ensuring database ready:", error);
    // Reset the promise on error so subsequent calls can retry
    dbPromise = null;
    throw error;
  }
}

export async function getAllIndexedDbSounds(): Promise<IndexedDbSound[]> {
  try {
    const db = await ensureDbReady();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as IndexedDbSound[]);
      };

      request.onerror = () => {
        console.error("Error getting all sounds:", request.error);
        reject(request.error);
      };

      tx.onerror = () => {
        console.error("Transaction error:", tx.error);
        reject(tx.error);
      };
    });
  } catch (error) {
    console.error("Error in getAllIndexedDbSounds:", error);
    return []; // Return empty array as fallback
  }
}

export async function getIndexedDbSoundById(
  id: number
): Promise<IndexedDbSound | null> {
  try {
    const db = await ensureDbReady();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result ?? null);
      };

      request.onerror = () => {
        console.error("Error getting sound by id:", request.error);
        reject(request.error);
      };

      tx.onerror = () => {
        console.error("Transaction error:", tx.error);
        reject(tx.error);
      };
    });
  } catch (error) {
    console.error("Error in getIndexedDbSoundById:", error);
    return null; // Return null as fallback
  }
}

export async function addIndexedDbSound(sound: IndexedDbSound): Promise<void> {
  try {
    const db = await ensureDbReady();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(sound);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error("Error adding sound:", request.error);
        reject(request.error);
      };

      tx.onerror = () => {
        console.error("Transaction error:", tx.error);
        reject(tx.error);
      };
    });
  } catch (error) {
    console.error("Error in addIndexedDbSound:", error);
    throw error; // Re-throw for sync.ts to handle
  }
}

export async function fetchAudioBlobs(audioPaths: string[]): Promise<Blob[]> {
  const blobs: Blob[] = [];
  for (const path of audioPaths) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
      }
      const blob = await response.blob();
      blobs.push(blob);
    } catch (error) {
      console.error(`Error fetching audio blob for ${path}:`, error);
      // You might want to push an empty blob or skip this path
      // For now, we'll skip failed fetches
    }
  }
  return blobs;
}

// Utility function to clear the database (useful for debugging)
export async function clearDatabase(): Promise<void> {
  try {
    const db = await ensureDbReady();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}
