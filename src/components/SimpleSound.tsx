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
  paused: boolean;
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
}: Props) {
  const [volume, setVolume] = useState(initialVolume);
  const [reverb, setReverb] = useState(initialReverb);
  const [direction, setDirection] = useState(initialDirection);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const globalVolume = useGlobalStore((state) => state.globalVolume);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (volume / 100) * globalVolume;
    }
  }, [volume, globalVolume]);

  return (
    <div className="w-40 text-lg font-bold text-center text-gray-400 bg-gray-900 group hover:bg-gray-800">
      <div className="relative bg-blue-800 h-30">
        <Image src={imagePath} alt={soundName} fill className="object-cover" />
        <div className="absolute flex space-x-1 transition-opacity opacity-0 top-1 right-1 group-hover:opacity-100 duration-10">
          <button
            // onClick={handleCopy}
            className="flex items-center justify-center w-6 h-6 text-gray-200 bg-black/50 text-md hover:bg-black/75 hover:cursor-pointer"
            title="Copy sound"
          >
            <Copy size={14} />
          </button>
          <button
            // onClick={handleRemove}
            className="flex items-center justify-center w-6 h-6 text-gray-200 bg-black/50 text-md hover:bg-red-700/60 hover:cursor-pointer"
            title="Remove sound"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mx-4 mt-3">
        <span className="text-xs text-gray-300">{soundName}</span>
        <span className="text-xs text-gray-300">{number}</span>
      </div>

      {/* VOLUME SLIDER */}
      <div className="flex items-center justify-between h-5 mx-4 mt-3">
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
      <div className="flex items-center justify-between h-5 mx-4 mt-3">
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
      <div className="flex items-center justify-between h-5 mx-4 mt-3">
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
