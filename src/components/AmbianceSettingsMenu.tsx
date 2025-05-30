import { useGlobalStore } from "@/stores/useGlobalStore";
import React, { useRef } from "react";

export default function AmbianceSettingsMenu() {
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (currentAmbiance && inputRef.current) {
      const newAmbianceName = inputRef.current.value.trim();

      if (newAmbianceName) {
        setCurrentAmbiance({
          ...currentAmbiance,
          ambiance_name: newAmbianceName,
        });
      }
    }
  };

  return (
    <div
      aria-label="search sounds menu"
      className="p-4 pb-1 text-gray-300 rounded-md bg-gray-950"
      style={{ background: "rgb(7, 12, 23)" }}
      // Gray 925
    >
      <div aria-label="sound search bar" className="flex mb-3 align-center">
        <input
          ref={inputRef}
          type="text"
          defaultValue={currentAmbiance ? currentAmbiance.ambiance_name : ""}
          placeholder="Ambiance name"
          className="flex-1 p-1 pl-2 text-sm font-bold text-gray-300 placeholder-gray-500 transition-colors duration-200 border-2 border-r-2 border-gray-800 bg-gray-950 focus:outline-none focus:border-emerald-700"
        />
        <button
          aria-label="save button"
          className="px-4 py-2 pl-3 text-sm font-bold text-gray-300 bg-gray-800 hover:bg-gray-700 hover:cursor-pointer"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
}
