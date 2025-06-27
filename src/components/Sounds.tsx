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
  if (!currentAmbiance) {
    return null;
  }

  // Track how many times each sound_id has appeared
  const soundCounts = new Map<number, number>();

  return (
    <div
      className={` flex flex-row  gap-4 mb-4 w-full h-full items-center ${
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
              looping={matchingSound.looping}
              initialVolume={sound.volume}
              initialReverb={sound.reverb}
              initialReverbDuration={sound.reverb_duration}
              initialSpeed={sound.speed}
              initialDirection={sound.direction}
              repeat_delay={sound.repeat_delay}
              number={number}
              id={sound.id}
            />
          );
        }

        return null;
      })}
      {currentAmbiance.ambiance_sounds.length === 0 && (
        <button
          onClick={() => setSearchSoundsMenu(true)}
          className="relative flex flex-col items-center justify-center gap-0 border-2 border-gray-500 border-dashed px-15 py-15 hover:border-gray-300 hover:cursor-pointer group"
        >
          <Plus className="w-10 h-10 text-gray-500 stroke-2 group-hover:text-gray-300" />
          <span className="absolute w-90 text-xl font-bold text-gray-700 bottom-[-70]">
            Add a sound to your ambiance
          </span>
        </button>
      )}
    </div>
  );
}
