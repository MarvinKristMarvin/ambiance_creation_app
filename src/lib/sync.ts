// Simplified sync.ts - Components handle all fetching
import { getAllIndexedDbSounds } from "./indexedDb";
import { Sound, IndexedDbSound, Ambiance } from "@/types";

// Keep track of sounds that need to be downloaded but haven't been yet
const pendingSounds = new Set<number>();

// Export for components to coordinate
export { pendingSounds };

// This function now just identifies which sounds need to be cached
// The actual fetching and storing is handled by components when they play sounds
export async function syncSoundsUsedWithIndexedDb(
  soundsUsed: Sound[],
  currentAmbiance: Ambiance | null
) {
  try {
    console.log("🔄 Checking which sounds need to be cached...");
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

    // Identify sounds that need to be cached
    const soundsNeedingCache = soundsUsed.filter(
      (sound) => !existingIds.has(sound.id)
    );

    console.log(
      `📝 ${soundsNeedingCache.length} sounds need to be cached when played`
    );

    // Add them to pending set so components know they might need to cache them
    soundsNeedingCache.forEach((sound) => {
      pendingSounds.add(sound.id);
    });

    // Get currently used sound IDs from ambiance for priority info
    const currentlyUsedIds = new Set(
      currentAmbiance?.ambiance_sounds?.map((s) => s.sound_id) || []
    );

    // Log priority sounds
    const prioritySounds = soundsNeedingCache.filter((sound) =>
      currentlyUsedIds.has(sound.id)
    );

    if (prioritySounds.length > 0) {
      console.log(
        `⚡ ${prioritySounds.length} high-priority sounds will be cached when played:`,
        prioritySounds.map((s) => s.sound_name)
      );
    }

    console.log(
      "✅ Sync check completed - components will handle caching when sounds are played"
    );
  } catch (error) {
    console.error("❌ Error in syncSoundsUsedWithIndexedDb:", error);
  }
}

// Function to mark a sound as cached (called by components after successful storage)
export function markSoundAsCached(soundId: number): void {
  pendingSounds.delete(soundId);
  console.log(`✅ Sound ${soundId} marked as cached`);
}

// Function to check if a sound needs caching
export function soundNeedsCaching(soundId: number): boolean {
  return pendingSounds.has(soundId);
}

// Updated retry helper
export async function syncWithRetry(
  soundsUsed: Sound[],
  currentAmbiance: Ambiance | null,
  maxRetries: number = 3
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await syncSoundsUsedWithIndexedDb(soundsUsed, currentAmbiance);
      console.log(`✅ Sync check successful on attempt ${attempt}`);
      return;
    } catch (error) {
      console.error(`❌ Sync check attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        console.error("❌ All sync check attempts failed, giving up");
        return;
      }

      const delay = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Retrying sync check in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Utility function to clear pending sounds (useful for debugging)
export function clearPendingSounds(): void {
  pendingSounds.clear();
  console.log("🧹 Pending sounds cleared");
}
