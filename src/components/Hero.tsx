"use client";

import { Ghost, RefreshCcw, Droplet, Moon } from "lucide-react";
import type { Ambiance, Sound } from "../types";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { useEffect, useState } from "react";
import { useShowToast } from "@/hooks/useShowToast";

const defaultAmbiance: Ambiance = {
  id: 0,
  ambiance_name: "My new ambiance",
  author_id: 0,
  ambiance_sounds: [],
};

const themes = [
  {
    name: "spooky",
    borderClass: "border-gray-400",
    textClass: "text-gray-400",
    icon: Ghost,
    vowel: false,
  },
  {
    name: "night",
    borderClass: "border-purple-400",
    textClass: "text-purple-400",
    icon: Moon,
    vowel: false,
  },
  {
    name: "aquatic",
    borderClass: "border-blue-400",
    textClass: "text-blue-400",
    icon: Droplet,
    vowel: true,
  },
];

export default function Hero() {
  const { ShowToast } = useShowToast();

  const setSearchAmbianceMenu = useGlobalStore(
    (state) => state.setSearchAmbianceMenu
  );
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );
  const setSoundsUsed = useGlobalStore((state) => state.setSoundsUsed);
  const openSearchAmbianceMenu = useGlobalStore(
    (state) => state.openSearchAmbianceMenu
  );

  const [hoverTheme, setHoverTheme] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(themes[0]);

  const handleThemeChange = () => {
    setHoverTheme(false);
    const currentIndex = themes.findIndex(
      (theme) => theme.name === currentTheme.name
    );
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  useEffect(() => {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    setCurrentTheme(randomTheme);
  }, []);

  const IconComponent = currentTheme.icon;

  const handleGetThemedAmbiance = async () => {
    try {
      const res = await fetch("/api/get_themed_ambiance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: currentTheme.name }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch themed ambiance");
      }

      const ambiance: Ambiance = await res.json();
      setCurrentAmbiance(ambiance);

      // Extract unique sound ids from the loaded ambiance
      const soundIds = [
        ...new Set(ambiance.ambiance_sounds.map((sound) => sound.sound_id)),
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
      console.error("Error fetching themed ambiance:", error);
    }
  };

  return (
    <div
      aria-label="presentation page"
      className="flex flex-col justify-center flex-1 text-center align-center"
    >
      <div className="flex flex-col items-center transform -translate-y-16">
        <h2 className="font-title text-7xl mb-8 text-emerald-300 tracking-[-9]">
          frog
        </h2>
        <p className="mb-6 text-xl font-bold text-gray-300">
          Create or listen to community made ambiances
        </p>
        <div className="relative flex items-center justify-center gap-4 w-120">
          <button
            aria-label="load ambiance button"
            className="flex-1 px-6 py-4 font-bold text-white border-2 rounded-full bg-emerald-600 hover:bg-emerald-500 hover:cursor-pointer text-md border-emerald-600 hover:border-emerald-500"
            onClick={openSearchAmbianceMenu}
          >
            Search an ambiance
          </button>
          <button
            aria-label="create ambiance button"
            onClick={() => setCurrentAmbiance(defaultAmbiance)}
            className="flex-1 px-6 py-4 font-bold text-white border-2 rounded-full hover:bg-emerald-950 border-emerald-700 hover:cursor-pointer text-md hover:border-emerald-500"
          >
            Create an ambiance
          </button>
        </div>

        <div className="relative mt-4">
          <button
            className={`absolute -top-11.5 left-1/2 -translate-x-1/2 p-3.5 border-2 rounded-full hover:bg-gray-900 hover:cursor-pointer bg-gray-950 ${
              hoverTheme ? "border-gray-200" : currentTheme.borderClass
            }`}
            onMouseEnter={() => setHoverTheme(true)}
            onMouseLeave={() => setHoverTheme(false)}
            onClick={handleThemeChange}
          >
            {hoverTheme ? (
              <RefreshCcw className="w-6 h-6 text-gray-200" />
            ) : (
              <IconComponent className={`w-6 h-6 ${currentTheme.textClass}`} />
            )}
          </button>

          <button
            aria-label="random ambiance button"
            onClick={handleGetThemedAmbiance}
            className={`px-6 py-2 font-bold text-white border-2 rounded-full text-md w-fit flex gap-1 items-center mx-auto hover:cursor-pointer hover:bg-gray-900 ${currentTheme.borderClass}`}
          >
            <span className="px-2 py-2 rounded-full">
              Or listen to a{currentTheme.vowel ? "n " : " "}
              <span className={currentTheme.textClass}>
                {currentTheme.name}
              </span>{" "}
              ambiance
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
