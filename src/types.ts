export interface Ambiance {
  id: number;
  ambiance_name: string;
  author_id: string;
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
  low: number;
  mid: number;
  high: number;
  low_cut: number;
  high_cut: number;
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

// IndexedDbSound has the same properties as Sound but with an array of real mp3 files
export interface IndexedDbSound extends Sound {
  storageIndex: number;
  audios: Blob[];
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
export type ToastType = "success" | "warning" | "error" | "info" | "neutral";

export type ToastIcon =
  | "star"
  | "note"
  | "ambiance"
  | "check"
  | "warning"
  | "error"
  | "info"
  | "addsound"
  | "user"
  | "delete";

export interface ToastConfig {
  id: string;
  type: ToastType;
  icon: ToastIcon;
  message: string;
  duration?: number;
}
