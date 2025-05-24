import { useGlobalStore } from "@/stores/useGlobalStore";
import { Ghost, Leaf, Search, Star } from "lucide-react";
import React from "react";
import { useEffect } from "react";
import type { Ambiance, AmbianceBasicInformations, Sound } from "@/types";

export default function SearchAmbianceMenu() {
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

  // Fetch ambiances basic informations which serve to display ambiances in the search menu
  useEffect(() => {
    const fetchAmbiances = async () => {
      try {
        const response = await fetch("/api/get_search_menu_ambiances");
        if (!response.ok)
          throw new Error(
            "Failed to fetch ambiances basic informations which serve to display ambiances in the search menu"
          );
        const data: AmbianceBasicInformations[] = await response.json();
        // Update zustand with fetched ambiances
        setSearchedAmbiancesBasicInformations(data);
      } catch (error) {
        console.error("Error fetching sounds:", error);
      }
    };

    fetchAmbiances();
  }, [setSearchedAmbiancesBasicInformations]);

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
    } catch (error) {
      console.error("Error loading ambiance or sounds :", error);
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
          placeholder="Search an ambiance"
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
          Results : {searchedAmbiancesBasicInformations.length} ambiance
          {searchedAmbiancesBasicInformations.length !== 1 ? "s" : ""}
        </p>

        <div className="flex flex-col gap-0.5 p-0.5">
          {searchedAmbiancesBasicInformations.map((ambiance) => (
            <article
              aria-label="ambiance found"
              key={ambiance.id}
              onClick={() => handleLoadAmbiance(ambiance.id)}
              className="flex flex-col items-center px-4 py-2 text-sm font-bold text-left text-gray-300 bg-gray-800 rounded-xs hover:bg-gray-700 hover:cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <p>{ambiance.ambiance_name}</p>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-200/80" />
                  <span className="pl-1 text-yellow-200/80">27</span>
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1">
                  <Leaf className="w-4 h-4 text-green-400" />
                  <Ghost className="w-4 h-4 text-purple-600 stroke-3" />
                </div>
                <p className="text-gray-400">12 Sounds</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
