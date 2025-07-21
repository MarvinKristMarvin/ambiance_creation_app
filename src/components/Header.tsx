import AmbianceMenu from "./AmbianceMenu";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function Header() {
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);

  // after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-gray-800 after:to-transparent (tw classes to had into header to make a gradient border)

  return (
    <header
      aria-label="main header"
      className={`relative flex text-center justify-center font-bold mb-4 sm:mb-0 p-4 gap-4 flex-wrap border-b-1 sm:border-0 border-gray-800 bg-gray-900 sm:bg-transparent`}
      // className={`relative flex text-center justify-between p-3   ${
      //   currentAmbiance
      //     ? "after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-gray-800 after:to-transparent"
      //     : ""
      // } `}
    >
      {currentAmbiance && <AmbianceMenu />}
    </header>
  );
}
