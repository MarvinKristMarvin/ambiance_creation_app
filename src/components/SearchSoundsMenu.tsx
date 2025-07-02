import { useGlobalStore } from "@/stores/useGlobalStore";
import { Check, Star, ChevronDown, X, Search } from "lucide-react";
import {
  Leaf,
  PawPrint,
  Bug,
  PersonStanding,
  Earth,
  Music,
} from "lucide-react"; // categories icons
import { Ghost, Droplet, Moon } from "lucide-react"; // themes icons
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useShowToast } from "@/hooks/useShowToast";
import { AmbianceSound, Sound } from "@/types";

// Categories and types based on db
const CATEGORIES = [
  "Elemental",
  "Vegetation",
  "Animals",
  "Insects",
  "Human",
  "Music",
] as const;

const THEMES = ["Spooky", "Aquatic", "Night"] as const;

type Category = (typeof CATEGORIES)[number];
type Theme = (typeof THEMES)[number];

// Category icon mapping with colors
const getCategoryIcon = (category: Category) => {
  const iconProps = { className: "w-4 h-4" };

  switch (category) {
    case "Elemental":
      return <Earth {...iconProps} className="w-4 h-4 text-red-300" />;
    case "Vegetation":
      return <Leaf {...iconProps} className="w-4 h-4 text-green-400" />;
    case "Animals":
      return <PawPrint {...iconProps} className="w-4 h-4 text-amber-400" />;
    case "Insects":
      return <Bug {...iconProps} className="w-4 h-4 text-lime-400" />;
    case "Human":
      return (
        <PersonStanding {...iconProps} className="w-4 h-4 text-orange-400" />
      );
    case "Music":
      return <Music {...iconProps} className="w-4 h-4 text-purple-400" />;
    default:
      return null;
  }
};

