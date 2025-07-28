import {
  getAllIndexedDbSounds,
  addIndexedDbSound,
  fetchAudioBlobs,
} from "./indexedDb";
import { Sound, IndexedDbSound } from "@/types";

// Call this when soundsUsed changes
export async function syncSoundsUsedWithIndexedDb(soundsUsed: Sound[]) {
  const existingSounds = await getAllIndexedDbSounds();
  const existingIds = new Set(existingSounds.map((s) => s.id));
  let maxIndex = existingSounds.reduce(
    (max, s) => Math.max(max, s.storageIndex),
    -1
  );

  for (const sound of soundsUsed) {
    if (!existingIds.has(sound.id)) {
      const audios = await fetchAudioBlobs(sound.audio_paths);
      const newIndexedSound: IndexedDbSound = {
        ...sound,
        storageIndex: ++maxIndex,
        audios,
      };
      await addIndexedDbSound(newIndexedSound);
    }
  }
}
