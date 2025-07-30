// indexedDb.ts
import { IndexedDbSound, Ambiance } from "@/types";

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

export async function addIndexedDbSoundWithEviction(
  sound: IndexedDbSound,
  currentAmbiance: Ambiance
): Promise<void> {
  const estimatedSize = sound.audios.reduce((sum, blob) => sum + blob.size, 0);
  const estimatedSizeMB = (estimatedSize / 1024 / 1024).toFixed(1);

  const { allowedBytes } = await getStorageQuota(); // Dynamically get 80% limit
  const allowedMB = (allowedBytes / 1024 / 1024).toFixed(1);

  console.log(
    `\n🟡 Attempting to add sound: ${sound.sound_name} (${estimatedSizeMB}MB)`
  );

  const existingSounds = await getAllIndexedDbSounds();
  const usedSoundIds = new Set(
    currentAmbiance.ambiance_sounds.map((s) => s.sound_id)
  );

  const totalStoredBytes = existingSounds.reduce(
    (acc, s) => acc + s.audios.reduce((sum, blob) => sum + blob.size, 0),
    0
  );

  const totalStoredMB = (totalStoredBytes / 1024 / 1024).toFixed(1);
  const projectedTotal = totalStoredBytes + estimatedSize;
  const projectedTotalMB = (projectedTotal / 1024 / 1024).toFixed(1);

  console.log(`📦 Current storage: ${totalStoredMB}MB / ${allowedMB}MB`);
  console.log(`📈 After adding: ${projectedTotalMB}MB / ${allowedMB}MB`);

  if (projectedTotal > allowedBytes) {
    console.warn(
      `🚨 Storage would exceed limit! Deleting unused sounds to free space...`
    );

    let reclaimedBytes = 0;
    for (const s of existingSounds) {
      if (!usedSoundIds.has(s.id)) {
        const size = s.audios.reduce((sum, b) => sum + b.size, 0);
        await deleteIndexedDbSoundById(s.id);
        reclaimedBytes += size;
        console.log(
          `🗑️ Removed unused sound: ${s.sound_name} (${(
            size /
            1024 /
            1024
          ).toFixed(1)}MB)`
        );
      }
    }

    const recheckSounds = await getAllIndexedDbSounds();
    const recheckUsed = recheckSounds.reduce(
      (acc, s) => acc + s.audios.reduce((sum, b) => sum + b.size, 0),
      0
    );
    const recheckTotal = recheckUsed + estimatedSize;

    if (recheckTotal > allowedBytes) {
      console.error(
        `⚠️ Still not enough space after deleting unused sounds. Clearing all sounds...`
      );
      await clearDatabase();
    } else {
      console.log(
        `✅ Freed ${(reclaimedBytes / 1024 / 1024).toFixed(
          1
        )}MB from unused sounds.`
      );
    }
  }

  await addIndexedDbSound(sound);

  const updatedSounds = await getAllIndexedDbSounds();
  const finalUsedBytes = updatedSounds.reduce(
    (acc, s) => acc + s.audios.reduce((sum, blob) => sum + blob.size, 0),
    0
  );
  const finalUsedMB = (finalUsedBytes / 1024 / 1024).toFixed(1);

  console.log(`✅ Sound '${sound.sound_name}' added successfully!`);
  console.log(`📦 Updated storage: ${finalUsedMB}MB / ${allowedMB}MB`);

  console.log("📋 IndexedDB now contains:");
  for (const s of updatedSounds) {
    const size = s.audios.reduce((sum, blob) => sum + blob.size, 0);
    console.log(`   - ${s.sound_name}: ${(size / 1024 / 1024).toFixed(1)}MB`);
  }
}

export async function getStorageQuota(): Promise<{
  quota: number;
  usage: number;
  allowedBytes: number;
}> {
  if (navigator.storage && navigator.storage.estimate) {
    const { quota = 0, usage = 0 } = await navigator.storage.estimate();
    const allowedBytes = quota * 0.8; // 80% of total quota

    console.log(`💾 Storage estimate:`);
    console.log(`   - Total quota: ${(quota / 1024 / 1024).toFixed(1)}MB`);
    console.log(`   - Used: ${(usage / 1024 / 1024).toFixed(1)}MB`);
    console.log(
      `   - Limit (80%): ${(allowedBytes / 1024 / 1024).toFixed(1)}MB`
    );

    return { quota, usage, allowedBytes };
  } else {
    console.warn("⚠️ StorageManager API not supported. Falling back to 50MB.");
    const fallbackBytes = 50 * 1024 * 1024;
    return { quota: fallbackBytes, usage: 0, allowedBytes: fallbackBytes };
  }
}

export async function deleteIndexedDbSoundById(id: number): Promise<void> {
  const db = await ensureDbReady();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
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
