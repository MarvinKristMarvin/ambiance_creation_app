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
  direction: number;
}

export interface AmbianceBasicInformations {
  id: number;
  ambiance_name: string;
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
  direction: number;
  category: string;
}

// Sound for display purposes in the search sounds menu
export interface SoundBasicInformations {
  id: number;
  sound_name: string;
  image_path: string;
  audio_paths: string[];
  looping: boolean;
  volume: number;
}
