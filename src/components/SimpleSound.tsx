"use client";

import { useGlobalStore } from "@/stores/useGlobalStore";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X, Copy } from "lucide-react";
import * as Tone from "tone";

interface Props {
  imagePath: string;
  audioPaths: string[];
  soundName: string;
  initialVolume: number;
  initialReverb: number;
  initialDirection: number;
  number: number;
  id: number;
  looping: boolean;
  repeat_delay: number[] | null;
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
  looping,
  repeat_delay,
}: Props) {
  const globalVolume = useGlobalStore((state) => state.globalVolume);
  const paused = useGlobalStore((state) => state.paused);
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );

  const [volume, setVolume] = useState(initialVolume);
  const [reverbWet, setReverbWet] = useState(initialReverb);
  const [reverbDecay, setReverbDecay] = useState(1.5);
  const [reverbPreDelay, setReverbPreDelay] = useState(0.01);
  const [direction, setDirection] = useState(initialDirection);
  const [expanded, setExpanded] = useState(false);
  const [hoverButton, setHoverButton] = useState(false);

  const playerRef = useRef<Tone.Player | null>(null);
  const gainNodeRef = useRef<Tone.Gain | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pannerRef = useRef<Tone.Panner | null>(null);

  // Non looping sounds
  useEffect(() => {
    if (!audioPaths[0] || !looping) return;

    const gainNode = new Tone.Gain((volume / 100) * globalVolume);
    const panner = new Tone.Panner(((direction ?? 50) - 50) / 50); // -1 to 1
    const reverb = new Tone.Reverb({
      decay: reverbDecay,
      preDelay: reverbPreDelay,
      wet: reverbWet / 100,
    });

    // Connect: gain -> reverb -> destination
    gainNode.connect(panner);
    panner.connect(reverb);
    reverb.toDestination();

    gainNodeRef.current = gainNode;
    reverbRef.current = reverb;
    pannerRef.current = panner;

    const player = new Tone.Player({
      url: audioPaths[0],
      loop: looping,
      autostart: false,
      onload: () => {
        if (!paused) {
          player.start();
        }
      },
    }).connect(gainNode);

    playerRef.current = player;

    return () => {
      player.dispose();
      gainNode.dispose();
      panner.dispose();
      reverb.dispose();
    };
  }, [audioPaths[0], looping]);

  // Looping sounds
  useEffect(() => {
    if (!looping) return;

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = (volume / 100) * globalVolume;
    }

    if (reverbRef.current) {
      reverbRef.current.wet.value = reverbWet / 100;
      reverbRef.current.decay = reverbDecay;
      reverbRef.current.preDelay = reverbPreDelay;
    }

    if (pannerRef.current) {
      // -1 to 1
      pannerRef.current.pan.value = (direction - 50) / 50;
    }
  }, [
    volume,
    globalVolume,
    direction,
    reverbWet,
    reverbDecay,
    reverbPreDelay,
    looping,
  ]);

  // Handle play/pause for looping sounds
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !looping) return;

    if (paused) {
      if (player.state === "started") {
        player.stop();
      }
    } else {
      if (player.buffer.loaded) {
        Tone.start().then(() => {
          player.start();
        });
      }
    }
  }, [paused, looping]);

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

  // Setup and play sound for non-looping sounds
  useEffect(() => {
    if (!audioPaths.length || looping) return;

    let isCancelled = false;

    const playWithRandomDelay = () => {
      if (paused || isCancelled) return;

      // Random audio path
      const randomPath =
        audioPaths[Math.floor(Math.random() * audioPaths.length)];

      // Dispose previous player
      if (playerRef.current) {
        playerRef.current.dispose();
      }

      // Create new player
      const player = new Tone.Player({
        url: randomPath,
        autostart: false,
        onload: () => {
          if (paused || isCancelled) return;

          Tone.start().then(() => {
            if (paused || isCancelled) return; // Check again after async operation

            player.start();

            const duration = player.buffer?.duration ?? 0;
            const randomDelay = repeat_delay
              ? Math.random() * (repeat_delay[1] - repeat_delay[0]) +
                repeat_delay[0]
              : 0;

            const totalDelay = (duration + randomDelay) * 1000;

            timeoutRef.current = setTimeout(playWithRandomDelay, totalDelay);
          });
        },
      });

      // Create reverb and gain for non-looping sounds
      const gainNode = new Tone.Gain((volume / 100) * globalVolume);
      const panner = new Tone.Panner(((direction ?? 50) - 50) / 50); // -1 to 1
      const reverb = new Tone.Reverb({
        decay: reverbDecay,
        preDelay: reverbPreDelay,
        wet: reverbWet / 100,
      });

      // Connect: player -> gain -> reverb -> destination
      player.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(reverb);
      reverb.toDestination();

      playerRef.current = player;
      gainNodeRef.current = gainNode;
      reverbRef.current = reverb;
      pannerRef.current = panner;
    };

    playWithRandomDelay();

    return () => {
      isCancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.dispose();
      }
      if (pannerRef.current) {
        pannerRef.current.dispose();
      }
      if (reverbRef.current) {
        reverbRef.current.dispose();
      }
    };
  }, [audioPaths, repeat_delay, paused]); // Removed volume and globalVolume from dependencies

  useEffect(() => {
    if (pannerRef.current && direction !== undefined) {
      const panValue = (direction - 50) / 50; // map 0–100 to -1 to 1
      pannerRef.current.pan.value = panValue;
    }
  }, [direction]);

  // Separate effect to handle volume and reverb changes for non-looping sounds
  useEffect(() => {
    if (
      looping ||
      !gainNodeRef.current ||
      !reverbRef.current ||
      !pannerRef.current
    )
      return;

    // Update volume and reverb of current player
    gainNodeRef.current.gain.value = (volume / 100) * globalVolume;
    pannerRef.current.pan.value = ((direction ?? 50) - 50) / 50;
    reverbRef.current.wet.value = reverbWet / 100;
    reverbRef.current.decay = reverbDecay;
    reverbRef.current.preDelay = reverbPreDelay;
  }, [
    volume,
    globalVolume,
    direction,
    reverbWet,
    reverbDecay,
    reverbPreDelay,
    looping,
  ]);

  // Handle pause for non-looping sounds
  useEffect(() => {
    if (looping) return;

    if (paused) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (playerRef.current) {
        playerRef.current.stop();
      }
    }
  }, [paused, looping]);

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

        {/* Show "more options" or "less options" when image is hovered */}
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
            className="m-2 mt-2.5 border-2 rounded-xs border-gray-950 bg-gray-950"
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
            aria-label="reverb wet"
            className="m-2 border-2 rounded-xs border-gray-950 bg-gray-950"
          >
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Reverb Mix</span>
              <span className="text-xs text-gray-400">{reverbWet}%</span>
            </div>
            <div className="px-2 pb-2">
              <div aria-label="reverb wet slider" className="relative h-1.5">
                {/* Track background */}
                <div className="absolute inset-0 bg-orange-950"></div>
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 bg-orange-500"
                  style={{ width: `${reverbWet}%` }}
                ></div>
                {/* Invisible but functional input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reverbWet}
                  onChange={(e) => setReverbWet(Number(e.target.value))}
                  className="w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div
            aria-label="reverb decay"
            className="m-2 border-2 rounded-xs border-gray-950 bg-gray-950"
          >
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Decay Time</span>
              <span className="text-xs text-gray-400">
                {reverbDecay.toFixed(1)}s
              </span>
            </div>
            <div className="px-2 pb-2">
              <div aria-label="reverb decay slider" className="relative h-1.5">
                {/* Track background */}
                <div className="absolute inset-0 bg-blue-950"></div>
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 bg-blue-500"
                  style={{ width: `${(reverbDecay / 10) * 100}%` }}
                ></div>
                {/* Invisible but functional input */}
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={reverbDecay}
                  onChange={(e) => setReverbDecay(Number(e.target.value))}
                  className="w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div
            aria-label="reverb pre-delay"
            className="m-2 border-2 rounded-xs border-gray-950 bg-gray-950"
          >
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Pre-delay</span>
              <span className="text-xs text-gray-400">
                {Math.round(reverbPreDelay * 1000)}ms
              </span>
            </div>
            <div className="px-2 pb-2">
              <div
                aria-label="reverb pre-delay slider"
                className="relative h-1.5"
              >
                {/* Track background */}
                <div className="absolute inset-0 bg-teal-950"></div>
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 bg-teal-500"
                  style={{ width: `${(reverbPreDelay / 0.1) * 100}%` }}
                ></div>
                {/* Invisible but functional input */}
                <input
                  type="range"
                  min="0"
                  max="0.1"
                  step="0.001"
                  value={reverbPreDelay}
                  onChange={(e) => setReverbPreDelay(Number(e.target.value))}
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
              <span className="text-xs text-gray-400">
                {Math.round((direction * 0.02 - 1) * 10) / 10}
              </span>
            </div>
            <div className="px-2 mb-2">
              <div aria-label="direction slider" className="relative h-1.5">
                {/* Track background */}
                <div className="absolute inset-0 bg-stone-900"></div>

                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 bg-stone-900"
                  style={{ width: `${direction}%` }}
                ></div>

                {/* Fake slider handle */}
                <div
                  className="absolute w-2 h-1.5 -translate-y-1/2 bg-stone-400 top-1/2"
                  style={{
                    left: `calc(${direction}% - (${direction}/100 * 8px))`,
                  }}
                ></div>

                {/* Transparent range slider with styled thumb */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={direction}
                  onChange={(e) => {
                    setDirection(Number(e.target.value));
                    if (!currentAmbiance) return;
                    const updatedSounds = currentAmbiance.ambiance_sounds.map(
                      (sound) =>
                        sound.id === id
                          ? {
                              ...sound,
                              direction: direction,
                            }
                          : sound
                    );

                    setCurrentAmbiance({
                      ...currentAmbiance,
                      ambiance_sounds: updatedSounds,
                    });
                  }}
                  className="w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {repeat_delay && (
            <div
              aria-label="Repeat delay"
              className="m-2 border-2 rounded-xs border-gray-950 bg-gray-950"
            >
              <div className="flex items-center justify-between h-5 mx-2 mt-1">
                <span className="text-xs text-gray-400">Plays every</span>
                <span className="text-xs text-gray-400">
                  {((repeat_delay[0] + repeat_delay[1]) / 2).toFixed(1)}s
                </span>
              </div>
              <div className="w-full px-2 mb-2">
                <div className="flex items-center mt-1 text-xs">
                  <input
                    type="number"
                    min="0"
                    className="w-12 px-2 py-1 bg-gray-800 rounded-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={repeat_delay[0]}
                    onChange={(e) => {
                      const newMin = Number(e.target.value);
                      if (!currentAmbiance) return;

                      const updatedSounds = currentAmbiance.ambiance_sounds.map(
                        (sound) =>
                          sound.id === id
                            ? {
                                ...sound,
                                repeat_delay: [newMin, repeat_delay[1]],
                              }
                            : sound
                      );

                      setCurrentAmbiance({
                        ...currentAmbiance,
                        ambiance_sounds: updatedSounds,
                      });
                    }}
                  />
                  <span className="mx-2 text-xs text-gray-600">to</span>
                  <input
                    type="number"
                    min="0"
                    className="w-12.5 px-2 py-1 bg-gray-800 rounded-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={repeat_delay[1]}
                    onChange={(e) => {
                      const newMax = Number(e.target.value);
                      if (!currentAmbiance) return;

                      const updatedSounds = currentAmbiance.ambiance_sounds.map(
                        (sound) =>
                          sound.id === id
                            ? {
                                ...sound,
                                repeat_delay: [repeat_delay[0], newMax],
                              }
                            : sound
                      );

                      setCurrentAmbiance({
                        ...currentAmbiance,
                        ambiance_sounds: updatedSounds,
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
