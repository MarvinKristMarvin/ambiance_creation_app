import { useCallback, useEffect, useRef, useState } from "react";
import { useGlobalStore } from "@/stores/useGlobalStore";
import {
  SkipForward,
  SkipBack,
  Plus,
  Volume2,
  Star,
  Search,
  Settings,
  Pencil,
  //AudioWaveform,
} from "lucide-react";
import { useShowToast } from "@/hooks/useShowToast";

export default function AmbianceMenu() {
  const { ShowToast } = useShowToast();
  // Zustand
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const globalVolume = useGlobalStore((state) => state.globalVolume);
  const setGlobalVolume = useGlobalStore((state) => state.setGlobalVolume);
  const openSearchAmbianceMenu = useGlobalStore(
    (state) => state.openSearchAmbianceMenu
  );
  const openAmbianceSettingsMenu = useGlobalStore(
    (state) => state.openAmbianceSettingsMenu
  );
  const openSearchSoundsMenu = useGlobalStore(
    (state) => state.openSearchSoundsMenu
  );
  const setRefreshSearchAmbianceMenu = useGlobalStore(
    (state) => state.setRefreshSearchAmbianceMenu
  );
  const openSettingsMenu = useGlobalStore((state) => state.openSettingsMenu);
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );

  // States
  const [saveState, setSaveState] = useState("idle");

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

  // Save as new ambiance, but if author id = session id and ambiance name already exist, patch the ambiance
  const handleSaveAmbiance = async () => {
    try {
      if (!currentAmbiance || saveState === "loading") return;

      setSaveState("loading");
      setRefreshSearchAmbianceMenu(true);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...ambianceWithoutId } = currentAmbiance;
      const response = await fetch("/api/post_ambiance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ambianceWithoutId),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - user needs to log in
          setSaveState("idle");
          ShowToast(
            "error",
            "error",
            "Please log in to save an ambiance in favorites",
            5000
          );

          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log("Ambiance saved successfully:", result.data);
        setSaveState("saved");
        ShowToast("success", "star", "Ambiance saved successfully");

        // Optionally update the current ambiance with the returned data (including new ID)
        // setCurrentAmbiance(result.data);
      } else {
        console.error("Failed to save ambiance:", result.error);
        setSaveState("idle");
      }
    } catch (error) {
      console.error("Error saving ambiance:", error);
      setSaveState("idle");
    }
  };

  // Save ambiance when ambiance name changes but not when id changes
  //! Maybe not the best solution for production
  const [prevAmbianceId, setPrevAmbianceId] = useState(currentAmbiance?.id);
  const isFirstRender = useRef(0);

  useEffect(() => {
    if (!currentAmbiance) return;

    // Skip on initial load
    if (isFirstRender.current < 2) {
      isFirstRender.current += 1;
      setPrevAmbianceId(currentAmbiance.id);
      return;
    }

    // Only save if the ID didn't change (i.e., it's the same ambiance)
    if (
      prevAmbianceId === currentAmbiance.id &&
      prevAmbianceId !== 0 &&
      currentAmbiance.id !== 0
    ) {
      handleSaveAmbiance();
    }

    setPrevAmbianceId(currentAmbiance.id);
  }, [currentAmbiance?.ambiance_name]);

  // Reset save button load state when ambiance changes
  useEffect(() => {
    setSaveState("idle");
  }, [currentAmbiance?.ambiance_sounds, currentAmbiance?.ambiance_name]);

  return (
    <>
      <div
        aria-label="mute button, volume slider and play button"
        className="flex flex-row flex-1 h-12 gap-4 mx-0"
      >
        <div className="relative flex flex-row items-center flex-1 h-full rounded-full text-md hover:cursor-pointer">
          <div className="h-12 mr-4 bg-gray-900 rounded-full hover:cursor-pointer hover:bg-gray-800">
            <h1
              aria-label="logo"
              onClick={() => setCurrentAmbiance(null)}
              className="tracking-[3] font-title font-light text-2xl text-gray-200 
        hover:cursor-pointer  flex items-center transform justify-center px-4 translate-y-[0.6rem] translate-x-[0.2rem] "
            >
              {/* <MenuIcon className="w-8 h-8 fill-current text-emerald-300" /> */}
              FOG
            </h1>
          </div>
          <button
            aria-label="mute button"
            onClick={updateGlobalVolume}
            className="relative flex items-center h-full px-4 py-2 mr-4 text-xs bg-gray-900 rounded-full hover:bg-gray-800 hover:cursor-pointer"
            style={{ zIndex: 2 }}
          >
            <Volume2
              className={`w-4.5 h-4.5 ${
                globalVolume < 0.001 ? "text-gray-500" : "text-gray-200"
              }`}
            />
          </button>
          <div
            aria-label="ambiance volume slider"
            className="relative flex-1 h-full mr-0 overflow-hidden rounded-full min-w-72"
          >
            {/* Background track */}
            <div className="absolute inset-0 h-full rounded-full bg-emerald-950"></div>

            {/* Filled portion */}
            <div
              className="absolute h-full bg-emerald-500"
              style={{ width: `${globalVolume * 100}%` }}
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
      </div>

      <div
        aria-label="ambiance swapper"
        className="flex flex-row h-12 mx-0 bg-gray-900 rounded-full flex-2 min-w-80"
      >
        <button
          aria-label="previous ambiance button"
          className="hidden flex flex-col justify-center px-3.5 py-1 pr-2.5 bg-gray-900 border-0 border-r-2 rounded-l-full align-center hover:bg-gray-800 hover:cursor-pointer border-gray-950"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          aria-label="current ambiance button"
          onClick={openAmbianceSettingsMenu}
          className="flex flex-col items-center justify-center px-6 py-1 overflow-hidden bg-gray-900 border-0 rounded-full flex-2 border-gray-950 hover:bg-gray-800 hover:cursor-pointer"
        >
          <div className="relative flex items-center justify-center w-full gap-3 overflow-hidden text-sm leading-none text-center">
            <span>
              {currentAmbiance
                ? currentAmbiance.ambiance_name
                : "edit ambiance"}{" "}
            </span>
            <span>
              <Pencil className="w-4 h-4 text-gray-200"></Pencil>
            </span>
          </div>

          {currentAmbiance?.ambiance_name === "My ambiance name" && (
            <p className="hidden text-sm font-bold text-gray-500 ">
              search an ambiance
            </p>
          )}
        </button>

        <button
          aria-label="next ambiance button"
          className="hidden flex flex-col justify-center px-3.5 py-1 pl-2.5 bg-gray-900 border-0 border-l-2 rounded-r-full align-center hover:bg-gray-800 hover:cursor-pointer border-gray-950"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      <div
        aria-label="ambiance settings button and add sound button"
        className="flex flex-1 h-12"
      >
        <button
          aria-label="ambiance settings button"
          onClick={openSearchAmbianceMenu}
          className="flex items-center flex-1 justify-center h-full px-3.75 py-1 text-sm bg-gray-900 border-0 border-gray-800 rounded-full hover:bg-gray-800 hover:cursor-pointer"
        >
          <Search
            className="w-4.5 h-4.5 text-gray-200 transform rotate-y-180 "
            strokeWidth={2.5}
          />
          <span className="pr-1 ml-2 text-sm">Ambiances</span>
        </button>

        <button
          aria-label="add sound button"
          onClick={openSearchSoundsMenu}
          className="flex items-center justify-center flex-1 h-full px-3 py-1 pr-5 ml-4 text-sm bg-gray-900 border-0 border-gray-800 rounded-full hover:bg-gray-800 hover:cursor-pointer"
        >
          <Plus className="w-5.5 h-5.5 justify-self-start" strokeWidth={2.5} />
          <p className="pr-0.5 ml-1">Sound</p>
        </button>
        <button
          aria-label="save ambiance button"
          onClick={saveState === "idle" ? handleSaveAmbiance : undefined}
          disabled={
            saveState === "loading" ||
            saveState === "saved" ||
            currentAmbiance?.ambiance_sounds.length === 0
          }
          className="flex items-center justify-center flex-1 h-full py-1 ml-4 text-sm bg-gray-900 border-0 border-gray-800 rounded-full w-26 text-md hover:bg-gray-800 hover:cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          {saveState === "loading" && (
            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
          )}
          {saveState === "saved" && (
            <>
              <p className="ml-0.5 text-amber-200">Saved</p>
            </>
          )}
          {saveState === "idle" && (
            <>
              <Star className="w-4.5 h-4.5 text-amber-200/90" />
              <p className="ml-1.5 pr-1 text-amber-200/90">Save</p>
            </>
          )}
        </button>
        <button
          aria-label="settings button"
          onClick={openSettingsMenu}
          className={`flex flex-row justify-center items-center bg-gray-900 ml-4  px-3 text-center text-gray-400 text-lg font-bold hover:bg-gray-800  h-12  rounded-full hover:cursor-pointer `}
        >
          <Settings className="w-6 h-6 text-gray-300" />
        </button>
      </div>
    </>
  );
}
