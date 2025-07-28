import { useGlobalStore } from "@/stores/useGlobalStore";
import { Check, ChevronDown, Star, X, Search } from "lucide-react";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import type { Ambiance, AmbianceBasicInformations, Sound } from "@/types";
import { useShowToast } from "@/hooks/useShowToast";
import {
  CATEGORIES,
  THEMES,
  getCategoryIcon,
  getThemeIcon,
  type Category,
  type Theme,
} from "@/lib/iconMappings";

// Utility function to parse Postgres ENUM array like categories or themes to be able to map on them
function parsePostgresEnumArray(str: string | string[]): string[] {
  if (Array.isArray(str)) return str; // already a JS array
  if (!str || typeof str !== "string") return [];

  return str
    .replace(/^{|}$/g, "") // remove curly braces
    .split(",")
    .map((s) => s.trim().replace(/^"(.*)"$/, "$1")); // remove quotes
}

export default function SearchAmbianceMenu() {
  const { ShowToast } = useShowToast();

  // Zustand
  const setSearchedAmbiancesBasicInformations = useGlobalStore(
    (state) => state.setSearchedAmbiancesBasicInformations
  );
  const searchedAmbiancesBasicInformations = useGlobalStore(
    (state) => state.searchedAmbiancesBasicInformations
  );
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );
  const setSoundsUsed = useGlobalStore((state) => state.setSoundsUsed);
  const setSearchAmbianceMenu = useGlobalStore(
    (state) => state.setSearchAmbianceMenu
  );
  const refreshSearchAmbianceMenu = useGlobalStore(
    (state) => state.refreshSearchAmbianceMenu
  );
  const setRefreshSearchAmbianceMenu = useGlobalStore(
    (state) => state.setRefreshSearchAmbianceMenu
  );

  // Filtering states
  const [searchString, setSearchString] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async (
    ambianceId: number,
    currentFavorite: boolean
  ) => {
    // Optimistic update
    const updatedAmbiances = searchedAmbiancesBasicInformations.map((amb) =>
      amb.id === ambianceId ? { ...amb, is_favorite: !currentFavorite } : amb
    );
    setSearchedAmbiancesBasicInformations(updatedAmbiances);

    try {
      const response = await fetch("/api/toggle_favorite_ambiance", {
        method: "POST",
        body: JSON.stringify({ ambianceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle authentication error specifically
        if (response.status === 401) {
          ShowToast(
            "error",
            "user",
            "Log in to save an ambiance in favorites",
            5000
          );
          // Revert update
          const revertedAmbiances = searchedAmbiancesBasicInformations.map(
            (amb) =>
              amb.id === ambianceId
                ? { ...amb, is_favorite: currentFavorite }
                : amb
          );
          setSearchedAmbiancesBasicInformations(revertedAmbiances);
          return;
        }

        throw new Error(errorData.error || "Failed to toggle favorite sound");
      }

      ShowToast(
        currentFavorite ? "warning" : "success",
        "star",
        currentFavorite
          ? "Ambiance removed from favorites"
          : "Ambiance saved to favorites"
      );
    } catch {
      // Revert update
      const revertedAmbiances = searchedAmbiancesBasicInformations.map((amb) =>
        amb.id === ambianceId ? { ...amb, is_favorite: currentFavorite } : amb
      );
      setSearchedAmbiancesBasicInformations(revertedAmbiances);

      ShowToast("error", "star", "Failed to update favorites");
    }
  };

  // Function to build query string
  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (searchString.trim()) {
      params.append("search", searchString.trim());
    }

    if (selectedCategories.length > 0) {
      selectedCategories.forEach((category) => {
        params.append("category", category);
      });
    }

    if (selectedThemes.length > 0) {
      selectedThemes.forEach((theme) => {
        params.append("theme", theme);
      });
    }

    return params.toString();
  };

  // Function to perform search
  const performSearch = async () => {
    const queryString = buildQueryString();
    setLoading(true); // start loading

    try {
      const response = await fetch(
        `/api/get_search_menu_ambiances?${queryString}`
      );
      if (!response.ok) throw new Error("Failed to fetch ambiances");

      const data: AmbianceBasicInformations[] = await response.json();
      setSearchedAmbiancesBasicInformations(data);
    } catch (error) {
      console.error("Error fetching ambiances:", error);
    } finally {
      setLoading(false); // stop loading
    }
  };

  // Handle category selection (multiple selection)
  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
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
  }, [searchString, selectedCategories, selectedThemes]);

  // Initial fetch on component mount
  useEffect(() => {
    performSearch();
  }, []);

  // Reset filters and search string when refreshSearchAmbianceMenu is triggered to show favorites
  useEffect(() => {
    if (refreshSearchAmbianceMenu) {
      // Reset filters and search string
      setSearchString("");
      setSelectedCategories([]);
      setSelectedThemes([]);

      // Reset the Zustand flag
      setRefreshSearchAmbianceMenu(false);

      // Trigger a new search with cleared filters
      performSearch();
    }
  }, [refreshSearchAmbianceMenu]);

  // When clicking an ambiance, load the ambiance and its sounds
  const handleLoadAmbiance = async (ambianceId: number) => {
    try {
      ShowToast("info", "ambiance", "Downloading the ambiance...");
      const loadedAmbiance = await fetch(`/api/ambiances/${ambianceId}`);
      // If the response is not ok, throw an error (stops execution and go to catch)
      if (!loadedAmbiance.ok) throw new Error("Failed to load ambiance");
      // Data retrieved must be of type Ambiance
      const data: Ambiance = await loadedAmbiance.json();
      setCurrentAmbiance(data);
      console.log("Ambiance loaded : ", data);

      // Extract unique sound ids from the loaded ambiance
      const soundIds = [
        ...new Set(data.ambiance_sounds.map((sound) => sound.sound_id)),
      ];

      // Fetch sounds default data by their ids
      const response = await fetch("/api/get_used_sounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ soundIds }),
      });

      // Put the sounds data in the zustand array soundsUsed
      if (!response.ok) throw new Error("Failed to load sounds");
      const soundsData: Sound[] = await response.json();
      setSoundsUsed(soundsData);
      console.log("Sounds used : ", soundsData);
      setSearchAmbianceMenu(false);
      ShowToast("success", "ambiance", "Ambiance loaded");
    } catch (error) {
      console.error("Error loading ambiance or sounds :", error);
    }
  };

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

  return (
    <div
      aria-label="search ambiances menu"
      className="flex flex-col h-full max-h-screen text-gray-300 rounded-md"
    >
      <div className="flex flex-col gap-2 mb-2 align-center ">
        <div className="relative" ref={categoryRef}>
          <button
            aria-label="select categories dropdown"
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowThemeDropdown(false);
            }}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-left text-gray-300 bg-gray-900 rounded-sm hover:bg-gray-700 hover:cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {selectedCategories.length > 0 ? (
                <>
                  <span>Categories:</span>
                  <div className="flex items-center gap-1">
                    {selectedCategories.map((category) => (
                      <React.Fragment key={category}>
                        {getCategoryIcon(category)}
                      </React.Fragment>
                    ))}
                  </div>
                </>
              ) : (
                "Categories"
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
                  setSelectedCategories([]);
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
                  onClick={() => handleCategoryToggle(category)}
                  className={`w-full px-2 py-1.75 text-sm text-left font-bold hover:bg-gray-700 flex items-center hover:cursor-pointer border-b-1 border-gray-700 justify-between last:border-b-0 ${
                    selectedCategories.includes(category)
                      ? "text-emerald-400 bg-gray-700"
                      : "text-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </div>
                  {selectedCategories.includes(category) && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative" ref={themeRef}>
          <button
            aria-label="select themes button"
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
      <div aria-label="search bar" className="flex mb-2 align-center">
        <div className="relative w-full">
          {/* Left icon */}
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
                } // Temporary fix
                className="p-3 text-gray-500 hover:text-gray-300 focus:outline-none hover:cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* Input with extra left padding to avoid overlapping icon */}
          <input
            aria-label="search input"
            type="text"
            placeholder="Search an ambiance by name"
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
        <div className="flex flex-col flex-1 gap-2 overflow-y-scroll rounded-sm border-gray-950 border-y-2 max-h-[calc(100dvh-14.5rem)]">
          {searchedAmbiancesBasicInformations.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-sm font-bold text-gray-500">
              {searchString.trim() ||
              selectedCategories.length > 0 ||
              selectedThemes.length > 0 ? (
                <p>No ambiance found with those filters</p>
              ) : (
                <p>Search ambiance by using filters</p>
              )}
            </div>
          ) : (
            searchedAmbiancesBasicInformations.map((ambiance) => (
              <article
                aria-label="ambiance found"
                key={ambiance.id}
                onClick={() => handleLoadAmbiance(ambiance.id)}
                className="flex flex-col items-center px-0.5 py-0.5 text-sm font-bold text-left text-gray-300 bg-gray-700 rounded-sm group hover:bg-gray-400 hover:cursor-pointer"
              >
                <div className="flex items-center justify-between w-full px-2.5 py-1.5 pb-0 rounded-t-sm border-0 border-b-0 bg-gray-900 border-gray-700 group-hover:bg-gray-800 group-hover:border-gray-800">
                  <p className="text-sm text-gray-300 group-hover:text-gray-200 break-words [&>*]:break-all">
                    {ambiance.ambiance_name.split(" ").map((word, index) => (
                      <span key={index}>
                        {word}
                        {word.length <= 25 && " "}
                      </span>
                    ))}
                  </p>
                  <div className="flex items-center"></div>
                </div>
                <div className="flex items-center justify-between w-full bg-gray-900 rounded-b-sm group-hover:bg-gray-800">
                  <div className="flex items-center flex-1 ">
                    <div className="flex flex-1 items-center gap-1 px-2.5 py-2 pt-1.5 bg-gray-900 rounded-bl-sm group-hover:bg-gray-800">
                      {/* If more icons than 9, show +X */}
                      {(() => {
                        const categories = parsePostgresEnumArray(
                          ambiance.categories
                        );
                        const themes = parsePostgresEnumArray(ambiance.themes);

                        const allIcons = [
                          ...categories.map((c) => ({
                            key: `category-${c}`,
                            icon: getCategoryIcon(c as Category),
                          })),
                          ...themes.map((t) => ({
                            key: `theme-${t}`,
                            icon: getThemeIcon(t as Theme),
                          })),
                        ];

                        const maxIconsToShow = 9;
                        const shownIcons = allIcons.slice(0, maxIconsToShow);
                        const hiddenCount = allIcons.length - shownIcons.length;

                        return (
                          <>
                            {shownIcons.map(({ key, icon }) => (
                              <React.Fragment key={key}>{icon}</React.Fragment>
                            ))}
                            {hiddenCount > 0 && (
                              <span className="-ml-0.25 translate-y-0.25 text-xs text-gray-500">
                                +{hiddenCount}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1"></div>
                  <button
                    aria-label="save ambiance to favorite button"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent loading the ambiance
                      toggleFavorite(ambiance.id, ambiance.is_favorite);
                    }}
                    className="flex justify-end px-1.25 mr-1 items-center  py-0.75 mb-0.5 bg-gray-900  group-hover:bg-gray-800 hover:bg-yellow-200/20 rounded-sm hover:cursor-pointer"
                  >
                    <span
                      className={`text-sm ${
                        ambiance.is_favorite
                          ? "text-yellow-200/70"
                          : "text-yellow-200/50"
                      }`}
                    >
                      {ambiance.number_of_favorites}
                    </span>
                    <Star
                      className={`ml-1 w-4 h-4 transition ${
                        ambiance.is_favorite
                          ? "text-yellow-200/70 fill-yellow-200/80"
                          : "text-yellow-200/50"
                      }`}
                    />
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
