import { useGlobalStore } from "@/stores/useGlobalStore";
import { Check, Play, Search, Star } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useEffect } from "react";

export default function SearchSoundsMenu() {
  // Zustand
  const setSearchedSoundsBasicInformations = useGlobalStore(
    (state) => state.setSearchedSoundsBasicInformations
  );
  const searchedSoundsBasicInformations = useGlobalStore(
    (state) => state.searchedSoundsBasicInformations
  );
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );
  const globalVolume = useGlobalStore((state) => state.globalVolume);

  // Fetch sounds basic informations which serve to display sounds in the search menu
  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await fetch("/api/get_search_menu_sounds");
        if (!response.ok)
          throw new Error(
            "Failed to fetch sounds basic informations which serve to display sounds in the search menu"
          );
        const data = await response.json();
        // Update zustand with fetched sounds
        setSearchedSoundsBasicInformations(data);
      } catch (error) {
        console.error("Error fetching sounds:", error);
      }
    };

    fetchSounds();
  }, [setSearchedSoundsBasicInformations]);

  // Function to add a sound to the ambiance when clicking on the load sound button
  const handleAddSoundToAmbiance = async (soundId: number) => {
    try {
      console.log("Adding sound to ambiance:", soundId);
      const res = await fetch(`/api/sound/${soundId}`);
      if (!res.ok) throw new Error("Failed to fetch full sound data");
      const loadedSound = await res.json(); // full Sound object
      console.log("Loaded sound:", loadedSound[0]);
      if (!currentAmbiance) return;

      // Generate a unique ID for the new AmbianceSound
      const maxId = Math.max(
        ...currentAmbiance.ambiance_sounds.map((s) => s.id),
        0
      );

      const newAmbianceSound = {
        id: maxId + 1,
        sound_id: loadedSound[0].id,
        volume: loadedSound[0].volume,
        reverb: loadedSound[0].reverb,
        direction: loadedSound[0].direction,
      };

      setCurrentAmbiance({
        ...currentAmbiance,
        ambiance_sounds: [...currentAmbiance.ambiance_sounds, newAmbianceSound],
      });
    } catch (error) {
      console.error("Error adding sound to ambiance:", error);
    }
  };

  // Keep track of currently playing audio to stop it when playing a new sound
  let currentAudio: HTMLAudioElement | null = null;

  // Function to play a random audio from the sound's audio_paths
  const handlePlaySound = (soundId: number) => {
    // Find the sound by id
    const sound = searchedSoundsBasicInformations.find((s) => s.id === soundId);

    if (!sound || !sound.audio_paths || sound.audio_paths.length === 0) {
      console.error("Sound not found or no audio paths available");
      return;
    }

    // Stop currently playing audio if any
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Select a random audio path
    const randomIndex = Math.floor(Math.random() * sound.audio_paths.length);
    const selectedAudioPath = sound.audio_paths[randomIndex];

    if (sound.looping) {
      // For looping sounds, use range request to download only first 2 seconds
      playPartialAudio(selectedAudioPath, sound.volume);
    } else {
      // For non-looping sounds, play normally
      playFullAudio(selectedAudioPath, sound.volume);
    }

    console.log(
      `Playing ${sound.sound_name}: ${selectedAudioPath} at volume ${sound.volume}%`
    );
  };

  // Function to play full audio (for non-looping sounds)
  const playFullAudio = (audioPath: string, volume: number) => {
    const audio = new Audio(audioPath);
    audio.volume = (volume / 100) * globalVolume;

    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });

    currentAudio = audio;
  };

  // Function to play only first 3 seconds of audio (for looping sounds)
  const playPartialAudio = async (audioPath: string, volume: number) => {
    try {
      // First, get the audio file size to calculate range
      const headResponse = await fetch(audioPath, { method: "HEAD" });
      const totalSize = parseInt(
        headResponse.headers.get("content-length") || "0"
      );

      if (totalSize === 0) {
        // Fallback to full audio if we can't get size
        playFullAudio(audioPath, volume);
        return;
      }

      // Calculate bytes for first 3 seconds based on file duration
      // Assuming typical web audio bitrate of ~128kbps = 16KB/s
      // For 3 seconds: 3 * 16KB = 48KB, but we'll be more generous to account for headers/metadata
      const estimatedBytesFor3Seconds = Math.min(80000, totalSize); // ~80KB should cover 3 seconds + metadata

      // Fetch partial audio with range header
      const response = await fetch(audioPath, {
        headers: {
          Range: `bytes=0-${Math.floor(estimatedBytesFor3Seconds)}`,
        },
      });

      if (!response.ok || response.status !== 206) {
        // Server doesn't support range requests, fallback to full audio
        playFullAudio(audioPath, volume);
        return;
      }

      // Create blob URL from partial data
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const audio = new Audio(blobUrl);
      audio.volume = (volume / 100) * globalVolume;

      // Clean up blob URL when audio ends or on error
      const cleanup = () => {
        URL.revokeObjectURL(blobUrl);
      };

      audio.addEventListener("ended", cleanup);
      audio.addEventListener("error", cleanup);

      // Limit playback to 3 seconds max
      const timeoutId = setTimeout(() => {
        if (audio && !audio.paused) {
          audio.pause();
          cleanup();
        }
      }, 3000);

      audio.play().catch((error) => {
        console.error("Error playing partial audio:", error);
        cleanup();
      });

      currentAudio = audio;

      // Clear timeout if audio ends naturally before 2 seconds
      audio.addEventListener("ended", () => {
        clearTimeout(timeoutId);
      });
    } catch (error) {
      console.error("Error with partial audio playback:", error);
      // Fallback to full audio
      playFullAudio(audioPath, volume);
    }
  };

  return (
    <div
      aria-label="search sounds menu"
      className="p-4 text-gray-300 rounded-md bg-gray-950"
      style={{ background: "rgb(7, 12, 23)" }}
      // Gray 925
    >
      <div className="flex flex-col gap-3 mt-1 mb-3 align-center ">
        <button
          aria-label="category button"
          className="flex-1 py-2 pl-4 text-sm font-bold text-left text-gray-300 bg-gray-800 rounded-full hover:bg-gray-700 hover:cursor-pointer"
        >
          Category
        </button>
        <button
          aria-label="themes button"
          className="flex-1 py-2 pl-4 text-sm font-bold text-left text-gray-300 bg-gray-800 rounded-full hover:bg-gray-700 hover:cursor-pointer"
        >
          Themes
        </button>
      </div>
      <div aria-label="sound search bar" className="flex mb-3 align-center">
        <input
          type="text"
          placeholder="Search a sound"
          className="flex-1 p-1 pl-4 text-sm font-bold text-gray-300 placeholder-gray-500 transition-colors duration-200 border-2 border-r-2 border-gray-800 rounded-l-full bg-gray-950 focus:outline-none focus:border-emerald-700"
        />
        <button
          aria-label="search button"
          className="px-4 py-2 pl-3 text-sm font-bold text-gray-300 bg-gray-800 rounded-r-full hover:bg-gray-700 hover:cursor-pointer"
        >
          <Search className="w-5 h-5 transform scale-x-[-1]" />
        </button>
      </div>
      <div
        aria-label="results"
        className="border-2 border-t-0 border-gray-800 rounded-xs"
      >
        <p className="px-3 py-2 text-sm font-bold text-left text-gray-400 bg-gray-800">
          Results : {searchedSoundsBasicInformations.length} sound
          {searchedSoundsBasicInformations.length !== 1 ? "s" : ""}
        </p>

        <div className="flex flex-col gap-2 p-2">
          {searchedSoundsBasicInformations.map((sound) => (
            <article
              aria-label="sound found"
              key={sound.id}
              className="flex items-center bg-gray-800 rounded-md"
            >
              <div className="overflow-hidden w-14 h-14">
                <Image
                  src={sound.image_path}
                  alt={sound.sound_name}
                  width={100}
                  height={100}
                  className="object-cover w-full h-full rounded-l-md"
                />
              </div>
              <div className="flex flex-row justify-between flex-1 rounded-r-md h-14">
                <div
                  aria-label="sound details"
                  className="flex flex-col justify-center flex-1 gap-1 pl-2"
                >
                  <h3 className="text-xs font-bold text-gray-300">
                    {sound.sound_name}
                  </h3>
                  <p className="text-xs font-bold text-gray-500">Loop</p>
                </div>
                <div aria-label="buttons" className="flex flex-row justify-end">
                  <button
                    aria-label="save sound in favorites button"
                    className="px-2 cursor-pointer border-l-1 border-gray-950 hover:bg-gray-700"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                  <button
                    aria-label="listen the sound button"
                    onClick={() => handlePlaySound(sound.id)}
                    className="px-2 cursor-pointer border-l-1 border-gray-950 hover:bg-gray-700"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button
                    aria-label="add the sound to the current ambiance button"
                    onClick={() => handleAddSoundToAmbiance(sound.id)}
                    className="px-2 cursor-pointer border-l-1 border-gray-950 hover:bg-gray-700 rounded-r-md"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