// Theme icon mapping with colors
const getThemeIcon = (theme: Theme) => {
  const iconProps = { className: "w-4 h-4" };

  switch (theme) {
    case "Spooky":
      return <Ghost {...iconProps} className="w-4 h-4 text-gray-400" />;
    case "Aquatic":
      return <Droplet {...iconProps} className="w-4 h-4 text-blue-400" />;
    case "Night":
      return <Moon {...iconProps} className="w-4 h-4 text-indigo-400" />;
    default:
      return null;
  }
};

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
  const setSoundsUsed = useGlobalStore((state) => state.setSoundsUsed);

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
  const [loading, setLoading] = useState(false);

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
        const errorData = await response.json();

        // Handle authentication error specifically
        if (response.status === 401) {
          ShowToast(
            "error",
            "error",
            "Please log in to save sounds in favorites",
            5000
          );
          // Revert the optimistic update
          setOptimisticFavorites((prev) => ({
            ...prev,
            [soundId]: currentFavoriteStatus,
          }));
          return;
        }

        throw new Error(errorData.error || "Failed to toggle favorite sound");
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
      ShowToast("error", "error", "Failed to update favorites", 3000);
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
    setLoading(true); // start loading

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
    } finally {
      setLoading(false); // stop loading
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

  // Handle outside click when any dropdown is open
  const categoryRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
      if (
        themeRef.current &&
        !themeRef.current.contains(event.target as Node)
      ) {
        setShowThemeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddSoundToAmbiance = async (soundId: number) => {
    try {
      console.log("Adding sound to ambiance:", soundId);
      const res = await fetch(`/api/sound/${soundId}`);
      if (!res.ok) throw new Error("Failed to fetch full sound data");
      const loadedSound: AmbianceSound[] = await res.json();
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
        reverb_duration: loadedSound[0].reverb_duration,
        speed: loadedSound[0].speed,
        direction: loadedSound[0].direction,
        repeat_delay: loadedSound[0].repeat_delay,
        low: 0,
        mid: 0,
        high: 0,
        low_cut: 20,
        high_cut: 20000,
      };

      setCurrentAmbiance({
        ...currentAmbiance,
        ambiance_sounds: [...currentAmbiance.ambiance_sounds, newAmbianceSound],
      });

      // Fetch sound default data
      const soundDefaultInfos = await fetch("/api/get_used_sounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ soundIds: [soundId] }),
      });

      if (!soundDefaultInfos.ok) throw new Error("Failed to load sound data");
      const soundsData: Sound[] = await soundDefaultInfos.json();

      // Merge new sound into soundsUsed without replacing the full list
      const existingSounds = useGlobalStore.getState().soundsUsed;
      const newSound = soundsData[0];

      const alreadyExists = existingSounds.some((s) => s.id === newSound.id);
      if (!alreadyExists) {
        setSoundsUsed([...existingSounds, newSound]);
        console.log("Sound added to soundsUsed:", newSound);
      } else {
        console.log("Sound already exists in soundsUsed");
      }

      ShowToast("success", "addsound", "Sound added to the ambiance");
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
      className="flex flex-col h-full max-h-screen text-gray-300 rounded-md"
    >
      <div className="flex flex-col gap-2 mb-2 align-center">
        {/* Category Filter */}
        <div className="relative" ref={categoryRef}>
          <div className="relative">
            <button
              aria-label="category button"
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowThemeDropdown(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-left text-gray-300 bg-gray-900 rounded-sm hover:bg-gray-700 hover:cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {selectedCategory ? (
                  <>
                    <span>Category:</span>
                    {getCategoryIcon(selectedCategory)}
                  </>
                ) : (
                  "Category"
                )}
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
                  className="w-full px-3 py-1.75 text-sm font-bold text-left text-gray-300 hover:bg-gray-700 hover:cursor-pointer border-b-1 border-gray-700 flex items-center gap-2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                  <span>All Categories</span>
                </button>
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full px-3 py-1.75 text-sm text-left font-bold hover:bg-gray-700 flex items-center hover:cursor-pointer border-b-1 border-gray-700 justify-between last:border-b-0 ${
                      selectedCategory === category
                        ? "text-emerald-400 bg-gray-700"
                        : "text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      <span>{category}</span>
                    </div>
                    {selectedCategory === category && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Theme Filter */}
        <div className="relative" ref={themeRef}>
          <div className="relative">
            <button
              aria-label="themes button"
              onClick={() => {
                setShowThemeDropdown(!showThemeDropdown);
                setShowCategoryDropdown(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-left text-gray-300 bg-gray-900 rounded-sm hover:bg-gray-700 hover:cursor-pointer"
            >
              <span className="flex items-center gap-2">
                {selectedThemes.length > 0 ? (
                  <>
                    <span>Themes:</span>
                    <div className="flex items-center gap-1">
                      {selectedThemes.map((theme) => (
                        <React.Fragment key={theme}>
                          {getThemeIcon(theme)}
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                ) : (
                  "Themes"
                )}
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
                  className="w-full px-3 py-1.75 text-sm font-bold text-left text-gray-300 hover:bg-gray-700 hover:cursor-pointer border-b-1 border-gray-700 flex items-center gap-2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                  <span>All Themes</span>
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
                    <div className="flex items-center gap-2">
                      {getThemeIcon(theme)}
                      <span>{theme}</span>
                    </div>
                    {selectedThemes.includes(theme) && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div aria-label="sound search bar" className="flex mb-2 align-center">
        <div className="relative w-full">
          {/* Right icon */}
          <div className="absolute inset-y-0 right-0 flex items-center">
            {searchString.length === 0 ? (
              <Search className="w-4 h-4 mr-3 text-gray-500 scale-x-[-1]" />
            ) : (
              <button
                aria-label="clear search input"
                onClick={() =>
                  handleSearchChange({
                    target: { value: "" },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                className="p-3 text-gray-500 hover:text-gray-300 focus:outline-none hover:cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* Input */}
          <input
            aria-label="search bar"
            type="text"
            placeholder="Search a sound by name"
            value={searchString}
            onChange={handleSearchChange}
            className="w-full py-1.5 px-2.5 text-sm font-bold text-gray-300 placeholder-gray-600 transition-colors duration-200 border-2 border-gray-900 rounded-sm bg-gray-950 focus:outline-none focus:border-emerald-700"
          />
        </div>
      </div>

      <div
        aria-label="results"
        className="relative flex flex-col flex-1 rounded-sm bg-gray-950"
      >
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 border-4 rounded-full border-t-transparent border-emerald-400 animate-spin"></div>
          </div>
        )}
        <div className="flex flex-col flex-1 gap-2  overflow-y-scroll rounded-sm border-gray-950  max-h-[calc(100vh-11.5rem)]">
          {searchedSoundsBasicInformations.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-sm font-bold text-gray-500">
              {searchString.trim() ||
              selectedCategory ||
              selectedThemes.length > 0 ? (
                <p>No sounds found with those filters</p>
              ) : (
                <p>Search sounds by using filters</p>
              )}
            </div>
          ) : (
            searchedSoundsBasicInformations.map((sound) => (
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
                    <p className="text-xs font-bold text-gray-500">
                      Listen {sound.looping ? "loop" : ""}
                    </p>
                  </div>
                  <div
                    aria-label="buttons"
                    className="flex flex-row justify-end"
                  >
                    <button
                      aria-label="save sound in favorites button"
                      onClick={() => handleSaveSoundInFavorites(sound.id)}
                      className="px-4 cursor-pointer border-l-1 border-gray-950 hover:bg-gray-700"
                    >
                      <Star
                        className={`w-5 h-5 ${
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
