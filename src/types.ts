export interface Ambiance {
  id: number;
  ambiance_name: string;
  author_id: number;
  ambiance_sounds: AmbianceSound[];
}

// Sound used in an ambiance with its own volume, reverb etc
export interface AmbianceSound {
  id: number;
  sound_id: number;
  volume: number;
  reverb: number;
  reverb_duration: number;
  speed: number;
  direction: number;
  repeat_delay: number[] | null;
}

export interface AmbianceBasicInformations {
  id: number;
  ambiance_name: string;
  categories: string[];
  themes: string[];
  author_id: string;
  is_favorite: boolean;
  number_of_favorites: number;
}

// Sound data with default values
export interface Sound {
  id: number;
  sound_name: string;
  audio_paths: string[];
  image_path: string;
  looping: boolean;
  volume: number;
  reverb: number;
  reverb_duration: number;
  speed: number;
  direction: number;
  category: string;
  repeat_delay: number[] | null;
}

// Sound for display purposes in the search sounds menu
export interface SoundBasicInformations {
  id: number;
  sound_name: string;
  image_path: string;
  audio_paths: string[];
  looping: boolean;
  volume: number;
  is_favorite: boolean;
}

// Toasts
export type ToastType = "success" | "warning" | "error" | "info";

export type ToastIcon =
  | "star"
  | "note"
  | "music"
  | "ghost"
  | "check"
  | "warning"
  | "error"
  | "info";

export interface ToastConfig {
  id: string;
  type: ToastType;
  icon: ToastIcon;
  message: string;
  duration?: number;
}
