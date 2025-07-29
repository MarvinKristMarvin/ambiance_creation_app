//sync.ts
import {
  getAllIndexedDbSounds,
  addIndexedDbSound,
  fetchAudioBlobs,
} from "./indexedDb";
import { Sound, IndexedDbSound } from "@/types";

// Call this when soundsUsed changes
export async function syncSoundsUsedWithIndexedDb(soundsUsed: Sound[]) {
  try {
    console.log("Starting sync with IndexedDB...");

    // Get existing sounds with error handling
    let existingSounds: IndexedDbSound[] = [];
    try {
      existingSounds = await getAllIndexedDbSounds();
      console.log(
        `Found ${existingSounds.length} existing sounds in IndexedDB`
      );
    } catch (error) {
      console.error("Error getting existing sounds from IndexedDB:", error);
      // Continue with empty array - this will cause all sounds to be re-added
      existingSounds = [];
    }

    const existingIds = new Set(existingSounds.map((s) => s.id));
    let maxIndex = existingSounds.reduce(
      (max, s) => Math.max(max, s.storageIndex),
      -1
    );

    const soundsToAdd = soundsUsed.filter(
      (sound) => !existingIds.has(sound.id)
    );
    console.log(`Need to add ${soundsToAdd.length} new sounds to IndexedDB`);

    // Process sounds one by one to avoid overwhelming the system
    for (const sound of soundsToAdd) {
      try {
        console.log(`Processing sound ${sound.id}: ${sound.sound_name}`);

        // Fetch audio blobs with timeout
        const audioFetchPromise = fetchAudioBlobs(sound.audio_paths);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Audio fetch timeout")), 30000); // 30 second timeout
        });

        const audios = await Promise.race([audioFetchPromise, timeoutPromise]);

        const newIndexedSound: IndexedDbSound = {
          ...sound,
          storageIndex: ++maxIndex,
          audios,
        };

        await addIndexedDbSound(newIndexedSound);
        console.log(`Successfully added sound ${sound.id} to IndexedDB`);

        // Small delay between operations to prevent overwhelming the browser
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to add sound ${sound.id} to IndexedDB:`, error);
        // Continue with next sound instead of failing completely
        continue;
      }
    }

    console.log("IndexedDB sync completed");
  } catch (error) {
    console.error("Error in syncSoundsUsedWithIndexedDb:", error);
    // Don't throw here - let the app continue without IndexedDB
  }
}

// Helper function to retry sync if it fails
export async function syncWithRetry(
  soundsUsed: Sound[],
  maxRetries: number = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await syncSoundsUsedWithIndexedDb(soundsUsed);
      console.log(`Sync successful on attempt ${attempt}`);
      return;
    } catch (error) {
      console.error(`Sync attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        console.error("All sync attempts failed, giving up");
        return;
      }

      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying sync in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
