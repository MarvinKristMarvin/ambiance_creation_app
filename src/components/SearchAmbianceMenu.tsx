import { useGlobalStore } from "@/stores/useGlobalStore";
import { Check, ChevronDown, Star, X } from "lucide-react"; // global icons
import {
  Leaf,
  PawPrint,
  Bug,
  PersonStanding,
  Earth,
  Music,
} from "lucide-react"; // categories icons
import { Ghost, Droplet, Moon } from "lucide-react"; // themes icons
import React, { useState } from "react";
import { useEffect } from "react";
import type { Ambiance, AmbianceBasicInformations, Sound } from "@/types";
import { useShowToast } from "@/hooks/useShowToast";

// Categories and types based on db
const CATEGORIES = [
  "Elemental", // earth
  "Vegetation", // leaf
  "Animals", // paw print
  "Insects", // bug
  "Human", // person standing
  "Music", // music
] as const;

const THEMES = [
  "Spooky", // ghost
  "Aquatic", // droplet
  "Night", // moon
] as const;

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

  // Filtering states
  const [searchString, setSearchString] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<Theme[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

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
    try {
      const response = await fetch(
        `/api/get_search_menu_ambiances?${queryString}`
      );
      if (!response.ok)
        throw new Error(
          "Filtering search : Failed to fetch ambiances basic informations which serve to display ambiances in the search menu"
        );
      const data: AmbianceBasicInformations[] = await response.json();
      setSearchedAmbiancesBasicInformations(data);
    } catch (error) {
      console.error("Error fetching ambiances with filtering search:", error);
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

  // When clicking an ambiance, load the ambiance and its sounds
  const handleLoadAmbiance = async (ambianceId: number) => {
    try {
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
      ShowToast("success", "music", "Ambiance loaded");
    } catch (error) {
      console.error("Error loading ambiance or sounds :", error);
    }
  };

  return (
    <div
      aria-label="search sounds menu"
      className="text-gray-300 bg-gray-800 rounded-md "
    >
      <div className="flex flex-col gap-2 mb-2 align-center ">
        <div className="relative">
          <button
            aria-label="category button"
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowThemeDropdown(false);
            }}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-left text-gray-300 rounded-sm bg-gray-950 hover:bg-gray-900 hover:cursor-pointer"
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
                className="w-full px-3 py-1.75 text-sm font-bold text-left text-gray-300 hover:bg-gray-700 hover:cursor-pointer border-b-1 border-gray-700 flex items-center gap-2"
              >
                <X className="w-4 h-4 text-gray-400" />
                <span>All Categories</span>
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`w-full px-3 py-1.75 text-sm text-left font-bold hover:bg-gray-700 flex items-center hover:cursor-pointer border-b-1 border-gray-700 justify-between last:border-b-0 ${
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
        <div className="relative">
          <button
            aria-label="themes button"
            onClick={() => {
              setShowThemeDropdown(!showThemeDropdown);
              setShowCategoryDropdown(false);
            }}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-bold text-left text-gray-300 rounded-sm bg-gray-950 hover:bg-gray-900 hover:cursor-pointer"
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
      <div aria-label="sound search bar" className="flex mb-2 align-center">
        <div className="w-full">
          <input
            alia-label="search bar"
            type="text"
            placeholder="Search an ambiance or author"
            value={searchString}
            onChange={handleSearchChange}
            className="w-full py-1.5 px-2.5 text-sm font-bold text-gray-300 placeholder-gray-600 transition-colors duration-200 border-2 border-gray-950 rounded-sm bg-gray-950 focus:outline-none focus:border-emerald-700"
          />
        </div>
      </div>
      <div aria-label="results" className="rounded-sm bg-gray-950">
        <div className="flex flex-col gap-2 px-2 overflow-y-scroll rounded-sm border-y-8 border-gray-950 h-80">
          {searchedAmbiancesBasicInformations.map((ambiance) => (
            <article
              aria-label="ambiance found"
              key={ambiance.id}
              onClick={() => handleLoadAmbiance(ambiance.id)}
              className="flex flex-col items-center px-2 py-2 text-sm font-bold text-left text-gray-300 bg-gray-800 rounded-sm hover:bg-gray-700 hover:cursor-pointer"
            >
              <div className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-t-sm border-2 border-b-0 border-gray-900">
                <p className="text-sm text-gray-300">
                  {ambiance.ambiance_name}
                </p>
                <div className="flex items-center"></div>
              </div>
              <div className="flex items-center justify-between w-full ">
                <div className="flex items-center flex-1">
                  <div className="flex flex-1 items-center gap-1 px-2.5 py-2 bg-gray-900 rounded-bl-sm">
                    {parsePostgresEnumArray(ambiance.categories).map(
                      (category) => (
                        <React.Fragment key={category}>
                          {getCategoryIcon(category as Category)}
                        </React.Fragment>
                      )
                    )}

                    {parsePostgresEnumArray(ambiance.themes).map((theme) => (
                      <React.Fragment key={theme}>
                        {getThemeIcon(theme as Theme)}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1"></div>
                {/* <p className="text-gray-600">12 Sounds</p> */}
                <div className="flex items-center px-2.5 py-1.5 bg-gray-900 rounded-br-sm">
                  <span
                    className={`text-sm ${
                      ambiance.is_favorite
                        ? "text-yellow-200/70"
                        : "text-yellow-200/20"
                    }`}
                  >
                    27
                  </span>
                  <Star
                    className={`ml-1 w-4 h-4 ${
                      ambiance.is_favorite
                        ? "text-yellow-200/70"
                        : "text-yellow-200/20"
                    }`}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
