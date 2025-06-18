"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sounds from "@/components/Sounds";
import { useGlobalStore } from "@/stores/useGlobalStore";
import Modal from "@/components/Modal";
import SearchSoundsMenu from "@/components/SearchSoundsMenu";
import SettingsMenu from "@/components/SettingsMenu";
import SearchAmbianceMenu from "@/components/SearchAmbianceMenu";
import AmbianceSettingsMenu from "@/components/AmbianceSettingsMenu";
import ToastContainer from "@/components/ToastContainer";
import * as Tone from "tone";
import { useEffect } from "react";

export default function Home() {
  // Zustand
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const searchSoundsMenu = useGlobalStore((state) => state.searchSoundsMenu);
  const setSearchSoundsMenu = useGlobalStore(
    (state) => state.setSearchSoundsMenu
  );
  const settingsMenu = useGlobalStore((state) => state.settingsMenu);
  const setSettingsMenu = useGlobalStore((state) => state.setSettingsMenu);
  const searchAmbianceMenu = useGlobalStore(
    (state) => state.searchAmbianceMenu
  );
  const setSearchAmbianceMenu = useGlobalStore(
    (state) => state.setSearchAmbianceMenu
  );
  const ambianceSettingsMenu = useGlobalStore(
    (state) => state.ambianceSettingsMenu
  );
  const setAmbianceSettingsMenu = useGlobalStore(
    (state) => state.setAmbianceSettingsMenu
  );

  // Start Tone.js on first interaction
  useEffect(() => {
    const startAudioContext = async () => {
      try {
        await Tone.start();
        console.log("✅ Tone.js started");
        // Remove the event listeners after starting
        window.removeEventListener("click", startAudioContext);
        window.removeEventListener("touchstart", startAudioContext);
      } catch (err) {
        console.error("Failed to start Tone.js", err);
      }
    };

    // Add once-only user interaction handlers
    window.addEventListener("click", startAudioContext, { once: true });
    window.addEventListener("touchstart", startAudioContext, { once: true });

    return () => {
      window.removeEventListener("click", startAudioContext);
      window.removeEventListener("touchstart", startAudioContext);
    };
  }, []);

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
      {searchAmbianceMenu && (
        <Modal
          onClose={() => setSearchAmbianceMenu(false)}
          title="Search an ambiance"
        >
          {<SearchAmbianceMenu />}
        </Modal>
      )}
      {ambianceSettingsMenu && (
        <Modal
          onClose={() => setAmbianceSettingsMenu(false)}
          title="Ambiance settings"
        >
          {<AmbianceSettingsMenu />}
        </Modal>
      )}
      <ToastContainer />
    </main>
  );
}
