"use client";

import type { Ambiance } from "../types";
import { useGlobalStore } from "@/stores/useGlobalStore";

const defaultAmbiance: Ambiance = {
  id: 0,
  ambiance_name: "My new ambiance",
  author_id: 0,
  ambiance_sounds: [],
};

export default function Hero() {
  // Zustand
  const setSearchAmbianceMenu = useGlobalStore(
    (state) => state.setSearchAmbianceMenu
  );
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );

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
            onClick={() => {
              setSearchAmbianceMenu(true);
            }}
          >
            Search an ambiance
          </button>
          <button
            aria-label="create ambiance button"
            onClick={() => setCurrentAmbiance(defaultAmbiance)}
            className="px-6 py-4 font-bold text-white border rounded-full hover:bg-emerald-950 border-emerald-700 hover:cursor-pointer text-md"
          >
            Or create a new one
          </button>
        </div>
      </div>
    </div>
  );
}
