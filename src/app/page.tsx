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
import { syncSoundsUsedWithIndexedDb } from "@/lib/sync";

export default function Home() {
  // Zustand
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const searchSoundsMenu = useGlobalStore((state) => state.searchSoundsMenu);
  const settingsMenu = useGlobalStore((state) => state.settingsMenu);
  const searchAmbianceMenu = useGlobalStore(
    (state) => state.searchAmbianceMenu
  );
  const ambianceSettingsMenu = useGlobalStore(
    (state) => state.ambianceSettingsMenu
  );

  // Modal management functions from store
  const closeAllModals = useGlobalStore((state) => state.closeAllModals);

  const AudioManager = () => {
    const soundsUsed = useGlobalStore((state) => state.soundsUsed);

    useEffect(() => {
      if (soundsUsed.length > 0) {
        syncSoundsUsedWithIndexedDb(soundsUsed);
      }
    }, [soundsUsed]);

    return null;
  };

  // Start Tone.js on first interaction
  useEffect(() => {
    const startAudioContext = async () => {
      try {
        await Tone.start();
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
    <div className="flex fullscreen-container bg-gray-950">
      <AudioManager />
      <main className="flex flex-col w-screen h-full min-w-0 ">
        {currentAmbiance ? (
          <>
            <Header />
            <div className="relative w-full h-full min-w-0 overflow-y-auto">
              <Sounds />
              <ToastContainer />
            </div>{" "}
          </>
        ) : (
          <Hero />
        )}
      </main>

      <aside className="min-h-full bg-gray-900">
        {settingsMenu && (
          <Modal onClose={closeAllModals} title="User settings">
            <SettingsMenu />
          </Modal>
        )}
        {searchAmbianceMenu && (
          <Modal onClose={closeAllModals} title="Search an ambiance">
            <SearchAmbianceMenu />
          </Modal>
        )}
        {searchSoundsMenu && (
          <Modal onClose={closeAllModals} title="Add a new sound">
            <SearchSoundsMenu />
          </Modal>
        )}
        {ambianceSettingsMenu && (
          <Modal onClose={closeAllModals} title="Ambiance settings">
            <AmbianceSettingsMenu />
          </Modal>
        )}
      </aside>
    </div>
  );
}
