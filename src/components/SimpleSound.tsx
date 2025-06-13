"use client";

import { useGlobalStore } from "@/stores/useGlobalStore";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X, Copy } from "lucide-react";

interface Props {
  imagePath: string;
  audioPaths: string[];
  soundName: string;
  initialVolume: number;
  initialReverb: number;
  initialDirection?: number;
  number: number;
  id: number;
}

export default function SimpleSound({
  imagePath,
  audioPaths,
  soundName,
  initialVolume,
  initialReverb,
  initialDirection,
  number,
  id,
}: Props) {
  // Zustand
  const globalVolume = useGlobalStore((state) => state.globalVolume);
  const paused = useGlobalStore((state) => state.paused);
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );

  // States
  const [volume, setVolume] = useState(initialVolume);
  const [reverb, setReverb] = useState(initialReverb);
  const [direction, setDirection] = useState(initialDirection);
  const [expanded, setExpanded] = useState(false);
  const [hoverButton, setHoverButton] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // When volume or global volume changes, update the simple sound volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (volume / 100) * globalVolume;
    }
  }, [volume, globalVolume]);

  // Pause audio
  useEffect(() => {
    if (audioRef.current) {
      if (!paused) {
        audioRef.current.play().catch((e) => {
          console.warn("Playback failed:", e);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [paused]);

  // Handler to remove the sound when clicking on its remove button, removing it from the current ambiance
  const handleRemove = () => {
    if (!currentAmbiance) return;

    const updatedSounds = currentAmbiance.ambiance_sounds.filter(
      (sound) => sound.id !== id
    );

    setCurrentAmbiance({
      ...currentAmbiance,
      ambiance_sounds: updatedSounds,
    });
  };

  // Handler to copy the sound when clicking on its copy button, adding it to the current ambiance
  const handleCopy = () => {
    if (!currentAmbiance) return;

    const original = currentAmbiance.ambiance_sounds.find(
      (sound) => sound.id === id
    );
    if (!original) return;

    const maxId = Math.max(
      ...currentAmbiance.ambiance_sounds.map((sound) => sound.id),
      0
    );

    const newSound = {
      ...original,
      id: maxId + 1,
    };

    setCurrentAmbiance({
      ...currentAmbiance,
      ambiance_sounds: [...currentAmbiance.ambiance_sounds, newSound],
    });
  };

  return (
    <div
      aria-label={soundName + " sound"}
      className={`w-40 text-lg font-bold text-center bg-gray-900 text-gray-400 group  ${
        expanded ? "h-full" : ""
      }`}
    >
      <div className="relative bg-blue-800 h-38 group/image">
        <Image
          src={imagePath}
          alt={soundName}
          fill
          className="object-cover hover:cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        />

        {/* Show “more options” or “less options” when image is hovered */}
        <div
          onClick={() => setExpanded(!expanded)}
          className={`absolute bottom-0 left-0 right-0 flex items-center ${
            hoverButton ? "justify-between" : "justify-center"
          } rounded-full m-1.5 mb-2 px-2.5 py-1.5 text-xs text-gray-200 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity hover:cursor-pointer`}
        >
          {expanded && !hoverButton && <span>close</span>}
          {!expanded && !hoverButton && <span>more options</span>}
          {hoverButton && (
            <>
              <span>{soundName}</span>
              <span>{number}</span>
            </>
          )}
        </div>

        {/* Hide original label when image is hovered */}
        <div
          onClick={() => setExpanded(!expanded)}
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between rounded-full m-1.5 mb-2 px-2.5 py-1.5 text-xs text-gray-200 bg-black/40 group-hover/image:opacity-0 transition-opacity hover:cursor-pointer"
        >
          <span>{soundName}</span>
          <span>{number}</span>
        </div>

        {/* Buttons visible only when image is hovered */}
        <div
          onMouseEnter={() => setHoverButton(true)}
          onMouseLeave={() => setHoverButton(false)}
          className="absolute flex space-x-1 transition-opacity opacity-0 top-1 right-1 group-hover/image:opacity-100 duration-10"
        >
          <button
            aria-label="copy sound button"
            onClick={handleCopy}
            className="flex items-center justify-center w-6 h-6 text-gray-200 bg-black/50 text-md hover:bg-black/75 hover:cursor-pointer"
            title="Copy sound"
          >
            <Copy size={14} />
          </button>
          <button
            aria-label="remove sound button"
            onClick={handleRemove}
            className="flex items-center justify-center w-6 h-6 text-gray-200 bg-black/50 text-md hover:bg-red-700/60 hover:cursor-pointer"
            title="Remove sound"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {!expanded && (
        <div className="relative px-0 mt-0 group/slider">
          <div aria-label="volume slider" className="relative h-2.5">
            {/* Track background */}
            <div className="absolute inset-0 bg-emerald-900"></div>
            {/* Filled portion */}
            <div
              className="absolute inset-y-0 bg-emerald-400"
              style={{ width: `${volume}%` }}
            ></div>
            {/* Invisible but functional input */}
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-8 opacity-0 cursor-pointer"
            />
          </div>
          {/* Triangle indicator - only shows on hover*/}
          <div
            className="absolute mt-2 transition-opacity opacity-0 pointer-events-none duration-0 top-full group-hover/slider:opacity-100"
            style={{ left: `calc(${volume}% - 4px)` }}
          >
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-emerald-300"></div>
          </div>
        </div>
      )}

      {expanded && (
        <div aria-label="expanded options">
          <div
            aria-label="volume"
            className="m-2 border-2 rounded-xs border-gray-950 bg-gray-950"
          >
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Volume</span>
              <span className="text-xs text-gray-400">{volume}%</span>
            </div>
            <div className="px-2 pb-2">
              <div aria-label="volume slider" className="relative h-1.5">
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
          </div>

          <div
            aria-label="reverb"
            className="m-2 border-2 rounded-xs border-gray-950 bg-gray-950"
          >
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Reverb</span>
              <span className="text-xs text-gray-400">{reverb}%</span>
            </div>
            <div className="px-2 pb-2">
              <div aria-label="reverb slider" className="relative h-1.5">
                {/* Track background */}
                <div className="absolute inset-0 bg-orange-950"></div>
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 bg-orange-500"
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
          </div>

          <div
            aria-label="direction"
            className="m-2 border-2 rounded-xs border-gray-950 bg-gray-950"
          >
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Direction</span>
              <span className="text-xs text-gray-400">{direction}%</span>
            </div>
            <div className="px-2 mb-2">
              <div aria-label="direction slider" className="relative h-1.5">
                {/* Track background */}
                <div className="absolute inset-0 bg-stone-900"></div>
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 bg-stone-400"
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
          </div>
        </div>
      )}

      {audioPaths[0] && (
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
