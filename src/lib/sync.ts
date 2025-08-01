// Updated sync.ts with smarter download logic
import {
  getAllIndexedDbSounds,
  addIndexedDbSoundWithEviction,
  fetchAudioBlobs,
} from "./indexedDb";
import { Sound, IndexedDbSound, Ambiance } from "@/types";

// Add a Set to track sounds currently being processed
const processingSet = new Set<number>();

// Update this function to be smarter about when to download
export async function syncSoundsUsedWithIndexedDb(
  soundsUsed: Sound[],
  currentAmbiance: Ambiance | null
) {
  try {
    console.log("Starting sync with IndexedDB...");
    let existingSounds: IndexedDbSound[] = [];

    try {
      existingSounds = await getAllIndexedDbSounds();
      console.log(
        `Found ${existingSounds.length} existing sounds in IndexedDB`
      );
    } catch (error) {
      console.error("Error getting existing sounds from IndexedDB:", error);
      existingSounds = [];
    }

    const existingIds = new Set(existingSounds.map((s) => s.id));
    let maxIndex = existingSounds.reduce(
      (max, s) => Math.max(max, s.storageIndex),
      -1
    );

    // Filter out sounds that are already being processed or already exist
    const soundsToAdd = soundsUsed.filter(
      (sound) => !existingIds.has(sound.id) && !processingSet.has(sound.id)
    );

    console.log(`Need to add ${soundsToAdd.length} new sounds to IndexedDB`);

    // If no sounds to add, exit early
    if (soundsToAdd.length === 0) {
      console.log("No new sounds to sync");
      return;
    }

    // Get currently used sound IDs from ambiance
    const currentlyUsedIds = new Set(
      currentAmbiance?.ambiance_sounds?.map((s) => s.sound_id) || []
    );

    // Prioritize sounds that are currently in use
    const prioritizedSounds = soundsToAdd.sort((a, b) => {
      const aInUse = currentlyUsedIds.has(a.id);
      const bInUse = currentlyUsedIds.has(b.id);

      if (aInUse && !bInUse) return -1;
      if (!aInUse && bInUse) return 1;
      return 0;
    });

    for (const sound of prioritizedSounds) {
      // Skip if already being processed (race condition protection)
      if (processingSet.has(sound.id)) {
        console.log(
          `Sound ${sound.id} is already being processed, skipping...`
        );
        continue;
      }

      // Mark as being processed
      processingSet.add(sound.id);

      try {
        console.log(`Processing sound ${sound.id}: ${sound.sound_name}`);

        // Check again if it was added while we were waiting
        const recheckExisting = await getAllIndexedDbSounds();
        const recheckIds = new Set(recheckExisting.map((s) => s.id));

        if (recheckIds.has(sound.id)) {
          console.log(`Sound ${sound.id} was already added by another process`);
          continue;
        }

        // Only download if the sound is currently being used or if it's high priority
        const shouldDownloadNow = currentlyUsedIds.has(sound.id);

        if (!shouldDownloadNow) {
          console.log(
            `Sound ${sound.id} not currently in use, deferring download`
          );
          continue;
        }

        const audioFetchPromise = fetchAudioBlobs(sound.audio_paths);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Audio fetch timeout")), 30000);
        });

        const audios = await Promise.race([audioFetchPromise, timeoutPromise]);

        const newIndexedSound: IndexedDbSound = {
          ...sound,
          storageIndex: ++maxIndex,
          audios,
        };

        if (currentAmbiance) {
          await addIndexedDbSoundWithEviction(newIndexedSound, currentAmbiance);
        } else {
          console.warn("⚠️ currentAmbiance is null — skipping eviction logic.");
        }

        console.log(`Successfully added sound ${sound.id} to IndexedDB`);

        // Small delay to prevent overwhelming the system
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to add sound ${sound.id} to IndexedDB:`, error);
        continue;
      } finally {
        // Always remove from processing set
        processingSet.delete(sound.id);
      }
    }

    console.log("IndexedDB sync completed");
  } catch (error) {
    console.error("Error in syncSoundsUsedWithIndexedDb:", error);
  }
}

// Add a function to manually trigger download for specific sounds
export async function downloadSoundIfNeeded(
  soundId: number,
  soundsUsed: Sound[],
  currentAmbiance: Ambiance | null
): Promise<boolean> {
  try {
    // Check if already in IndexedDB
    const existingSounds = await getAllIndexedDbSounds();
    const existingIds = new Set(existingSounds.map((s) => s.id));

    if (existingIds.has(soundId)) {
      return true; // Already downloaded
    }

    // Check if being processed
    if (processingSet.has(soundId)) {
      return false; // Currently downloading
    }

    // Find the sound in soundsUsed
    const sound = soundsUsed.find((s) => s.id === soundId);
    if (!sound) {
      console.error(`Sound ${soundId} not found in soundsUsed`);
      return false;
    }

    // Download it
    await syncSoundsUsedWithIndexedDb([sound], currentAmbiance);
    return true;
  } catch (error) {
    console.error(`Error downloading sound ${soundId}:`, error);
    return false;
  }
}

// Updated retry helper with better error handling
export async function syncWithRetry(
  soundsUsed: Sound[],
  currentAmbiance: Ambiance | null,
  maxRetries: number = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await syncSoundsUsedWithIndexedDb(soundsUsed, currentAmbiance);
      console.log(`Sync successful on attempt ${attempt}`);
      return;
    } catch (error) {
      console.error(`Sync attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        console.error("All sync attempts failed, giving up");
        return;
      }

      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying sync in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Utility function to clear the processing set (useful for debugging)
export function clearProcessingSet(): void {
  processingSet.clear();
  console.log("Processing set cleared");
}
