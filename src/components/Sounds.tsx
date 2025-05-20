import SimpleSound from "./SimpleSound";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function Sounds() {
  const soundsCentering = useGlobalStore((state) => state.soundsCentering);
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const soundsUsed = useGlobalStore((state) => state.soundsUsed);

  if (!currentAmbiance || !soundsUsed || soundsUsed.length === 0) {
    return null;
  }

  const soundCounters: Record<number, number> = {}; // sound_id -> count

  return (
    <div
      className={`flex flex-row gap-4 my-4 w-full h-full ${
        soundsCentering === "left"
          ? "justify-start"
          : soundsCentering === "center"
          ? "justify-center"
          : "justify-end"
      }`}
    >
      {currentAmbiance.ambiance_sounds.map((sound) => {
        const matchingSound = soundsUsed.find((s) => s.id === sound.sound_id);

        if (matchingSound) {
          // Increment count for this sound_id
          soundCounters[sound.sound_id] =
            (soundCounters[sound.sound_id] || 0) + 1;

          return (
            <SimpleSound
              key={sound.id}
              soundName={matchingSound.sound_name}
              imagePath={matchingSound.image_path}
              audioPaths={matchingSound.audio_paths}
              initialVolume={sound.volume}
              initialReverb={sound.reverb}
              initialDirection={sound.direction}
              number={soundCounters[sound.sound_id]} // 1, 2, 3 for same sound
              id={sound.id}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
