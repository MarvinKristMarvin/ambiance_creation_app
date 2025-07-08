import { useGlobalStore } from "@/stores/useGlobalStore";
import { Pencil } from "lucide-react";
import React, { useRef } from "react";

export default function AmbianceSettingsMenu() {
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );

  // const { ShowToast } = useShowToast();

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
      aria-label="ambiance settings menu"
      className="pb-1 text-gray-300 rounded-md"
    >
      <p className="mb-2 ml-1 font-bold text-left text-gray-300 text-md">
        Your ambiance name
      </p>
      <div aria-label="name" className="relative flex flex-col justify-center">
        <input
          ref={inputRef}
          type="text"
          defaultValue={currentAmbiance ? currentAmbiance.ambiance_name : ""}
          placeholder="Ambiance name"
          className="w-full py-1.5 pr-8 pl-2.5 text-sm font-bold text-gray-300 placeholder-gray-600 transition-colors duration-200 border-2 border-gray-900 rounded-sm bg-gray-950 focus:outline-none focus:border-emerald-700"
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
        />
        <Pencil className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2" />
      </div>
    </div>
  );
}
