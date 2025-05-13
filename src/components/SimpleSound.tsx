"use client";

import { useGlobalStore } from "@/stores/useGlobalStore";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Ambiance } from "../types";
import { X, Copy } from "lucide-react";

interface Props {
  imagePath: string;
  audioPaths: string[];
  soundName: string;
  initialVolume: number;
  initialReverb: number;
  initialDirection?: number;
  number: number;
  paused: boolean;
  playsInSections: number[];
  currentSection: number;
  soundId: number;
}

export default function SimpleSound({
  imagePath,
  audioPaths,
  soundName,
  initialVolume,
  initialReverb,
  initialDirection,
  number,
  paused,
  playsInSections,
  currentSection,
  soundId,
}: Props) {
  const [volume, setVolume] = useState(initialVolume);
  const [reverb, setReverb] = useState(initialReverb);
  const [direction, setDirection] = useState(initialDirection);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const globalVolume = useGlobalStore((state) => state.globalVolume);
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (volume / 100) * globalVolume;
    }
  }, [volume, globalVolume]);

  // Play or pause depending on currentSection and playsInSections
  useEffect(() => {
    if (!audioRef.current) return;

    const shouldPlay = playsInSections.includes(currentSection) && !paused;

    if (shouldPlay) {
      audioRef.current.play().catch((err) => {
        console.error("Audio play failed:", err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentSection, paused, playsInSections]);

  const handleRemove = () => {
    if (!currentAmbiance || !currentAmbiance.settings?.sections) return;

    const updatedSections = currentAmbiance.settings.sections.map((section) => {
      return {
        ...section,
        sounds: section.sounds.filter(
          (s) => !(s.sound_id === soundId && s.number === number)
        ),
      };
    });

    const updatedAmbiance: Ambiance = {
      ...currentAmbiance,
      settings: {
        ...currentAmbiance.settings,
        sections: updatedSections,
      },
    };

    setCurrentAmbiance(updatedAmbiance);
  };

  function handleCopy() {
    if (!currentAmbiance) return;

    const { settings } = currentAmbiance;

    // Find all numbers for this sound_id
    const existingNumbers = new Set<number>();
    settings.sections.forEach((section) => {
      section.sounds.forEach((s) => {
        if (s.sound_id === soundId) {
          existingNumbers.add(s.number);
        }
      });
    });

    // Find next available number (lowest missing integer starting from 1)
    let newNumber = 1;
    while (existingNumbers.has(newNumber)) {
      newNumber++;
    }

    // Add new copies of the sound to all matching sections
    const newSections = settings.sections.map((section, i) => {
      if (!playsInSections.includes(i + 1)) return section;

      return {
        ...section,
        sounds: [
          ...section.sounds,
          {
            sound_id: soundId,
            number: newNumber,
            volume,
            reverb,
            direction: direction ?? 0,
            repeat_delay: [5.0, 10.0], // Or reuse original's
          },
        ],
      };
    });

    setCurrentAmbiance({
      ...currentAmbiance,
      settings: {
        ...settings,
        sections: newSections,
      },
    });
  }

  return (
    <div className="group text-center text-gray-400 text-lg font-bold hover:bg-gray-800 w-40 bg-gray-900">
      <div className="relative bg-blue-800 h-30">
        <Image src={imagePath} alt={soundName} fill className="object-cover" />
        <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-10">
          <button
            onClick={handleCopy}
            className="bg-black/50 text-gray-200 text-md  w-6 h-6 flex items-center justify-center hover:bg-black/75 hover:cursor-pointer"
            title="Copy sound"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleRemove}
            className="bg-black/50 text-gray-200 text-md  w-6 h-6 flex items-center justify-center hover:bg-red-700/60 hover:cursor-pointer"
            title="Remove sound"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="mt-3 mx-4 flex items-center justify-between">
        <span className="text-xs text-gray-300">{soundName}</span>
        <span className="text-xs text-gray-300">{number}</span>
      </div>
      {/* Status Message */}
      {playsInSections.includes(currentSection) ? (
        volume === 0 ? (
          <div className="mt-3 border-y-2 border-red-900">
            <p className="text-xs text-red-700 py-2">MUTED</p>
          </div>
        ) : (
          <div className="mt-3 border-y-2 border-emerald-800">
            <p className="text-xs text-emerald-500 py-2">PLAYING</p>
          </div>
        )
      ) : (
        <div className="mt-3 border-y-2 border-yellow-800">
          <p className="text-xs text-yellow-400 py-2">
            {playsInSections.length === 1
              ? `PART ${playsInSections[0]}`
              : `PARTS ${playsInSections.join(" ")}`}
          </p>
        </div>
      )}

      {/* VOLUME SLIDER */}
      <div className="mt-3 mx-4 h-5 flex items-center justify-between">
        <span className="text-xs text-gray-400">Volume</span>
        <span className="text-xs text-gray-400">{volume}%</span>
      </div>
      <div className="px-4">
        <div className="relative h-3">
          {/* Track background */}
          <div className="absolute inset-0 bg-emerald-900"></div>
          {/* Filled portion */}
          <div
            className="absolute inset-y-0 bg-emerald-500"
            style={{ width: `${volume}%` }}
          ></div>
          {/* Invisible but functional input */}
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* REVERB SLIDER */}
      <div className="mt-3 mx-4 h-5 flex items-center justify-between">
        <span className="text-xs text-gray-400">Reverb</span>
        <span className="text-xs text-gray-400">{reverb}%</span>
      </div>
      <div className="px-4">
        <div className="relative h-3">
          {/* Track background */}
          <div className="absolute inset-0 bg-emerald-900"></div>
          {/* Filled portion */}
          <div
            className="absolute inset-y-0 bg-emerald-500"
            style={{ width: `${reverb}%` }}
          ></div>
          {/* Invisible but functional input */}
          <input
            type="range"
            min="0"
            max="100"
            value={reverb}
            onChange={(e) => setReverb(Number(e.target.value))}
            className="w-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* DIRECTION SLIDER */}
      <div className="mt-3 mx-4 h-5 flex items-center justify-between">
        <span className="text-xs text-gray-400">Direction</span>
        <span className="text-xs text-gray-400">{direction}%</span>
      </div>
      <div className="px-4">
        <div className="relative h-3">
          {/* Track background */}
          <div className="absolute inset-0 bg-emerald-900"></div>
          {/* Filled portion */}
          <div
            className="absolute inset-y-0 bg-emerald-500"
            style={{ width: `${direction}%` }}
          ></div>
          {/* Invisible but functional input */}
          <input
            type="range"
            min="0"
            max="100"
            value={direction}
            onChange={(e) => setDirection(Number(e.target.value))}
            className="w-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {audioPaths?.[0] && (
        <audio
          ref={audioRef}
          src={audioPaths[0]}
          loop
          preload="auto"
          style={{ display: "none" }}
        />
      )}
    </div>
  );
}
