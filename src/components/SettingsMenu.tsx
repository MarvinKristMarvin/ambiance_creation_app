import { useGlobalStore } from "@/stores/useGlobalStore";
import React from "react";

export default function SettingsMenu() {
  // Zustand
  const soundsCentering = useGlobalStore((state) => state.soundsCentering);
  const setSoundsCentering = useGlobalStore(
    (state) => state.setSoundsCentering
  );

  // Options to map the sounds positionning buttons
  const positions = ["left", "center", "right"] as const;

  return (
    <div
      aria-label="settings menu"
      className="p-4 text-gray-300 rounded-md bg-gray-950"
      style={{ background: "rgb(7, 12, 23)" }}
    >
      <p className="mb-4 text-sm font-bold text-left text-gray-400">
        Sounds positionning
      </p>
      <div className="flex gap-4">
        {positions.map((position) => (
          <button
            aria-label={`${position} position button`}
            key={position}
            onClick={() => setSoundsCentering(position)}
            className={`flex-1 py-2 font-bold text-xs hover:bg-gray-800 hover:cursor-pointer rounded-full ${
              soundsCentering === position
                ? "bg-gray-700 text-gray-300" // Active state
                : "bg-gray-900 text-gray-500" // Inactive state
            }`}
          >
            {position.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
