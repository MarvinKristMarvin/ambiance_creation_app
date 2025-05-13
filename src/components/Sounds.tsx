import { AmbianceSound } from "@/types";
import SimpleSound from "./SimpleSound";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function Sounds() {
  // Zustand states
  const soundsCentering = useGlobalStore((state) => state.soundsCentering);
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const soundsUsed = useGlobalStore((state) => state.soundsUsed);
  const paused = useGlobalStore((state) => state.paused);
  const currentSection = useGlobalStore((state) => state.currentSection);

  if (!currentAmbiance || !currentAmbiance.settings?.sections) return null;

  const sections = currentAmbiance.settings.sections;

  // Map of unique sound identifier to { sound: AmbianceSound, playsInSections: number[] }
  const uniqueMap = new Map<
    string,
    { sound: AmbianceSound; playsInSections: number[] }
  >();

  sections.forEach((section, sectionIndex) => {
    section.sounds.forEach((sound) => {
      const key = `${sound.sound_id}_${sound.number}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, {
          sound,
          playsInSections: [sectionIndex + 1], // section number (1-based)
        });
      } else {
        uniqueMap.get(key)!.playsInSections.push(sectionIndex + 1);
      }
    });
  });

  const uniqueSounds = Array.from(uniqueMap.values());

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
      {uniqueSounds.map(({ sound, playsInSections }) => {
        const matchingSound = soundsUsed.find((s) => s.id === sound.sound_id);
        if (!matchingSound) return null;

        return (
          <SimpleSound
            key={`${sound.sound_id}_${sound.number}`}
            soundName={matchingSound.sound_name}
            imagePath={matchingSound.image_path}
            audioPaths={matchingSound.audio_paths}
            initialVolume={sound.volume}
            initialReverb={sound.reverb}
            initialDirection={sound.direction}
            number={sound.number}
            paused={paused}
            playsInSections={playsInSections}
            currentSection={currentSection}
            soundId={sound.sound_id}
          />
        );
      })}
    </div>
  );
}
