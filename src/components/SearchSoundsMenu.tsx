import { useGlobalStore } from "@/stores/useGlobalStore";
import { Check, Star, ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useShowToast } from "@/hooks/useShowToast";

// Categories and types based on db
const CATEGORIES = [
  "Elemental",
  "Vegetation",
  "Animals",
  "Insects",
  "Human",
  "Objects",
  "Music",
  "Machines",
] as const;

const THEMES = ["Spooky", "Aquatic", "Night"] as const;

type Category = (typeof CATEGORIES)[number];
type Theme = (typeof THEMES)[number];

export default function SearchSoundsMenu() {
  // Existing Zustand state
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

  // Toasts
  const { ShowToast } = useShowToast();

  // Filtering states
  const [searchString, setSearchString] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  // State to track optimistic updates for favorites
  const [optimisticFavorites, setOptimisticFavorites] = useState<
    Record<number, boolean>
  >({});

  // Function to build query string
  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (searchString.trim()) {
      params.append("search", searchString.trim());
    }

    if (selectedCategory) {
      params.append("category", selectedCategory);
    }

    if (selectedThemes.length > 0) {
      selectedThemes.forEach((theme) => {
        params.append("theme", theme);
      });
    }

    return params.toString();
  };

  // Function to handle adding/removing sound from favorites
  const handleSaveSoundInFavorites = async (soundId: number) => {
    // Get current favorite status (either from optimistic state or original data)
    const currentFavoriteStatus =
      optimisticFavorites[soundId] !== undefined
        ? optimisticFavorites[soundId]
        : searchedSoundsBasicInformations.find((sound) => sound.id === soundId)
            ?.is_favorite || false;

    // Immediately update UI for better UX (optimistic update)
    const newFavoriteStatus = !currentFavoriteStatus;
    setOptimisticFavorites((prev) => ({
      ...prev,
      [soundId]: newFavoriteStatus,
    }));

    try {
      const response = await fetch(`/api/toggle_favorite_sound`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ soundId }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle favorite sound");
      }

      const result = await response.json();

      // Update the optimistic state with the actual result from the server
      setOptimisticFavorites((prev) => ({
        ...prev,
        [soundId]: result.is_favorite,
      }));

      // Success toast
      ShowToast(
        `${result.is_favorite ? "success" : "warning"}`,
        "star",
        `Sound ${result.is_favorite ? "added to" : "removed from"} favorites`,
        3000
      );
      console.log(
        `Sound ${result.is_favorite ? "added to" : "removed from"} favorites`
      );
    } catch (error) {
      ShowToast("error", "error", "Failed to update favorites");
      console.error("Error toggling favorite sound:", error);

      // Revert the optimistic update on error
      setOptimisticFavorites((prev) => ({
        ...prev,
        [soundId]: currentFavoriteStatus,
      }));
    }
  };

  // Function to perform search
  const performSearch = async () => {
    const queryString = buildQueryString();
    try {
      const response = await fetch(
        `/api/get_search_menu_sounds?${queryString}`
      );
      if (!response.ok)
        throw new Error(
          "Filtering search : Failed to fetch sounds basic informations which serve to display sounds in the search menu"
        );
      const data = await response.json();
      setSearchedSoundsBasicInformations(data);
    } catch (error) {
      console.error("Error fetching sounds with filtering search:", error);
    }
  };

  // Handle theme selection (multiple selection)
  const handleThemeToggle = (theme: Theme) => {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchString(e.target.value);
  };

  // Debounced search effect - triggers search 500ms after filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchString, selectedCategory, selectedThemes]);

  // Initial fetch on component mount
  useEffect(() => {
    performSearch();
  }, []);

  const handleAddSoundToAmbiance = async (soundId: number) => {
    try {
      console.log("Adding sound to ambiance:", soundId);
      const res = await fetch(`/api/sound/${soundId}`);
      if (!res.ok) throw new Error("Failed to fetch full sound data");
      const loadedSound = await res.json();
      console.log("Loaded sound:", loadedSound[0]);
      if (!currentAmbiance) return;

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

  let currentAudio: HTMLAudioElement | null = null;

  const handlePlaySound = (soundId: number) => {
    const sound = searchedSoundsBasicInformations.find((s) => s.id === soundId);

    if (!sound || !sound.audio_paths || sound.audio_paths.length === 0) {
      console.error("Sound not found or no audio paths available");
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const randomIndex = Math.floor(Math.random() * sound.audio_paths.length);
    const selectedAudioPath = sound.audio_paths[randomIndex];

    if (sound.looping) {
      playPartialAudio(selectedAudioPath, sound.volume);
    } else {
      playFullAudio(selectedAudioPath, sound.volume);
    }

    console.log(
      `Playing ${sound.sound_name}: ${selectedAudioPath} at volume ${sound.volume}%`
    );
  };

  const playFullAudio = (audioPath: string, volume: number) => {
    const audio = new Audio(audioPath);
    audio.volume = (volume / 100) * globalVolume;

    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });

    currentAudio = audio;
  };

  const playPartialAudio = async (audioPath: string, volume: number) => {
    try {
      const headResponse = await fetch(audioPath, { method: "HEAD" });
      const totalSize = parseInt(
        headResponse.headers.get("content-length") || "0"
      );

      if (totalSize === 0) {
        playFullAudio(audioPath, volume);
        return;
      }

      const estimatedBytesFor3Seconds = Math.min(80000, totalSize);

      const response = await fetch(audioPath, {
        headers: {
          Range: `bytes=0-${Math.floor(estimatedBytesFor3Seconds)}`,
        },
      });

      if (!response.ok || response.status !== 206) {
        playFullAudio(audioPath, volume);
        return;
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const audio = new Audio(blobUrl);
      audio.volume = (volume / 100) * globalVolume;

      const cleanup = () => {
        URL.revokeObjectURL(blobUrl);
      };

      audio.addEventListener("ended", cleanup);
      audio.addEventListener("error", cleanup);

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

      audio.addEventListener("ended", () => {
        clearTimeout(timeoutId);
      });
    } catch (error) {
      console.error("Error with partial audio playback:", error);
      playFullAudio(audioPath, volume);
    }
  };

  return (
    <div
      aria-label="search sounds menu"
      className="p-0 pt-0 text-gray-300 bg-gray-800 rounded-md"
    >
      <div className="flex flex-col gap-2 mt-1 mb-2">
        {/* Category Filter */}
        <div className="relative">
          <button
            aria-label="category button"
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowThemeDropdown(false);
            }}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-left text-gray-300 bg-gray-700 rounded-sm hover:bg-gray-600 hover:cursor-pointer"
          >
            <span>
              {selectedCategory ? `Category: ${selectedCategory}` : "Category"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showCategoryDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showCategoryDropdown && (
            <div className="absolute z-10 w-full mt-1 overflow-y-scroll bg-gray-800 border-gray-700 rounded-sm shadow-lg border-3 max-h-65.5">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setShowCategoryDropdown(false);
                }}
                className="w-full px-3 py-1.75 text-sm font-bold text-left text-gray-300 hover:bg-gray-700 hover:cursor-pointer border-b-1 border-gray-700"
              >
                All Categories
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full px-3 py-1.75 text-sm text-left font-bold hover:bg-gray-700 hover:cursor-pointer border-b-1 border-gray-700 last:border-b-0 ${
                    selectedCategory === category
                      ? "text-emerald-400 bg-gray-700"
                      : "text-gray-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Filter */}
        <div className="relative">
          <button
            aria-label="themes button"
            onClick={() => {
              setShowThemeDropdown(!showThemeDropdown);
              setShowCategoryDropdown(false);
            }}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-left text-gray-300 bg-gray-700 rounded-sm hover:bg-gray-600 hover:cursor-pointer"
          >
            <span>
              {selectedThemes.length > 0
                ? `Themes: ${selectedThemes.join(", ")}`
                : "Themes"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showThemeDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showThemeDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border-3 border-gray-700 rounded-sm shadow-lg max-h-65.5 overflow-y-scroll">
              <button
                onClick={() => {
                  setSelectedThemes([]);
                  setShowThemeDropdown(false);
                }}
                className="w-full px-3 py-1.75 text-sm font-bold text-left text-gray-300 hover:bg-gray-700 hover:cursor-pointer border-b-1 border-gray-700"
              >
                All Themes
              </button>
              {THEMES.map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeToggle(theme)}
                  className={`w-full px-3 py-1.75 text-sm text-left font-bold hover:bg-gray-700 flex items-center hover:cursor-pointer border-b-1 border-gray-700 justify-between last:border-b-0 ${
                    selectedThemes.includes(theme)
                      ? "text-emerald-400 bg-gray-700"
                      : "text-gray-300"
                  }`}
                >
                  <span>{theme}</span>
                  {selectedThemes.includes(theme) && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search a sound by name"
          value={searchString}
          onChange={handleSearchChange}
          className="w-full py-1.5 px-2.5 text-sm font-bold text-gray-300 placeholder-gray-500 transition-colors duration-200 border-2 border-gray-950 rounded-sm bg-gray-950 focus:outline-none focus:border-emerald-700"
        />
      </div>

      <div aria-label="results" className="rounded-sm bg-gray-950">
        {/* <p className="px-3 py-2 text-sm font-bold text-left text-gray-400 border-gray-900 bg-gray-950 border-b-1">
          Results : {searchedSoundsBasicInformations.length} sound
          {searchedSoundsBasicInformations.length !== 1 ? "s" : ""}
        </p> */}

        <div className="flex flex-col gap-2 p-2 overflow-y-scroll h-80">
          {searchedSoundsBasicInformations.map((sound) => (
            <article
              aria-label="sound found"
              key={sound.id}
              className="flex items-center bg-gray-800 rounded-sm"
            >
              <div className="overflow-hidden w-13 h-13">
                <Image
                  src={sound.image_path}
                  alt={sound.sound_name}
                  width={100}
                  height={100}
                  className="object-cover w-full h-full rounded-l-sm"
                />
              </div>
              <div className="flex flex-row justify-between flex-1 rounded-r-md h-13">
                <div
                  aria-label="sound details"
                  onClick={() => handlePlaySound(sound.id)}
                  className="flex flex-col justify-center flex-1 gap-1 pl-2 hover:bg-gray-700 hover:cursor-pointer"
                >
                  <h3 className="text-xs font-bold text-gray-300">
                    {sound.sound_name}
                  </h3>
                  <p className="text-xs font-bold text-gray-500">Listen</p>
                </div>
                <div aria-label="buttons" className="flex flex-row justify-end">
                  <button
                    aria-label="save sound in favorites button"
                    onClick={() => handleSaveSoundInFavorites(sound.id)}
                    className="px-4 cursor-pointer border-l-1 border-gray-950 hover:bg-gray-700"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        // Use optimistic state if available, otherwise use original data
                        (
                          optimisticFavorites[sound.id] !== undefined
                            ? optimisticFavorites[sound.id]
                            : sound.is_favorite
                        )
                          ? "text-yellow-200/80 fill-yellow-200/80"
                          : "text-yellow-200/70"
                      }`}
                    />
                  </button>

                  <button
                    aria-label="add the sound to the current ambiance button"
                    onClick={() => handleAddSoundToAmbiance(sound.id)}
                    className="px-4 cursor-pointer border-l-1 border-gray-950 hover:bg-gray-700 rounded-r-md"
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
