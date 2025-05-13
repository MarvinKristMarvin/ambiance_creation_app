import { create } from "zustand";
import { Sound, Ambiance } from "@/types";

interface Store {
  soundsCentering: string;
  setSoundsCentering: (value: string) => void;

  currentAmbiance: Ambiance | null;
  setCurrentAmbiance: (value: Ambiance | null) => void;

  currentSection: number;
  setCurrentSection: (value: number) => void;

  soundsUsed: Sound[];
  setSoundsUsed: (value: Sound[]) => void;

  paused: boolean;
  setPaused: (value: boolean) => void;

  globalVolume: number;
  setGlobalVolume: (value: number) => void;
}

export const useGlobalStore = create<Store>((set) => ({
  soundsCentering: "center",
  setSoundsCentering: (value) => set({ soundsCentering: value }),

  currentAmbiance: null,
  setCurrentAmbiance: (value) => set({ currentAmbiance: value }),

  currentSection: 0,
  setCurrentSection: (value) => set({ currentSection: value }),

  soundsUsed: [],
  setSoundsUsed: (value) => set({ soundsUsed: value }),

  paused: false,
  setPaused: (value) => set({ paused: value }),

  globalVolume: 1,
  setGlobalVolume: (value) => set({ globalVolume: value }),
}));
