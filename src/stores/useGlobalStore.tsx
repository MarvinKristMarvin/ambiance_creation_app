import { create } from "zustand";
import {
  Sound,
  Ambiance,
  SoundBasicInformations,
  AmbianceBasicInformations,
  ToastConfig,
  ToastType,
  ToastIcon,
} from "@/types";

interface Store {
  soundsCentering: string;
  setSoundsCentering: (value: string) => void;
  currentAmbiance: Ambiance | null;
  setCurrentAmbiance: (value: Ambiance | null) => void;
  soundsUsed: Sound[];
  setSoundsUsed: (value: Sound[]) => void;
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
  // Toast
  toasts: ToastConfig[];
  showToast: (
    type: ToastType,
    icon: ToastIcon,
    message: string,
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  // Modal management functions
  openSettingsMenu: () => void;
  openSearchSoundsMenu: () => void;
  openSearchAmbianceMenu: () => void;
  openAmbianceSettingsMenu: () => void;
  closeAllModals: () => void;
  // Refresh search ambiance menu when save ambiance
  refreshSearchAmbianceMenu: boolean;
  setRefreshSearchAmbianceMenu: (value: boolean) => void;
}

export const useGlobalStore = create<Store>((set) => ({
  soundsCentering: "Center",
  setSoundsCentering: (value) => set({ soundsCentering: value }),
  currentAmbiance: null,
  setCurrentAmbiance: (value) => set({ currentAmbiance: value }),
  soundsUsed: [],
  setSoundsUsed: (value) => set({ soundsUsed: value }),
  globalVolume: 0.5,
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
  // Modal management functions
  openSettingsMenu: () =>
    set({
      settingsMenu: true,
      searchSoundsMenu: false,
      searchAmbianceMenu: false,
      ambianceSettingsMenu: false,
    }),
  openSearchSoundsMenu: () =>
    set({
      settingsMenu: false,
      searchSoundsMenu: true,
      searchAmbianceMenu: false,
      ambianceSettingsMenu: false,
    }),
  openSearchAmbianceMenu: () =>
    set({
      settingsMenu: false,
      searchSoundsMenu: false,
      searchAmbianceMenu: true,
      ambianceSettingsMenu: false,
    }),
  openAmbianceSettingsMenu: () =>
    set({
      settingsMenu: false,
      searchSoundsMenu: false,
      searchAmbianceMenu: false,
      ambianceSettingsMenu: true,
    }),
  closeAllModals: () =>
    set({
      settingsMenu: false,
      searchSoundsMenu: false,
      searchAmbianceMenu: false,
      ambianceSettingsMenu: false,
    }),
  // Toasts
  toasts: [],
  showToast: (type, icon, message, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastConfig = { id, type, icon, message, duration };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    // Auto-remove toast after full duration (Toast component handles fade-out)
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clearAllToasts: () => {
    set({ toasts: [] });
  },
  // Refresh search ambiance menu when save ambiance
  refreshSearchAmbianceMenu: false,
  setRefreshSearchAmbianceMenu: (value) =>
    set({ refreshSearchAmbianceMenu: value }),
}));
