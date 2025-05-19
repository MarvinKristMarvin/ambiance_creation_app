import HeaderButton from "@/components/HeaderButton";
import AmbianceMenu from "./AmbianceMenu";

export default function Header() {
  return (
    <header className="relative flex text-center justify-between p-5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-gray-800 after:to-transparent">
      {/* Left section - Logo */}
      <h1
        className="tracking-[-0] font-title font-mansalva text-4xl text-emerald-300 py-2 px-6
        hover:cursor-pointer flex items-center transform -translate-y-1"
      >
        frog
      </h1>

      {/* Absolutely positioned center menu */}
      <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
        <AmbianceMenu />
      </div>

      {/* Right section - Buttons */}
      <div className="">
        <HeaderButton />
      </div>
    </header>
  );
}
