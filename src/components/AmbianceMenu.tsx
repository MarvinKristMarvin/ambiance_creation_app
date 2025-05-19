import VolumeIcon from "@/components/icons/VolumeIcon";
import PauseIcon from "@/components/icons/PauseIcon";
import PlayIcon from "@/components/icons/PlayIcon";
import { useCallback, useEffect, useRef } from "react";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { Repeat, SkipForward, SkipBack, Plus } from "lucide-react";

export default function AmbianceMenu() {
  // Zustand states
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const paused = useGlobalStore((state) => state.paused);
  const setPaused = useGlobalStore((state) => state.setPaused);
  const globalVolume = useGlobalStore((state) => state.globalVolume);
  const setGlobalVolume = useGlobalStore((state) => state.setGlobalVolume);
  const setSearchSoundsMenu = useGlobalStore(
    (state) => state.setSearchSoundsMenu
  );

  const lastGlobalVolume = useRef(1);

  useEffect(() => {
    console.log("ambiance menu : ", currentAmbiance);
  });

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

  // GRAY 925 => style={{ background: "rgb(7, 12, 23)" }}

  return (
    <>
      <div className="flex flex-row h-full text-lg font-bold text-gray-300 ">
        {/* PLAY AND VOLUME */}
        <div className="flex flex-row flex-1 gap-4 mx-2 w-90">
          <div className="relative flex flex-row items-center flex-1 h-full border-0 border-gray-800 rounded-full text-md bg-emerald-900 hover:cursor-pointer">
            {/* Volume Icon */}
            <div
              onClick={updateGlobalVolume}
              className="flex items-center justify-center h-full px-6 py-2 text-xs bg-gray-900 rounded-full hover:bg-gray-800 z-5"
            >
              <VolumeIcon
                className={`w-4 h-4 ${
                  globalVolume === 0 ? "text-gray-500" : "text-gray-200"
                }`}
              />
            </div>

            {/* Range Input with custom visual track */}
            <div className="relative flex-1 h-full rounded-full">
              {/* Background track */}
              <div className="absolute inset-0 h-full rounded-full bg-emerald-900"></div>

              {/* Filled portion */}
              <div
                className="absolute inset-x-[-56] bg-emerald-400 h-full rounded-full"
                style={{ width: `${(globalVolume ?? 0) * 100 + 26}%` }}
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
                className="z-10 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
          {setPaused !== undefined && (
            <div
              onClick={() => setPaused(!paused)}
              className="flex flex-col justify-center h-full px-6 py-3 text-xs bg-gray-900 border-0 border-gray-800 rounded-full align-center hover:bg-gray-800 hover:cursor-pointer"
            >
              {paused ? (
                <PlayIcon className="w-4 h-4 text-gray-200" />
              ) : (
                <PauseIcon className="w-4 h-4 text-gray-200" />
              )}
            </div>
          )}
        </div>
        {/* AMBIANCE NAME */}
        <div className="flex flex-row flex-1 mx-2 bg-gray-900 rounded-full w-90">
          <div className="flex flex-col justify-center px-6 py-1 pr-4 bg-gray-900 border-0 border-r-2 rounded-l-full align-center hover:bg-gray-800 hover:cursor-pointer border-gray-950">
            <SkipBack />
          </div>
          <div className="flex flex-col justify-center flex-1 px-6 py-1 bg-gray-900 border-0 align-center border-gray-950 hover:bg-gray-800 hover:cursor-pointer">
            {/* <p className="text-sm text-lg font-bold text-gray-400">
      {currentAmbiance
        ? `PART ${currentSection}/${currentAmbiance.sections}`
        : "Click here to"}
    </p> */}
            <p className="w-full overflow-hidden whitespace-nowrap text-ellipsis">
              {currentAmbiance
                ? currentAmbiance.ambiance_name
                : "Load an ambiance"}
            </p>
            {currentAmbiance ? (
              <p className="text-sm font-bold text-gray-400">PLAYING</p>
            ) : (
              <p className="text-sm font-bold text-gray-500">~</p>
            )}
          </div>
          <div className="flex flex-col justify-center px-6 py-1 pl-4 bg-gray-900 border-0 border-l-2 rounded-r-full align-center hover:bg-gray-800 hover:cursor-pointer border-gray-950">
            <SkipForward />
          </div>
        </div>

        {/* REPEAT AND ADD SOUND */}
        <div className="flex flex-1 mx-2 w-90">
          <div className="flex flex-col justify-center h-full px-5 py-5 text-sm bg-gray-900 border-0 border-gray-800 rounded-full hover:bg-gray-800 hover:cursor-pointer">
            <Repeat className="text-gray-200" />
          </div>
          <div
            onClick={() => setSearchSoundsMenu(true)}
            className="flex items-center justify-between flex-1 h-full px-5 py-4 pr-6 ml-4 bg-gray-900 border-0 border-gray-800 rounded-full text-md hover:bg-gray-800 hover:cursor-pointer"
          >
            <Plus className="w-8 h-8 justify-self-start" />
            <p>Add a new sound</p>
          </div>
        </div>
      </div>
    </>
  );
}
