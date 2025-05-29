import PauseIcon from "@/components/icons/PauseIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import { useCallback, useEffect, useRef } from "react";
import { useGlobalStore } from "@/stores/useGlobalStore";
import {
  SkipForward,
  SkipBack,
  Plus,
  SlidersHorizontal,
  Volume2,
} from "lucide-react";

export default function AmbianceMenu() {
  // Zustand
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const paused = useGlobalStore((state) => state.paused);
  const setPaused = useGlobalStore((state) => state.setPaused);
  const globalVolume = useGlobalStore((state) => state.globalVolume);
  const setGlobalVolume = useGlobalStore((state) => state.setGlobalVolume);
  const setSearchSoundsMenu = useGlobalStore(
    (state) => state.setSearchSoundsMenu
  );
  const setSearchAmbianceMenu = useGlobalStore(
    (state) => state.setSearchAmbianceMenu
  );

  // Refs
  const volumeBeforeMuting = useRef(1);

  useEffect(() => {
    console.log("current ambiance : ", currentAmbiance);
  });

  // Callback to update global volume when muting / unmuting
  const updateGlobalVolume = useCallback(() => {
    // If global volume is greater than 0, set it to 0 when muting
    if (globalVolume > 0) {
      volumeBeforeMuting.current = globalVolume;
      setGlobalVolume(0);
    } else {
      // When unmuting, set volume using the volume which was used before muting, if this volume was 0, set new volume to 0.5
      if (volumeBeforeMuting.current > 0) {
        setGlobalVolume(volumeBeforeMuting.current);
      } else {
        setGlobalVolume(0.5);
      }
    }
  }, [setGlobalVolume, globalVolume]);

  return (
    <div
      aria-label="main buttons"
      className="flex flex-row items-center h-full text-lg font-bold text-gray-300"
    >
      <div
        aria-label="mute button, volume slider and play button"
        className="flex flex-row flex-1 h-12 gap-4 mx-2 w-90"
      >
        <div className="relative flex flex-row items-center flex-1 h-full border-0 border-gray-800 rounded-full text-md bg-emerald-900 hover:cursor-pointer">
          <button
            aria-label="mute button"
            onClick={updateGlobalVolume}
            className="flex items-center h-full px-3.5 py-2 text-xs bg-gray-900 rounded-full hover:bg-gray-800 z-5 hover:cursor-pointer"
          >
            <Volume2
              className={`w-5 h-5 ${
                globalVolume < 0.001 ? "text-gray-500" : "text-gray-200"
              }`}
            />{" "}
          </button>
          <div
            aria-label="ambiance volume slider"
            className="relative flex-1 h-full rounded-full"
          >
            {/* Background track */}
            <div className="absolute inset-0 h-full rounded-full bg-emerald-900"></div>
            {/* Filled portion */}
            <div
              className="absolute inset-x-[-47] bg-emerald-400 h-full rounded-full"
              style={{ width: `${globalVolume * 100 + 18.5}%` }}
            ></div>
            {/* Range input (functional but invisible) */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={globalVolume}
              onChange={(e) => {
                const newValue = parseFloat(e.target.value);
                setGlobalVolume(newValue);
              }}
              className="z-10 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
        <button
          aria-label="play pause button"
          onClick={() => setPaused(!paused)}
          className="flex flex-col justify-center h-full px-4 py-3 text-xs bg-gray-900 border-0 border-gray-800 rounded-full align-center hover:bg-gray-800 hover:cursor-pointer"
        >
          {paused ? (
            <PlayIcon className="w-4 h-4 text-gray-200" />
          ) : (
            <PauseIcon className="w-4 h-4 text-gray-200" />
          )}
        </button>
      </div>

      <div
        aria-label="ambiance swapper"
        className="flex flex-row flex-1 h-12 mx-2 bg-gray-900 rounded-full w-90"
      >
        <button
          aria-label="previous ambiance button"
          className="flex flex-col justify-center px-3.5 py-1 pr-2.5 bg-gray-900 border-0 border-r-2 rounded-l-full align-center hover:bg-gray-800 hover:cursor-pointer border-gray-950"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          aria-label="current ambiance button"
          onClick={() => setSearchAmbianceMenu(true)}
          className="flex flex-col justify-center flex-1 px-6 py-1 bg-gray-900 border-0 align-center border-gray-950 hover:bg-gray-800 hover:cursor-pointer"
        >
          <p className="w-full overflow-hidden whitespace-nowrap text-ellipsis">
            {currentAmbiance
              ? currentAmbiance.ambiance_name
              : "Search an ambiance"}
          </p>
          {currentAmbiance && (
            <p className="hidden text-sm font-bold text-gray-400">PLAYING</p>
          )}
        </button>
        <button
          aria-label="next ambiance button"
          className="flex flex-col justify-center px-3.5 py-1 pl-2.5 bg-gray-900 border-0 border-l-2 rounded-r-full align-center hover:bg-gray-800 hover:cursor-pointer border-gray-950"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      <div
        aria-label="repeat button and add sound button"
        className="flex flex-1 h-12 mx-2 w-90"
      >
        <button
          aria-label="repeat button"
          className="flex flex-col justify-center h-full px-3.5 py-1 text-sm bg-gray-900 border-0 border-gray-800 rounded-full hover:bg-gray-800 hover:cursor-pointer"
        >
          <SlidersHorizontal
            className="w-5 h-5 text-gray-200"
            strokeWidth={2.5}
          />
        </button>
        <button
          aria-label="add sound button"
          onClick={() => setSearchSoundsMenu(true)}
          className="flex items-center justify-between flex-1 h-full px-3 py-1 pr-6 ml-4 bg-gray-900 border-0 border-gray-800 rounded-full text-md hover:bg-gray-800 hover:cursor-pointer"
        >
          <Plus className="w-7 h-7 justify-self-start" />
          <p>Add a new sound</p>
        </button>
      </div>
    </div>
  );
}
