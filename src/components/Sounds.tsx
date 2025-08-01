// Updated Sounds.tsx with better blob management
import { Plus } from "lucide-react";
import SimpleSound from "./SimpleSound";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { useEffect, useRef, useState, useCallback } from "react";
import { getIndexedDbSoundById } from "@/lib/indexedDb";
import { IndexedDbSound } from "@/types";

export default function Sounds() {
  // Zustand
  const soundsCentering = useGlobalStore((state) => state.soundsCentering);
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const soundsUsed = useGlobalStore((state) => state.soundsUsed);
  const openSearchSoundsMenu = useGlobalStore(
    (state) => state.openSearchSoundsMenu
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [indexedDbSoundsMap, setIndexedDbSoundsMap] = useState<
    Map<number, IndexedDbSound>
  >(new Map());

  // Add loading states to track which sounds are being fetched
  const [loadingSounds, setLoadingSounds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // Allow zoom
      if (e.deltaY === 0) return;
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Memoized fetch function to avoid unnecessary re-fetches
  const fetchSoundBlob = useCallback(
    async (soundId: number): Promise<IndexedDbSound | null> => {
      if (loadingSounds.has(soundId)) {
        return null; // Already loading
      }

      setLoadingSounds((prev) => new Set(prev).add(soundId));

      try {
        const stored = await getIndexedDbSoundById(soundId);
        return stored;
      } catch (error) {
        console.error(`Error fetching sound ${soundId}:`, error);
        return null;
      } finally {
        setLoadingSounds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(soundId);
          return newSet;
        });
      }
    },
    [loadingSounds]
  );

  useEffect(() => {
    const fetchBlobs = async () => {
      if (currentAmbiance === null) return;

      const soundIds = currentAmbiance.ambiance_sounds.map((s) => s.sound_id);
      const newMap = new Map(indexedDbSoundsMap); // Clone existing map

      // Track which sounds we need to fetch
      const soundsToFetch = soundIds.filter(
        (id) => !newMap.has(id) && !loadingSounds.has(id)
      );

      if (soundsToFetch.length === 0) {
        return; // Nothing to fetch
      }

      console.log(
        `Fetching blobs for ${soundsToFetch.length} sounds:`,
        soundsToFetch
      );

      // Fetch sounds in parallel with concurrency limit
      const concurrentLimit = 3;
      const fetchPromises = soundsToFetch.map(async (id) => {
        const stored = await fetchSoundBlob(id);
        return { id, stored };
      });

      // Process in batches
      for (let i = 0; i < fetchPromises.length; i += concurrentLimit) {
        const batch = fetchPromises.slice(i, i + concurrentLimit);
        const results = await Promise.allSettled(batch);

        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value.stored) {
            newMap.set(result.value.id, result.value.stored);
          }
        });
      }

      // Only update state if we have new data
      if (newMap.size !== indexedDbSoundsMap.size) {
        setIndexedDbSoundsMap(newMap);
        console.log("IndexedDbSoundsMap updated:", newMap);
      }
    };

    if (currentAmbiance) {
      fetchBlobs();
    }
  }, [currentAmbiance, fetchSoundBlob, indexedDbSoundsMap.size]);

  // Add a function to handle when a sound stores its blob
  const handleSoundBlobStored = useCallback(
    (soundId: number, indexedDbSound: IndexedDbSound) => {
      setIndexedDbSoundsMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(soundId, indexedDbSound);
        return newMap;
      });
    },
    []
  );

  // If there is no ambiance, don't show Sounds.tsx
  if (!currentAmbiance) {
    return null;
  }

  // Track how many times each sound_id has appeared
  const soundCounts = new Map<number, number>();

  return (
    <div
      aria-label="my ambiance sounds container"
      className={`relative flex flex-col sm:flex-row gap-4 pb-4 mx-4 w-[calc(100%-2rem)] h-full items-center overflow-x-auto overflow-y-auto whitespace-nowrap custom-scrollbar ${
        currentAmbiance.ambiance_sounds.length === 0
          ? "justify-center-safe"
          : soundsCentering === "Left"
          ? "justify-start-safe"
          : soundsCentering === "Center"
          ? "sm:justify-center-safe"
          : "justify-end-safe"
      }`}
      ref={scrollRef}
    >
      {currentAmbiance.ambiance_sounds.map((sound) => {
        const matchingSound = soundsUsed.find((s) => s.id === sound.sound_id);

        if (matchingSound) {
          // Get current count, or default to 0
          const currentCount = soundCounts.get(sound.sound_id) || 0;
          const number = currentCount + 1;
          soundCounts.set(sound.sound_id, number);

          const indexedDbSound = indexedDbSoundsMap.get(sound.sound_id);
          const audioBlobs = indexedDbSound?.audios ?? [];

          return (
            <SimpleSound
              key={sound.id}
              soundName={matchingSound.sound_name}
              imagePath={matchingSound.image_path}
              audioPaths={matchingSound.audio_paths}
              looping={matchingSound.looping}
              initialVolume={sound.volume}
              initialReverb={sound.reverb}
              initialReverbDuration={sound.reverb_duration}
              initialSpeed={sound.speed}
              initialDirection={sound.direction}
              repeat_delay={sound.repeat_delay}
              initialLow={sound.low}
              initialMid={sound.mid}
              initialHigh={sound.high}
              initialLowCut={sound.low_cut}
              initialHighCut={sound.high_cut}
              number={number}
              id={sound.id}
              dbSoundId={matchingSound.id} // Pass the actual sound ID
              audioBlobs={audioBlobs}
              category={matchingSound.category}
              onBlobStored={handleSoundBlobStored} // Callback for when blob is stored
            />
          );
        }

        return null;
      })}
      {currentAmbiance.ambiance_sounds.length === 0 && (
        <button
          aria-label="add your first sound button"
          onClick={openSearchSoundsMenu}
          className="relative flex flex-col items-center gap-0 border-2 border-gray-500 border-dashed justify-self-center px-15 py-15 hover:border-gray-300 hover:cursor-pointer group"
        >
          <Plus className="w-10 h-10 text-gray-500 stroke-2 group-hover:text-gray-300" />
          <span className="absolute text-xl font-bold text-gray-700 bottom-[-50]">
            Add a sound
          </span>
        </button>
      )}
    </div>
  );
}
