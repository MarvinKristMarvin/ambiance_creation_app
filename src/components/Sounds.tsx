import SimpleSound from "./SimpleSound";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function Sounds() {
  // Zustand
  const soundsCentering = useGlobalStore((state) => state.soundsCentering);
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const soundsUsed = useGlobalStore((state) => state.soundsUsed);

  // If there is no ambiance or no sounds used, don't show Sounds.tsx
  if (!currentAmbiance || !soundsUsed || soundsUsed.length === 0) {
    return null;
  }

  // Track how many times each sound_id has appeared
  const soundCounts = new Map<number, number>();

  return (
    <div
      className={`flex flex-row gap-4 my-4 w-full h-full ${
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
    </div>
  );
}
