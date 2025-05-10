export interface Ambiance {
  id: number;
  ambiance_name: string;
  author_id: number;
  likes: number;
  settings: AmbianceSettings;
  total_duration: number;
  sections: number;
}

export interface AmbianceSettings {
  sections: AmbianceSection[];
}

export interface AmbianceSection {
  sounds: AmbianceSound[];
  smoothing_time: number;
  duration: number;
}

export interface AmbianceSound {
  sound_id: number;
  number: number;
  volume: number;
  reverb: number;
  direction: number;
  repeat_delay: number[];
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
  repeat_delay: number[];
  category: string;
}
