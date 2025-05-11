import VolumeIcon from "@/components/icons/VolumeIcon";
import PauseIcon from "@/components/icons/PauseIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function AmbianceMenu() {
  // Zustand states
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const currentSection = useGlobalStore((state) => state.currentSection);
  const setCurrentSection = useGlobalStore((state) => state.setCurrentSection);
  const paused = useGlobalStore((state) => state.paused);
  const setPaused = useGlobalStore((state) => state.setPaused);
  const globalVolume = useGlobalStore((state) => state.globalVolume);
  const setGlobalVolume = useGlobalStore((state) => state.setGlobalVolume);

  const [timer, setTimer] = useState(0);
  const sectionDuration =
    currentAmbiance?.settings.sections[currentSection - 1].duration ?? 0;
  const prevSectionRef = useRef(currentSection);
  const prevAmbianceRef = useRef(currentAmbiance);
  const lastGlobalVolume = useRef(1);

  useEffect(() => {
    console.log("ambiance menu : ", currentAmbiance);
  });

  // Updates current section on arrow button click, can't be less than 1 or greater than the total number of sections
  const updateSection = useCallback(
    (delta: number) => {
      if (!currentAmbiance) return;

      const min = 1;
      const max = currentAmbiance.sections;
      const next = Math.max(min, Math.min(currentSection + delta, max));

      setCurrentSection(next);
    },
    [currentSection, currentAmbiance, setCurrentSection]
  );

  // Updates global volume when muting / unmuting
  const updateGlobalVolume = useCallback(() => {
    // If global volume is greater than 0, set it to 0 when mute
    if (globalVolume && globalVolume > 0) {
      lastGlobalVolume.current = globalVolume;
      setGlobalVolume?.(0);
    } else {
      // If last global volume was 0 before muting, set it to 0.5 when unmuting
      if (lastGlobalVolume.current > 0) {
        setGlobalVolume?.(lastGlobalVolume.current);
      } else {
        setGlobalVolume?.(0.5);
      }
    }
  }, [setGlobalVolume, globalVolume]);

  // Reset timer when section changes, but not when pause state changes
  useEffect(() => {
    // Check if section or ambiance has changed
    const sectionChanged = prevSectionRef.current !== currentSection;
    const ambianceChanged = prevAmbianceRef.current !== currentAmbiance;

    // Update refs to current values
    prevSectionRef.current = currentSection;
    prevAmbianceRef.current = currentAmbiance;

    // Only reset timer when section or ambiance changes
    if (sectionChanged || ambianceChanged) {
      setTimer(0);
    }
  }, [currentSection, currentAmbiance]);

  // Handle timer updates
  useEffect(() => {
    if (currentSection <= 0 || !currentAmbiance || paused) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        const next = prev + 1;
        if (sectionDuration && next >= sectionDuration) {
          if (currentSection === currentAmbiance.sections) {
            clearInterval(interval);
            setTimeout(() => updateSection(-currentSection + 1), 0);
            setTimeout(() => setPaused?.(true), 0);
            return 0;
          }
          clearInterval(interval);
          // Set timeout necessary to avoid rendering parent at the same time as the child (avoid errors)
          setTimeout(() => updateSection(1), 0);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    currentSection,
    currentAmbiance,
    setCurrentSection,
    sectionDuration,
    updateSection,
    paused,
    setPaused,
  ]);

  // Helper function to format seconds to hh:mm:ss format
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const padZero = (num: number): string => num.toString().padStart(2, "0");
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  };

  return (
    <div
      className=" p-4 flex flex-col text-gray-300 text-lg font-bold"
      style={{ background: "rgb(7, 12, 23)" }}
    >
      <div className="flex flex-row gap-4">
        <div
          onClick={() => updateSection(-1)}
          className=" flex flex-col justify-center align-center border-0 border-gray-800 py-1 px-4 hover:bg-gray-800 hover:cursor-pointer bg-gray-900"
        >
          &lt;
        </div>
        <div className="flex flex-col justify-center align-center flex-1 border-0 border-gray-950 py-1 px-4 hover:bg-gray-800 hover:cursor-pointer bg-gray-900">
          <p className="text-gray-500 text-lg font-bold text-sm">
            {currentAmbiance
              ? `PART ${currentSection}/${currentAmbiance.sections}`
              : "Click here to"}
          </p>
          <p className="">
            {currentAmbiance
              ? currentAmbiance.ambiance_name
              : "Load an ambiance"}
          </p>
          {currentAmbiance ? (
            <p className="text-gray-500 text-lg font-bold text-sm">
              {formatTime(timer)} / {formatTime(sectionDuration)}
            </p>
          ) : (
            <p className="text-gray-500 text-lg font-bold text-sm">~</p>
          )}
        </div>
        <div
          onClick={() => updateSection(1)}
          className=" flex flex-col justify-center align-center border-0 border-gray-800 py-1 px-4 hover:bg-gray-800 hover:cursor-pointer bg-gray-900"
        >
          &gt;
        </div>
      </div>
      <div className="flex flex-row gap-4">
        {setPaused !== undefined && (
          <div
            onClick={() => setPaused(!paused)}
            className=" text-xs mt-4  flex flex-col justify-center align-center border-0 border-gray-800 py-2 px-2 hover:bg-gray-800 hover:cursor-pointer bg-gray-900"
          >
            {paused ? (
              <PlayIcon className="w-4 h-4 text-gray-200" />
            ) : (
              <PauseIcon className="w-4 h-4 text-gray-200" />
            )}
          </div>
        )}

        <div className="flex-1 text-md mt-4 flex flex-row items-center border-0 border-gray-800 bg-emerald-900 hover:cursor-pointer relative">
          {/* Volume Icon */}
          <div
            onClick={updateGlobalVolume}
            className="flex justify-center items-center bg-gray-900 py-2 px-2 hover:bg-gray-800 border-r-2 border-gray-800"
          >
            <VolumeIcon
              className={`w-4 h-4 ${
                globalVolume === 0 ? "text-gray-500" : "text-gray-200"
              }`}
            />
          </div>

          {/* Range Input with custom visual track */}
          <div className="relative flex-1 h-8">
            {/* Background track */}
            <div className="absolute inset-0 bg-emerald-900"></div>

            {/* Filled portion */}
            <div
              className="absolute inset-y-0 bg-emerald-600"
              style={{ width: `${(globalVolume ?? 0) * 100}%` }}
            ></div>

            {/* Range input (functional but invisible) */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={globalVolume ?? 0}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                setGlobalVolume?.(newValue);
              }}
              className="w-full h-full opacity-0 cursor-pointer z-10"
            />
          </div>
        </div>
      </div>
      <div className="flex-1 text-xs mt-4  flex flex-col justify-center align-center border-0 border-gray-800 py-2 px-8 hover:bg-gray-800 hover:cursor-pointer bg-gray-900">
        ADVANCED SETTINGS
      </div>
    </div>
  );
}
