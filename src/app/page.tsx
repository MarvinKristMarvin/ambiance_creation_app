"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sounds from "@/components/Sounds";
import { useEffect, useState } from "react";
import { Ambiance, Sound } from "../types";

export default function Home() {
  const [currentAmbiance, setCurrentAmbiance] = useState<Ambiance | null>(null);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [soundsUsed, setSoundsUsed] = useState<Sound[]>([]);
  const [paused, setPaused] = useState<boolean>(false);

  // When the ambiance changes, set the current section to 1
  useEffect(() => {
    console.log(currentAmbiance);
    setCurrentSection(1);
  }, [currentAmbiance]);

  return (
    <main className="flex min-h-screen bg-gray-950">
      <Header
        currentAmbiance={currentAmbiance}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
        paused={paused}
        setPaused={setPaused}
      />
      {currentAmbiance ? (
        <Sounds
          currentAmbiance={currentAmbiance}
          soundsUsed={soundsUsed}
          currentSection={currentSection}
          paused={paused}
        />
      ) : (
        <Hero
          setCurrentAmbiance={setCurrentAmbiance}
          setSoundsUsed={setSoundsUsed}
        />
      )}
    </main>
  );
}
