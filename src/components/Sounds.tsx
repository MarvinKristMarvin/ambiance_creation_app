import { AmbianceSound } from "@/types";
import SimpleSound from "./SimpleSound";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function Sounds() {
  // Zustand states
  const soundsCentering = useGlobalStore((state) => state.soundsCentering);
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const soundsUsed = useGlobalStore((state) => state.soundsUsed);

  // Map sounds of the current ambiance

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
      {/* return (
          <SimpleSound
            soundName={matchingSound.sound_name}
            imagePath={matchingSound.image_path}
            audioPaths={matchingSound.audio_paths}
            initialVolume={sound.volume}
            initialReverb={sound.reverb}
            initialDirection={sound.direction}
            number={sound.number}
            soundId={sound.sound_id}
          />
        ); */}
    </div>
  );
}
