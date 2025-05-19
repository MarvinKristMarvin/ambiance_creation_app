"use client";

import { Settings } from "lucide-react";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function HeaderButton() {
  const setSettingsMenu = useGlobalStore((state) => state.setSettingsMenu);
  return (
    <>
      <div
        onClick={() => setSettingsMenu(true)}
        className={`flex flex-row justify-start rounded-full items-center py-2 px-3 text-center text-gray-400 text-lg font-bold hover:bg-gray-800 hover:cursor-pointer h-full`}
      >
        <span className="">
          <Settings className="w-8 h-8 text-gray-300" />
        </span>
      </div>
    </>
  );
}
