import AmbianceMenu from "./AmbianceMenu";
import { Settings } from "lucide-react";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function Header() {
  const openSettingsMenu = useGlobalStore((state) => state.openSettingsMenu);
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );

  // after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-gray-800 after:to-transparent (tw classes to had into header to make a gradient border)

  return (
    <header
      aria-label="main header"
      className={`relative flex text-center justify-between p-3  ${
        currentAmbiance
          ? "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-gray-800 after:to-transparent"
          : ""
      } `}
    >
      <h1
        aria-label="logo"
        onClick={() => setCurrentAmbiance(null)}
        className="tracking-[-0] font-title font-mansalva text-4xl text-emerald-300 py-2 px-6
        hover:cursor-pointer flex items-center transform -translate-y-1"
      >
        frog
      </h1>

      <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
        {currentAmbiance && <AmbianceMenu />}
      </div>

      <button
        aria-label="settings button"
        onClick={openSettingsMenu}
        className={`flex flex-row justify-start rounded-full items-center py-2 px-3 text-center text-gray-400 text-lg font-bold hover:bg-gray-800 hover:cursor-pointer h-full`}
      >
        <Settings className="w-8 h-8 text-gray-300" />
      </button>
    </header>
  );
}
