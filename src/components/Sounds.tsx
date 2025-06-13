import { Plus } from "lucide-react";
import SimpleSound from "./SimpleSound";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function Sounds() {
  // Zustand
  const soundsCentering = useGlobalStore((state) => state.soundsCentering);
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const soundsUsed = useGlobalStore((state) => state.soundsUsed);
  const setSearchSoundsMenu = useGlobalStore(
    (state) => state.setSearchSoundsMenu
  );

  // If there is no ambiance or no sounds used, don't show Sounds.tsx
  if (!currentAmbiance || !soundsUsed || soundsUsed.length === 0) {
    return null;
  }

  // Track how many times each sound_id has appeared
  const soundCounts = new Map<number, number>();

  return (
    <div
      className={`flex flex-row  gap-4 my-4 w-full h-full items-center ${
        soundsCentering === "Left"
          ? "justify-start"
          : soundsCentering === "Center"
          ? "justify-center"
          : "justify-end"
      }`}
    >
      {currentAmbiance.ambiance_sounds.map((sound) => {
        const matchingSound = soundsUsed.find((s) => s.id === sound.sound_id);

        if (matchingSound) {
          // Get current count, or default to 0
          const currentCount = soundCounts.get(sound.sound_id) || 0;
          const number = currentCount + 1;
          soundCounts.set(sound.sound_id, number);

          return (
            <SimpleSound
              key={sound.id}
              soundName={matchingSound.sound_name}
              imagePath={matchingSound.image_path}
              audioPaths={matchingSound.audio_paths}
              initialVolume={sound.volume}
              initialReverb={sound.reverb}
              initialDirection={sound.direction}
              number={number}
              id={sound.id}
            />
          );
        }

        return null;
      })}
      {currentAmbiance.ambiance_sounds.length === 0 && (
        <button
          onClick={() => {
            setSearchSoundsMenu(true);
          }}
          className="relative flex flex-col items-center justify-center gap-0 px-16 py-16 border-2 border-gray-400 rounded-xs hover:bg-gray-900 hover:cursor-pointer"
        >
          <Plus className="w-10 h-10 text-gray-400 stroke-2" />
          <span className="absolute w-40 text-sm font-bold text-gray-400 bottom-1">
            Add a sound
          </span>
        </button>
      )}
    </div>
  );
}
