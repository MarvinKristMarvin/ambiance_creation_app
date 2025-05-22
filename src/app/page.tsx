"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sounds from "@/components/Sounds";
import { useGlobalStore } from "@/stores/useGlobalStore";
import Modal from "@/components/Modal";
import SearchSoundsMenu from "@/components/SearchSoundsMenu";
import SettingsMenu from "@/components/SettingsMenu";

export default function Home() {
  // Zustand
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const searchSoundsMenu = useGlobalStore((state) => state.searchSoundsMenu);
  const setSearchSoundsMenu = useGlobalStore(
    (state) => state.setSearchSoundsMenu
  );
  const settingsMenu = useGlobalStore((state) => state.settingsMenu);
  const setSettingsMenu = useGlobalStore((state) => state.setSettingsMenu);

  // Show the hero component if there is no ambiance loaded, otherwise show the sounds component. manages modals too
  return (
    <main className="flex flex-col w-screen h-screen bg-gray-950">
      <Header />
      {currentAmbiance ? <Sounds /> : <Hero />}
      {searchSoundsMenu && (
        <Modal
          onClose={() => setSearchSoundsMenu(false)}
          title="Add a new sound"
        >
          <SearchSoundsMenu />
        </Modal>
      )}
      {settingsMenu && (
        <Modal onClose={() => setSettingsMenu(false)} title="Settings">
          {<SettingsMenu />}
        </Modal>
      )}
    </main>
  );
}
