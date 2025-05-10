import { useGlobalStore } from "@/stores/useGlobalStore";
import React from "react";

export default function SettingsMenu() {
  const soundsCentering = useGlobalStore((state) => state.soundsCentering);
  const setSoundsCentering = useGlobalStore(
    (state) => state.setSoundsCentering
  );

  const positions = ["left", "center", "right"] as const;

  return (
    <div className="text-gray-300 p-4" style={{ background: "rgb(7, 12, 23)" }}>
      <div className="flex gap-4">
        {positions.map((position) => (
          <button
            key={position}
            onClick={() => setSoundsCentering(position)}
            className={`flex-1 py-2 font-bold text-xs hover:bg-gray-800 hover:cursor-pointer ${
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
