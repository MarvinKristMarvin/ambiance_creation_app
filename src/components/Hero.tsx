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
// themes icons
import { Headphones, Plus, Search } from "lucide-react";
import type { Ambiance, Sound } from "../types";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { useEffect, useState } from "react";
import { useShowToast } from "@/hooks/useShowToast";
import Image from "next/image";
import * as Sentry from "@sentry/nextjs";

const defaultAmbiance: Ambiance = {
  id: 0,
  ambiance_name: "My ambiance name",
  author_id: "",
  ambiance_sounds: [],
};

const themes = [
  {
    name: "mysterious",
    borderClass: "border-fuchsia-600",
    textClass: "text-fuchsia-600",
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
    vowel: true,
  },
  {
    name: "elemental",
    borderClass: "border-sky-400",
    textClass: "text-sky-400",
    icon: CloudDrizzle,
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
  //const [hoverTheme, setHoverTheme] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(themes[0]);
  const [storedAmbiance, setStoredAmbiance] = useState(null);
  const [loadingThemedAmbiance, setLoadingThemedAmbiance] = useState(false);

  useEffect(() => {
    console.log("Trying to find a stored ambiance");
    const data = localStorage.getItem("storedAmbiance");
    if (data) {
      setStoredAmbiance(JSON.parse(data));
      console.log("Stored ambiance found:", data);
    }
  }, []);

  const recoverAmbiance = async () => {
    Sentry.captureMessage("Click on recover ambiance in hero page", "info");
    if (storedAmbiance) {
      console.log("Recovering:", storedAmbiance);
      const stored = localStorage.getItem("storedAmbiance");
      if (stored) {
        try {
          const parsed: Ambiance = JSON.parse(stored);
          setCurrentAmbiance(parsed);

          // Extract unique sound ids from the loaded ambiance
          if (parsed.ambiance_sounds.length > 0) {
            const soundIds = [
              ...new Set(parsed.ambiance_sounds.map((sound) => sound.sound_id)),
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
          }

          setSearchAmbianceMenu(false);
          ShowToast("success", "ambiance", "Ambiance recovered");
        } catch (e) {
          console.error("Failed to parse stored ambiance", e);
          ShowToast("error", "ambiance", "Failed to recover your ambiance");
        }
      }
    }
  };

  const handleThemeChange = () => {
    //setHoverTheme(false);
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
    Sentry.captureMessage(
      `Click on get themed ambiance in hero page with theme : ${currentTheme.name}`,
      "info"
    );
    setLoadingThemedAmbiance(true);

    try {
      const res = await fetch("/api/get_themed_ambiance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: currentTheme.name }),
      });

      if (!res.ok) throw new Error("Failed to fetch themed ambiance");
      const ambiance: Ambiance = await res.json();
      setCurrentAmbiance(ambiance);

      const soundIds = [
        ...new Set(ambiance.ambiance_sounds.map((sound) => sound.sound_id)),
      ];

      const response = await fetch("/api/get_used_sounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ soundIds }),
      });

      if (!response.ok) throw new Error("Failed to load sounds");
      const soundsData: Sound[] = await response.json();
      setSoundsUsed(soundsData);

      setSearchAmbianceMenu(false);
      ShowToast("success", "ambiance", "Ambiance loaded");
    } catch (error) {
      console.error("Error fetching themed ambiance:", error);
      ShowToast("error", "ambiance", "Failed to load themed ambiance");
    } finally {
      setLoadingThemedAmbiance(false);
    }
  };

  return (
    <div
      aria-label="main page"
      className="relative flex flex-col justify-center flex-1 overflow-hidden text-center h-100dvh align-center"
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
          className="font-title text-7xl mb-1 text-white tracking-[8] translate-x-1.5"
        >
          FOG
        </h2>
        <p
          aria-label="subtitle"
          className="mb-6 text-lg font-bold uppercase text-white/100"
        >
          Free Audio Ambiances
        </p>

        {/* All buttons in column layout */}
        <div className="flex flex-col items-center gap-3 w-[calc(100vw-2rem)] max-w-90">
          {/* Recover ambiance button */}
          {storedAmbiance && (
            <button
              aria-label="recover ambiance button"
              data-testid="recover-ambiance-button"
              className="relative flex items-center px-3.5 py-4 font-bold text-sm w-full text-white border-0 rounded-full bg-black/50 hover:bg-black/70 hover:cursor-pointer text-md"
              onClick={recoverAmbiance}
            >
              <Headphones
                className="absolute w-5 h-5 left-5"
                strokeWidth={2.5}
              />
              <span className="flex-1 text-center">
                Recover your last ambiance
              </span>
            </button>
          )}

          {/* Search ambiance button */}
          <button
            aria-label="search ambiance button"
            className="relative flex items-center px-3.5 py-4 font-bold text-sm w-full text-white border-0 rounded-full bg-black/50 hover:bg-black/70 hover:cursor-pointer text-md"
            onClick={() => {
              Sentry.captureMessage(
                "Click on search ambiance button in hero page",
                "info"
              );
              openSearchAmbianceMenu();
            }}
          >
            <Search
              className="absolute w-5 h-5 left-5 -scale-x-100"
              strokeWidth={2.5}
            />
            <span className="flex-1 text-center">Search for an ambiance</span>
          </button>

          {/* Create ambiance button */}
          <button
            aria-label="create ambiance button"
            onClick={() => {
              Sentry.captureMessage(
                "Click on create ambiance button in hero page",
                "info"
              );
              setCurrentAmbiance(defaultAmbiance);
            }}
            className="relative flex items-center px-3.5 py-4 font-bold text-sm w-full text-white border-0 rounded-full bg-black/50 hover:bg-black/70 hover:cursor-pointer text-md"
          >
            <Plus className="absolute w-6 h-6 left-4.5" strokeWidth={2.5} />
            <span className="flex-1 text-center">Create a new ambiance</span>
          </button>

          {/* Themed ambiance button */}
          <button
            aria-label="open a random themed ambiance button"
            onClick={handleGetThemedAmbiance}
            disabled={loadingThemedAmbiance}
            className={`relative flex items-center bg-black/60 px-3.5 w-full py-4 font-bold text-sm text-white border-0 rounded-full text-md hover:cursor-pointer hover:bg-black/80 ${currentTheme.borderClass}`}
          >
            {loadingThemedAmbiance ? (
              <>
                <RefreshCcw className="absolute w-5 h-5 left-4 animate-spin" />
                <span className="flex-1 text-center">Loading ambiance...</span>
              </>
            ) : (
              <>
                <IconComponent
                  className={`absolute left-5 w-5 h-5 ${currentTheme.textClass}`}
                  strokeWidth={2.5}
                />
                <span className="flex-1 text-center">
                  Listen to a{currentTheme.vowel ? "n " : " "}
                  <span className={currentTheme.textClass}>
                    {currentTheme.name}
                  </span>{" "}
                  ambiance
                </span>
              </>
            )}
          </button>

          {/* Theme change button */}
          <button
            className={`p-3.5  border-0 rounded-full hover:cursor-pointer bg-black/60 hover:bg-black/80 ${currentTheme.borderClass}`}
            onClick={handleThemeChange}
            aria-label="change ambiance theme button"
          >
            <RefreshCcw className="w-6 h-6 text-gray-50" />
          </button>
        </div>
      </div>
    </div>
  );
}
