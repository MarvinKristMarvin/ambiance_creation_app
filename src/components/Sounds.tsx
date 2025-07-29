import { Plus } from "lucide-react";
import SimpleSound from "./SimpleSound";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // Allow zoom
      if (e.deltaY === 0) return;

      // We can't call preventDefault unless passive: false
      // So instead of preventDefault, let it scroll naturally
      el.scrollLeft += e.deltaY;
    };

    // Add listener without preventDefault
    el.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  const [indexedDbSoundsMap, setIndexedDbSoundsMap] = useState<
    Map<number, IndexedDbSound>
  >(new Map());

  useEffect(() => {
    const fetchBlobs = async () => {
      if (currentAmbiance === null) return;
      const soundIds = currentAmbiance.ambiance_sounds.map((s) => s.sound_id);
      const newMap = new Map(indexedDbSoundsMap); // Clone existing map

      for (const id of soundIds) {
        if (!newMap.has(id)) {
          const stored = await getIndexedDbSoundById(id);
          if (stored) {
            newMap.set(id, stored);
          }
        }
      }

      setIndexedDbSoundsMap(newMap);
      console.log("IndexedDbSoundsMap updated:", newMap);
    };

    if (currentAmbiance) {
      fetchBlobs();
    }
  }, [currentAmbiance]);

  // If there is no ambiance or no sounds used, don't show Sounds.tsx
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

          console.log(
            "sound " + matchingSound.sound_name + " has audio blobs : ",
            audioBlobs
          );

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
              audioBlobs={audioBlobs}
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
