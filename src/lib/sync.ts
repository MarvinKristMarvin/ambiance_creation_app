import {
  getAllIndexedDbSounds,
  addIndexedDbSoundWithEviction,
  fetchAudioBlobs,
} from "./indexedDb";
import { Sound, IndexedDbSound, Ambiance } from "@/types";

// Update this function to also accept currentAmbiance
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

    const soundsToAdd = soundsUsed.filter(
      (sound) => !existingIds.has(sound.id)
    );
    console.log(`Need to add ${soundsToAdd.length} new sounds to IndexedDB`);

    for (const sound of soundsToAdd) {
      try {
        console.log(`Processing sound ${sound.id}: ${sound.sound_name}`);

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
          // fallback to simple add if no ambiance context
          // optionally you could throw here or skip the sound
        }

        console.log(`Successfully added sound ${sound.id} to IndexedDB`);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to add sound ${sound.id} to IndexedDB:`, error);
        continue;
      }
    }

    console.log("IndexedDB sync completed");
  } catch (error) {
    console.error("Error in syncSoundsUsedWithIndexedDb:", error);
  }
}

// Updated retry helper to match new function signature
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
