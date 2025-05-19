export interface Ambiance {
  id: number;
  ambiance_name: string;
  author_id: number;
  ambiance_sounds: AmbianceSound[];
}

export interface AmbianceSound {
  id: number;
  sound_id: number;
  volume: number;
  reverb: number;
  direction: number;
}

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

export interface SoundBasicInformations {
  id: number;
  sound_name: string;
  image_path: string;
}
