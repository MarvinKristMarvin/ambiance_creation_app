import { create } from "zustand";
import {
  Sound,
  Ambiance,
  SoundBasicInformations,
  AmbianceBasicInformations,
} from "@/types";

interface Store {
  soundsCentering: string;
  setSoundsCentering: (value: string) => void;

  currentAmbiance: Ambiance | null;
  setCurrentAmbiance: (value: Ambiance | null) => void;

  soundsUsed: Sound[];
  setSoundsUsed: (value: Sound[]) => void;

  paused: boolean;
  setPaused: (value: boolean) => void;

  globalVolume: number;
  setGlobalVolume: (value: number) => void;

  searchSoundsMenu: boolean;
  setSearchSoundsMenu: (value: boolean) => void;

  settingsMenu: boolean;
  setSettingsMenu: (value: boolean) => void;

  searchAmbianceMenu: boolean;
  setSearchAmbianceMenu: (value: boolean) => void;

  ambianceSettingsMenu: boolean;
  setAmbianceSettingsMenu: (value: boolean) => void;

  // Search sounds menu
  searchedSoundsBasicInformations: SoundBasicInformations[];
  setSearchedSoundsBasicInformations: (value: SoundBasicInformations[]) => void;

  // Search ambiance menu
  searchedAmbiancesBasicInformations: AmbianceBasicInformations[];
  setSearchedAmbiancesBasicInformations: (
    value: AmbianceBasicInformations[]
  ) => void;
}

export const useGlobalStore = create<Store>((set) => ({
  soundsCentering: "Center",
  setSoundsCentering: (value) => set({ soundsCentering: value }),

  currentAmbiance: null,
  setCurrentAmbiance: (value) => set({ currentAmbiance: value }),

  soundsUsed: [],
  setSoundsUsed: (value) => set({ soundsUsed: value }),

  paused: false,
  setPaused: (value) => set({ paused: value }),

  globalVolume: 1,
  setGlobalVolume: (value) => set({ globalVolume: value }),

  searchSoundsMenu: false,
  setSearchSoundsMenu: (value) => set({ searchSoundsMenu: value }),

  settingsMenu: false,
  setSettingsMenu: (value) => set({ settingsMenu: value }),

  searchAmbianceMenu: false,
  setSearchAmbianceMenu: (value) => set({ searchAmbianceMenu: value }),

  ambianceSettingsMenu: false,
  setAmbianceSettingsMenu: (value) => set({ ambianceSettingsMenu: value }),

  // Search sounds menu
  searchedSoundsBasicInformations: [],
  setSearchedSoundsBasicInformations: (value) =>
    set({ searchedSoundsBasicInformations: value }),

  // Search ambiance menu
  searchedAmbiancesBasicInformations: [],
  setSearchedAmbiancesBasicInformations: (value) =>
    set({ searchedAmbiancesBasicInformations: value }),
}));
