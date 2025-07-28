import { useGlobalStore } from "@/stores/useGlobalStore";
import {
  Check,
  Star,
  ChevronDown,
  X,
  Search,
  Plus,
  Pause,
  Play,
} from "lucide-react"; // themes icons
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useShowToast } from "@/hooks/useShowToast";
import { AmbianceSound, Sound } from "@/types";
import {
  CATEGORIES,
  THEMES,
  getCategoryIcon,
  getThemeIcon,
  type Category,
  type Theme,
} from "@/lib/iconMappings";
import { buildQueryString } from "@/lib/buildQueryString";

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
  const setGlobalVolume = useGlobalStore((state) => state.setGlobalVolume);
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

  // State to track currently playing sound
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<number | null>(
    null
  );

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
            "user",
            "Log in to save sounds in favorites",
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
    const queryString = buildQueryString(
      searchString,
      selectedCategory,
      selectedThemes
    );
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
      ShowToast("info", "addsound", "Downloading the sound...", 3000);
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
      console.log("soundsUsed:", useGlobalStore.getState().soundsUsed);
      ShowToast("success", "addsound", "Sound added to the ambiance");
    } catch (error) {
      console.error("Error adding sound to ambiance:", error);
    }
  };

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayedIndexMap: Record<number, number> = {};

  const handlePlaySound = (soundId: number) => {
    if (currentlyPlayingId === soundId && currentAudioRef.current) {
      // Stop playback
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      setGlobalVolume(globalVolume);
      setCurrentlyPlayingId(null);
      return;
    }

    const sound = searchedSoundsBasicInformations.find((s) => s.id === soundId);
    if (!sound || !sound.audio_paths || sound.audio_paths.length === 0) {
      console.error("Sound not found or no audio paths available");
      return;
    }

    // Stop currently playing audio if any
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    const lastIndex = lastPlayedIndexMap[soundId] ?? -1;
    const nextIndex = (lastIndex + 1) % sound.audio_paths.length;
    lastPlayedIndexMap[soundId] = nextIndex;

    const selectedAudioPath = sound.audio_paths[nextIndex];
    const previousGlobalVolume = globalVolume;
    setGlobalVolume(0); // Mute all others
    setCurrentlyPlayingId(soundId); // Mark as playing

    const onEnd = () => {
      setGlobalVolume(previousGlobalVolume);
      setCurrentlyPlayingId(null);
      currentAudioRef.current = null;
    };

    // Always use partial preview for all sounds
    playPartialAudio(
      selectedAudioPath,
      sound.volume,
      previousGlobalVolume,
      onEnd
    );
  };

  const playPartialAudio = async (
    audioPath: string,
    volume: number,
    originalGlobalVolume: number,
    onEnd?: () => void
  ) => {
    try {
      const headResponse = await fetch(audioPath, { method: "HEAD" });
      const totalSize = parseInt(
        headResponse.headers.get("content-length") || "0"
      );

      const estimatedBytes = Math.min(80000, totalSize);
      const response = await fetch(audioPath, {
        headers: { Range: `bytes=0-${Math.floor(estimatedBytes)}` },
      });

      if (!response.ok || response.status !== 206) {
        playPartialAudio(audioPath, volume, originalGlobalVolume, onEnd);
        return;
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const audio = new Audio(blobUrl);
      audio.volume =
        originalGlobalVolume === 0
          ? 0.5
          : (volume / 100) * originalGlobalVolume;

      const cleanup = () => {
        URL.revokeObjectURL(blobUrl);
        setGlobalVolume(originalGlobalVolume);
        onEnd?.();
      };

      const timeoutId = setTimeout(() => {
        if (!audio.paused) {
          audio.pause();
          cleanup();
        }
      }, 3000);

      audio.addEventListener("ended", () => {
        clearTimeout(timeoutId);
        cleanup();
      });

      audio.addEventListener("error", cleanup);

      audio.play().catch((error) => {
        console.error("Error playing partial audio:", error);
        cleanup();
      });

      currentAudioRef.current = audio;
    } catch (error) {
      console.error("Error with partial audio playback:", error);
      playPartialAudio(audioPath, volume, originalGlobalVolume, onEnd);
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
              aria-label="select category dropdown"
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
                  className="w-full px-2 py-1.75 text-sm font-bold text-left text-gray-300 hover:bg-gray-700 hover:cursor-pointer border-b-1 border-gray-700 flex items-center gap-2"
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
                    className={`w-full px-2 py-1.75 text-sm text-left font-bold hover:bg-gray-700 flex items-center hover:cursor-pointer border-b-1 border-gray-700 justify-between last:border-b-0 ${
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
              aria-label="select themes dropdown"
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
                  className="w-full px-2 py-1.75 text-sm font-bold text-left text-gray-300 hover:bg-gray-700 hover:cursor-pointer border-b-1 border-gray-700 flex items-center gap-2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                  <span>All Themes</span>
                </button>
                {THEMES.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => handleThemeToggle(theme)}
                    className={`w-full px-2 py-1.75 text-sm text-left font-bold hover:bg-gray-700 flex items-center hover:cursor-pointer border-b-1 border-gray-700 justify-between last:border-b-0 ${
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
      <div aria-label="search bar" className="flex mb-2 align-center">
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
            aria-label="search input"
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
        <div className="flex flex-col flex-1 gap-2  overflow-y-scroll rounded-sm border-gray-950  max-h-[calc(100dvh-14.5rem)]">
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
                className="flex items-center overflow-hidden bg-gray-800 rounded-sm min-h-13"
              >
                {/* Clickable left + center section */}
                <div
                  className="flex flex-row flex-1 cursor-pointer h-13 hover:bg-gray-700"
                  onClick={() => handlePlaySound(sound.id)}
                >
                  <div className="w-13 h-13">
                    <Image
                      src={sound.image_path}
                      alt={sound.sound_name}
                      width={100}
                      height={100}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex flex-col justify-center flex-1 gap-1 pl-2 border-l border-gray-950">
                    <h3 className="text-xs font-bold text-gray-300">
                      {sound.sound_name}
                    </h3>
                    <div className="flex items-center">
                      {currentlyPlayingId === sound.id ? (
                        <Pause
                          className="w-3.5 h-3.5 mr-1 text-gray-200 fill-gray-200"
                          strokeWidth={1}
                        />
                      ) : (
                        <Play
                          className="w-3 h-3 mr-1 text-gray-500"
                          strokeWidth={3}
                        />
                      )}
                      <p
                        className={`text-xs font-bold ${
                          currentlyPlayingId === sound.id
                            ? "text-gray-200"
                            : "text-gray-500"
                        }`}
                      >
                        {currentlyPlayingId === sound.id
                          ? "Stop sound preview"
                          : sound.looping
                          ? "Listen loop"
                          : `Listen ${sound.audio_paths.length} sound${
                              sound.audio_paths.length > 1 ? "s" : ""
                            }`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right action buttons */}
                <div
                  aria-label="buttons"
                  className="flex flex-row justify-end h-13"
                >
                  <button
                    aria-label="save sound in favorites button"
                    onClick={() => handleSaveSoundInFavorites(sound.id)}
                    className="px-4 border-l cursor-pointer border-gray-950 hover:bg-gray-700"
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
                    className="px-4 border-l cursor-pointer border-gray-950 hover:bg-gray-700 rounded-r-md"
                  >
                    <Plus className="w-5 h-5" strokeWidth={3} />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
