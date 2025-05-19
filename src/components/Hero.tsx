"use client";

import type { Ambiance, Sound } from "../types";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function Hero() {
  // Zustand states
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );
  const setSoundsUsed = useGlobalStore((state) => state.setSoundsUsed);

  const loadAmbianceAndSounds = async () => {
    try {
      const loadedAmbiance = await fetch("/api/ambiances/1");
      // If the response is not ok, throw an error (stops execution and go to catch)
      if (!loadedAmbiance.ok) throw new Error("Failed to load ambiance");
      // Data retrieved must be of type Ambiance
      const data: Ambiance = await loadedAmbiance.json();
      setCurrentAmbiance(data);
      console.log("Ambiance loaded : ", data);
      const loadedSounds = await fetch("/api/ambiances/sounds/1");
      if (!loadedSounds.ok) throw new Error("Failed to load sounds");
      const soundsData: Sound[] = await loadedSounds.json();
      setSoundsUsed(soundsData);
      console.log("Sounds used : ", soundsData);
    } catch (error) {
      console.error("Error loading ambiance or sounds :", error);
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 text-center align-center">
      <h2 className="font-title text-7xl mb-8 text-emerald-300 tracking-[-9]">
        frog
      </h2>
      <p className="mb-6 text-xl font-bold text-gray-300">
        Create or listen to community made ambiances
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          className="px-6 py-4 font-bold text-white bg-emerald-600 hover:bg-emerald-500 hover:cursor-pointer text-md"
          onClick={loadAmbianceAndSounds}
        >
          Load an ambiance
        </button>
        <button className="px-6 py-4 font-bold text-white border hover:bg-emerald-950 border-emerald-700 hover:cursor-pointer text-md">
          Or create a new one
        </button>
      </div>
    </div>
  );
}
