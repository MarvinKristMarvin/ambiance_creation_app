"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sounds from "@/components/Sounds";
import { useEffect } from "react";
import { useGlobalStore } from "@/stores/useGlobalStore";

export default function Home() {
  // Zustand states
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const setCurrentSection = useGlobalStore((state) => state.setCurrentSection);

  // When the ambiance changes, set the current section to 1
  useEffect(() => {
    console.log(currentAmbiance);
    setCurrentSection(1);
  }, [currentAmbiance, setCurrentSection]);

  return (
    <main className="flex flex-col w-screen h-screen bg-gray-950">
      <Header />
      {currentAmbiance ? <Sounds /> : <Hero />}
    </main>
  );
}
