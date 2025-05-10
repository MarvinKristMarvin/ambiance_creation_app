"use client";

import React, { Dispatch, SetStateAction } from "react";
import type { Ambiance, Sound } from "../types";

interface Props {
  setCurrentAmbiance: Dispatch<SetStateAction<Ambiance | null>>;
  setSoundsUsed: Dispatch<SetStateAction<Sound[]>>;
}

export default function Hero({ setCurrentAmbiance, setSoundsUsed }: Props) {
  const loadAmbianceAndSounds = async () => {
    try {
      const response = await fetch("/api/ambiances/1");
      // If the response is not ok, throw an error (stops execution and go to catch)
      if (!response.ok) throw new Error("Failed to load ambiance");
      // Data retrieved must be of type Ambiance
      const data: Ambiance = await response.json();
      setCurrentAmbiance(data);
      const soundsResponse = await fetch("/api/ambiances/sounds/1");
      if (!soundsResponse.ok) throw new Error("Failed to load sounds");
      const soundsData: Sound[] = await soundsResponse.json();
      setSoundsUsed(soundsData);
    } catch (error) {
      console.error("Error loading ambiance or sounds :", error);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center align-center text-center">
      <h2 className="font-title text-7xl mb-8 text-emerald-300 tracking-[-9]">
        frog
      </h2>
      <p className="text-xl font-bold mb-6 text-gray-300">
        Create or listen to community made ambiances
      </p>
      <div className="flex justify-center items-center gap-4">
        <button
          className="bg-emerald-600 hover:bg-emerald-500 hover:cursor-pointer text-white font-bold py-4 px-6 text-md"
          onClick={loadAmbianceAndSounds}
        >
          Load an ambiance
        </button>
        <button className="hover:bg-emerald-950 border border-emerald-700 hover:cursor-pointer text-white font-bold py-4 px-6 text-md">
          Or create a new one
        </button>
      </div>
    </div>
  );
}
