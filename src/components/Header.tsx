import AmbianceMenu from "./AmbianceMenu";
import { Settings } from "lucide-react";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function Header() {
  const setSettingsMenu = useGlobalStore((state) => state.setSettingsMenu);

  return (
    <header
      aria-label="main header"
      className="relative flex text-center justify-between p-5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-gray-800 after:to-transparent"
    >
      <h1
        aria-label="logo"
        className="tracking-[-0] font-title font-mansalva text-4xl text-emerald-300 py-2 px-6
        hover:cursor-pointer flex items-center transform -translate-y-1"
      >
        frog
      </h1>

      <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
        <AmbianceMenu />
      </div>

      <button
        aria-label="settings button"
        onClick={() => setSettingsMenu(true)}
        className={`flex flex-row justify-start rounded-full items-center py-2 px-3 text-center text-gray-400 text-lg font-bold hover:bg-gray-800 hover:cursor-pointer h-full`}
      >
        <Settings className="w-8 h-8 text-gray-300" />
      </button>
    </header>
  );
}
