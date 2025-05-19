"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sounds from "@/components/Sounds";
import { useEffect } from "react";
import { useGlobalStore } from "@/stores/useGlobalStore";
import Modal from "@/components/Modal";
import SearchSoundsMenu from "@/components/SearchSoundsMenu";
import SettingsMenu from "@/components/SettingsMenu";

export default function Home() {
  // Zustand states
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const searchSoundsMenu = useGlobalStore((state) => state.searchSoundsMenu);
  const setSearchSoundsMenu = useGlobalStore(
    (state) => state.setSearchSoundsMenu
  );
  const settingsMenu = useGlobalStore((state) => state.settingsMenu);
  const setSettingsMenu = useGlobalStore((state) => state.setSettingsMenu);

  // When the ambiance changes, set the current section to 1
  useEffect(() => {
    console.log(currentAmbiance);
  }, [currentAmbiance]);

  const handleCloseSearchSoundsMenu = () => setSearchSoundsMenu(false);
  const handleCloseSettingsMenu = () => setSettingsMenu(false);

  return (
    <main className="flex flex-col w-screen h-screen bg-gray-950">
      <Header />
      {currentAmbiance ? <Sounds /> : <Hero />}
      {searchSoundsMenu && (
        <Modal onClose={handleCloseSearchSoundsMenu} title="Add a new sound">
          <SearchSoundsMenu />
        </Modal>
      )}
      {settingsMenu && (
        <Modal onClose={handleCloseSettingsMenu} title="Settings">
          {<SettingsMenu />}
        </Modal>
      )}
    </main>
  );
}
