"use client";

import {
  Ghost,
  RefreshCcw,
  Droplet,
  House,
  BookOpen,
  Bird,
  Sparkles,
  CloudDrizzle,
} from "lucide-react";
import type { Ambiance, Sound } from "../types";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { useEffect, useState } from "react";
import { useShowToast } from "@/hooks/useShowToast";
import Image from "next/image";

const defaultAmbiance: Ambiance = {
  id: 0,
  ambiance_name: "My ambiance name",
  author_id: "",
  ambiance_sounds: [],
};

const themes = [
  {
    name: "mysterious",
    borderClass: "border-black",
    textClass: "text-black",
    icon: Ghost,
    vowel: false,
  },
  {
    name: "fantasy",
    borderClass: "border-violet-400",
    textClass: "text-violet-400",
    icon: BookOpen,
    vowel: false,
  },
  {
    name: "aquatic",
    borderClass: "border-blue-400",
    textClass: "text-blue-400",
    icon: Droplet,
    vowel: true,
  },
  {
    name: "house",
    borderClass: "border-orange-200",
    textClass: "text-orange-200",
    icon: House,
    vowel: false,
  },
  {
    name: "bird",
    borderClass: "border-sky-400",
    textClass: "text-sky-400",
    icon: Bird,
    vowel: false,
  },
  {
    name: "ethereal",
    borderClass: "border-pink-400",
    textClass: "text-pink-400",
    icon: Sparkles,
    vowel: false,
  },
  {
    name: "elemental",
    borderClass: "border-sky-400",
    textClass: "text-sky-400",
    icon: CloudDrizzle,
    vowel: false,
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
      aria-label="main page"
      className="relative flex flex-col justify-center flex-1 overflow-hidden text-center align-center"
    >
      {/* Background image */}
      <Image
        src="/photos/herobg.webp" // replace with your image path in public/
        alt="Background"
        fill
        className="z-0 object-cover"
        priority
        quality={100}
      />
      <div className="flex flex-col items-center transform -translate-y-4">
        <h2
          aria-label="title"
          className="font-title font-bold text-6xl mb-1 text-white tracking-[8] translate-x-1.5"
        >
          FOG
        </h2>
        {/* <p className="text-lg font-bold uppercase text-gray-50">
          Listen &middot; Modify &middot; Create
        </p> */}
        <p
          aria-label="subtitle"
          className="mb-6 text-lg font-bold uppercase text-white/60"
        >
          Audio ambiances
        </p>
        {/* <Image
          className="mb-5 rounded-xl"
          src="/photos/heropresentation.jpg"
          alt="Presentation"
          width={800}
          height={200}
          quality={100}
        ></Image> */}
        <div className="relative flex flex-col items-center justify-center gap-4 sm:flex-row sm:w-120">
          <button
            aria-label="search ambiance button"
            className="flex-1 px-3.5 py-4 font-bold w-[calc(100vw-2rem)] max-w-90 text-white border-2 rounded-full bg-black/50 hover:bg-black/70 hover:cursor-pointer text-md border-gray-50 hover:border-gray-50"
            onClick={openSearchAmbianceMenu}
          >
            Search an ambiance
          </button>
          <button
            aria-label="create ambiance button"
            onClick={() => setCurrentAmbiance(defaultAmbiance)}
            className="flex-1  px-3.5 py-4 font-bold w-[calc(100vw-2rem)] max-w-90 text-white border-2 rounded-full bg-black/50 hover:bg-black/70 hover:cursor-pointer text-md border-gray-50 hover:border-gray-50"
          >
            Create an ambiance
          </button>
        </div>

        <div className="mt-4">
          <button
            aria-label="open a random themed ambiance button"
            onClick={handleGetThemedAmbiance}
            className={`bg-black/60 px-3.5 w-[calc(100vw-2rem)] max-w-90 text-center py-2 font-bold text-white border-2 rounded-full text-md flex gap-1 items-center justify-center mx-auto hover:cursor-pointer hover:bg-black/80 ${currentTheme.borderClass}`}
          >
            <span className="px-2 py-2 rounded-full">
              Or listen to a{currentTheme.vowel ? "n " : " "}
              <span className={currentTheme.textClass}>
                {currentTheme.name}
              </span>{" "}
              ambiance
            </span>
          </button>
          <button
            className={`p-3.5 mt-4 border-2 rounded-full  hover:cursor-pointer bg-black/60 hover:bg-black/80 ${
              hoverTheme ? "border-gray-50" : currentTheme.borderClass
            }`}
            onMouseEnter={() => setHoverTheme(true)}
            onMouseLeave={() => setHoverTheme(false)}
            onClick={handleThemeChange}
            aria-label="change ambiance theme button"
          >
            {hoverTheme ? (
              <RefreshCcw className="w-6 h-6 text-gray-50" />
            ) : (
              <IconComponent className={`w-6 h-6 ${currentTheme.textClass}`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
