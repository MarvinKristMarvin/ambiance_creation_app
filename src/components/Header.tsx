import HeaderButton from "@/components/HeaderButton";
import { Ambiance } from "@/types";

interface Props {
  currentAmbiance: Ambiance | null;
  currentSection: number;
  setCurrentSection: React.Dispatch<React.SetStateAction<number>>;
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function Header({
  currentAmbiance,
  currentSection,
  setCurrentSection,
  paused,
  setPaused,
}: Props) {
  return (
    <header className="flex flex-col text-center justify-start bg-emerald-500 w-90 min-w-90">
      <h1
        className="tracking-[-14] font-title font-mansalva text-8xl text-gray-50 p-8 pb-14
  transition-all duration-200 ease-in-out
  hover:text-8xl hover:tracking-[-2] hover:pt-8 hover:cursor-pointer "
      >
        frog
      </h1>
      <div className="bg-gray-900 flex-1">
        <HeaderButton
          currentAmbiance={currentAmbiance}
          text="Ambiance"
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          paused={paused}
          setPaused={setPaused}
        />
        <HeaderButton
          currentAmbiance={currentAmbiance}
          text="Settings"
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
        />
        <HeaderButton
          currentAmbiance={currentAmbiance}
          text="My account"
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
        />
      </div>
    </header>
  );
}
