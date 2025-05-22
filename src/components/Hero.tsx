"use client";

import type { Ambiance, Sound } from "../types";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function Hero() {
  // Zustand
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );
  const setSoundsUsed = useGlobalStore((state) => state.setSoundsUsed);

  // Function to GET an ambiance and its sounds. Then GET used sounds default data
  const loadAmbianceAndSounds = async () => {
    try {
      const loadedAmbiance = await fetch("/api/ambiances/1");
      // If the response is not ok, throw an error (stops execution and go to catch)
      if (!loadedAmbiance.ok) throw new Error("Failed to load ambiance");
      // Data retrieved must be of type Ambiance
      const data: Ambiance = await loadedAmbiance.json();
      setCurrentAmbiance(data);
      console.log("Ambiance loaded : ", data);

      // Extract unique sound ids from the loaded ambiance
      const soundIds = [
        ...new Set(data.ambiance_sounds.map((sound) => sound.sound_id)),
      ];

      // Fetch sounds default data by their ids
      const response = await fetch("/api/get_used_sounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ soundIds }),
      });

      // Put the sounds data in the zustand array soundsUsed
      if (!response.ok) throw new Error("Failed to load sounds");
      const soundsData: Sound[] = await response.json();
      setSoundsUsed(soundsData);
      console.log("Sounds used : ", soundsData);
    } catch (error) {
      console.error("Error loading ambiance or sounds :", error);
    }
  };

  return (
    <div
      aria-label="presentation page"
      className="flex flex-col justify-center flex-1 text-center align-center"
    >
      <div className="transform -translate-y-16">
        <h2 className="font-title text-7xl mb-8 text-emerald-300 tracking-[-9]">
          frog
        </h2>
        <p className="mb-6 text-xl font-bold text-gray-300">
          Create or listen to community made ambiances
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            aria-label="load ambiance button"
            className="px-6 py-4 font-bold text-white rounded-full bg-emerald-600 hover:bg-emerald-500 hover:cursor-pointer text-md"
            onClick={loadAmbianceAndSounds}
          >
            Load an ambiance
          </button>
          <button
            aria-label="create ambiance button"
            className="px-6 py-4 font-bold text-white border rounded-full hover:bg-emerald-950 border-emerald-700 hover:cursor-pointer text-md"
          >
            Or create a new one
          </button>
        </div>
      </div>
    </div>
  );
}
