"use client";

import { useGlobalStore } from "@/stores/useGlobalStore";
import Image from "next/image";
import { use, useEffect, useRef, useState } from "react";
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
  const [direction, setDirection] = useState(initialDirection);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [hoverButton, setHoverButton] = useState(false);
  const [lowGain, setLowGain] = useState(0);
  const [midGain, setMidGain] = useState(0);
  const [highGain, setHighGain] = useState(0);
  const [lowCutFreq, setLowCutFreq] = useState(20); // Hz - frequencies below this are cut
  const [highCutFreq, setHighCutFreq] = useState(20000); // Hz - frequencies above this are cut

  // Tone.js Refs
  const playerRef = useRef<Tone.Player | null>(null);
  const gainNodeRef = useRef<Tone.Gain | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pannerRef = useRef<Tone.Panner | null>(null);
  const eqRef = useRef<Tone.EQ3 | null>(null);
  const highpassFilterRef = useRef<Tone.Filter | null>(null);
  const lowpassFilterRef = useRef<Tone.Filter | null>(null);

  // Options Refs
  const volumeRef = useRef(volume);
  const directionRef = useRef(direction);
  const reverbWetRef = useRef(reverbWet);
  const reverbDecayRef = useRef(reverbDecay);
  const playbackRateRef = useRef(playbackRate);
  const lowGainRef = useRef(0);
  const midGainRef = useRef(0);
  const highGainRef = useRef(0);
  const lowCutFreqRef = useRef(20);
  const highCutFreqRef = useRef(20000);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    reverbWetRef.current = reverbWet;
  }, [reverbWet]);

  useEffect(() => {
    reverbDecayRef.current = reverbDecay;
  }, [reverbDecay]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    lowGainRef.current = lowGain;
  }, [lowGain]);

  useEffect(() => {
    midGainRef.current = midGain;
  }, [midGain]);

  useEffect(() => {
    highGainRef.current = highGain;
  }, [highGain]);

  useEffect(() => {
    lowCutFreqRef.current = lowCutFreq;
  }, [lowCutFreq]);

  useEffect(() => {
    highCutFreqRef.current = highCutFreq;
  }, [highCutFreq]);

  // PONCTUAL SOUNDS SETUP AND PLAYBACK
  useEffect(() => {
    if (!audioPaths[0] || !looping) return; // Only run this if there's an audio path and it's looping

    // Create a gain node (volume control)
    const gainNode = new Tone.Gain((volume / 100) * globalVolume);

    // Create a panner node (for stereo left-right direction)
    const panner = new Tone.Panner((direction - 50) / 50); // Normalize from [0–100] to [-1–1]

    // Create EQ
    const eq = new Tone.EQ3({
      low: lowGain,
      mid: midGain,
      high: highGain,
    });

    // Create a reverb effect with some configuration
    const reverb = new Tone.Reverb({
      decay: reverbDecay + 0.001, // how long the reverb lasts
      wet: reverbWet / 100, // how much reverb to mix in (0–1)
    });

    const highpassFilter = new Tone.Filter({
      type: "highpass",
      frequency: lowCutFreq,
      rolloff: -24,
    });

    const lowpassFilter = new Tone.Filter({
      type: "lowpass",
      frequency: highCutFreq,
      rolloff: -24,
    });

    // Connect the audio nodes together: Gain → Panner → Reverb → Speakers
    gainNode.connect(panner);
    panner.connect(highpassFilter);
    highpassFilter.connect(lowpassFilter);
    lowpassFilter.connect(eq);
    eq.connect(reverb);
    reverb.toDestination();

    // Save references to nodes so we can update/dispose them later
    gainNodeRef.current = gainNode;
    reverbRef.current = reverb;
    pannerRef.current = panner;
    eqRef.current = eq;
    highpassFilterRef.current = highpassFilter;
    lowpassFilterRef.current = lowpassFilter;

    // Create the actual audio player
    const player = new Tone.Player({
      url: audioPaths[0],
      loop: looping,
      autostart: false,
      onload: () => {
        if (!paused) {
          player.start(); // Start playback once loaded, unless paused
        }
      },
    }).connect(gainNode); // connect the player to our gain node

    player.playbackRate = playbackRate;
    playerRef.current = player; // save reference to the player

    // Clean up everything when component unmounts or dependencies change
    return () => {
      player.dispose();
      gainNode.dispose();
      panner.dispose();
      highpassFilter.dispose();
      lowpassFilter.dispose();
      reverb.dispose();
      eq.dispose();
    };
  }, [audioPaths[0], looping]);

  // Looping sounds updates when slider changes
  useEffect(() => {
    if (!looping) return;

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = (volume / 100) * globalVolume;
    }

    if (reverbRef.current) {
      reverbRef.current.wet.value = reverbWet / 100;
      reverbRef.current.decay = reverbDecay + 0.001;
    }

    if (pannerRef.current) {
      pannerRef.current.pan.value = (direction - 50) / 50; // -1 to 1
    }

    if (playerRef.current) {
      playerRef.current.playbackRate = playbackRate;
    }

    if (eqRef.current) {
      eqRef.current.low.value = lowGain;
      eqRef.current.mid.value = midGain;
      eqRef.current.high.value = highGain;
    }

    if (highpassFilterRef.current) {
      highpassFilterRef.current.frequency.value = lowCutFreq;
    }
    if (lowpassFilterRef.current) {
      lowpassFilterRef.current.frequency.value = highCutFreq;
    }
  }, [
    volume,
    globalVolume,
    direction,
    reverbWet,
    reverbDecay,
    looping,
    playbackRate,
    lowGain,
    midGain,
    highGain,
    lowCutFreq,
    highCutFreq,
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

  // PONCTUAL SOUNDS SETUP AND PLAYBACK
  useEffect(() => {
    if (!audioPaths.length || looping) return;

    let isCancelled = false;

    const playWithRandomDelay = () => {
      if (paused || isCancelled) return;

      // Choose a random audio file from the list
      const randomPath =
        audioPaths[Math.floor(Math.random() * audioPaths.length)];

      // Clean up any existing player
      if (playerRef.current) {
        playerRef.current.dispose();
      }

      // Create new player
      const player = new Tone.Player({
        url: randomPath,
        autostart: false,
        onload: () => {
          if (paused || isCancelled) return;

          // Start audio context and play the sound
          Tone.start().then(() => {
            if (paused || isCancelled) return;

            player.start();

            // Calculate total delay until next sound plays
            const duration = player.buffer?.duration ?? 0;
            const randomDelay = repeat_delay
              ? Math.random() * (repeat_delay[1] - repeat_delay[0]) +
                repeat_delay[0]
              : 0;

            const totalDelay =
              (duration * (1 / playbackRateRef.current) + randomDelay) * 1000;

            timeoutRef.current = setTimeout(playWithRandomDelay, totalDelay);
          });
        },
      });

      player.playbackRate = playbackRateRef.current;

      // Create gain, panner, and reverb nodes
      const gainNode = new Tone.Gain((volumeRef.current / 100) * globalVolume);
      const panner = new Tone.Panner(((directionRef.current ?? 50) - 50) / 50);
      const reverb = new Tone.Reverb({
        decay: reverbDecayRef.current + 0.001,
        wet: reverbWetRef.current / 100,
      });
      const eq = new Tone.EQ3({
        low: lowGainRef.current,
        mid: midGainRef.current,
        high: highGainRef.current,
      });
      const highpassFilter = new Tone.Filter({
        type: "highpass",
        frequency: lowCutFreqRef.current,
        rolloff: -24,
      });

      const lowpassFilter = new Tone.Filter({
        type: "lowpass",
        frequency: highCutFreqRef.current,
        rolloff: -24,
      });

      // Connect nodes: Player → Gain → Panner → Reverb → Output
      player.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(highpassFilter);
      highpassFilter.connect(lowpassFilter);
      lowpassFilter.connect(eq);
      eq.connect(reverb);
      reverb.toDestination();

      // Save refs
      playerRef.current = player;
      gainNodeRef.current = gainNode;
      reverbRef.current = reverb;
      pannerRef.current = panner;
      eqRef.current = eq;
      highpassFilterRef.current = highpassFilter;
      lowpassFilterRef.current = lowpassFilter;
    };

    playWithRandomDelay(); // Start the audio

    // Cleanup on unmount
    return () => {
      isCancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (playerRef.current) {
        playerRef.current.stop();
        playerRef.current.dispose();
      }
      if (gainNodeRef.current) gainNodeRef.current.dispose();
      if (pannerRef.current) pannerRef.current.dispose();
      if (reverbRef.current) reverbRef.current.dispose();
      if (eqRef.current) eqRef.current.dispose();
      if (highpassFilterRef.current) highpassFilterRef.current.dispose();
      if (lowpassFilterRef.current) lowpassFilterRef.current.dispose();
    };
  }, [audioPaths, repeat_delay, paused]); // ⚠️ don't include volume/globalVolume here to avoid restarting sounds

  // Separate effect to handle volume and reverb changes for non-looping sounds
  useEffect(() => {
    if (
      looping ||
      !gainNodeRef.current ||
      !reverbRef.current ||
      !pannerRef.current ||
      !playerRef.current ||
      !eqRef.current ||
      !highpassFilterRef.current ||
      !lowpassFilterRef.current
    )
      return;

    // Update volume and reverb of current player
    gainNodeRef.current.gain.value = (volume / 100) * globalVolume;
    pannerRef.current.pan.value = ((direction ?? 50) - 50) / 50;
    reverbRef.current.wet.value = reverbWet / 100;
    reverbRef.current.decay = reverbDecay + 0.001;
    playerRef.current.playbackRate = playbackRate;
    eqRef.current.low.value = lowGain;
    eqRef.current.mid.value = midGain;
    eqRef.current.high.value = highGain;
    highpassFilterRef.current.frequency.value = lowCutFreq;
    lowpassFilterRef.current.frequency.value = highCutFreq;
  }, [
    volume,
    globalVolume,
    direction,
    reverbWet,
    reverbDecay,
    looping,
    playbackRate,
    lowGain,
    midGain,
    highGain,
    lowCutFreq,
    highCutFreq,
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
          } px-2.5 py-1.5 text-xs text-gray-200 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity hover:cursor-pointer`}
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
          className="absolute bottom-0 left-0 right-0 flex items-center justify-between  px-2 py-1.5 text-xs text-gray-200 bg-black/40 group-hover/image:opacity-0 transition-opacity hover:cursor-pointer"
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
            <div className="absolute inset-0 bg-emerald-800"></div>
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
            aria-label="direction"
            className="m-2 border-2 rounded-xs border-gray-950 bg-gray-950"
          >
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Left / Right</span>
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

          <div
            aria-label="speed"
            className="m-2 mt-2 border-2 rounded-xs border-gray-950 bg-gray-950"
          >
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Speed</span>
              <span className="text-xs text-gray-400">x{playbackRate}</span>
            </div>
            <div className="px-2 pb-2">
              <div aria-label="playbackRate slider" className="relative h-1.5">
                <div className="absolute inset-0 bg-blue-950"></div>
                <div
                  className="absolute inset-y-0 bg-blue-400"
                  style={{ width: `${((playbackRate - 0.1) / 2.9) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(Number(e.target.value))}
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
              <span className="text-xs text-gray-400">{reverbWet}%</span>
            </div>
            <div className="px-2 pb-1">
              <div aria-label="reverb wet slider" className="relative h-1.5">
                {/* Track background */}
                <div className="absolute inset-0 bg-orange-950"></div>
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 bg-orange-400"
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
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Length</span>
              <span className="text-xs text-gray-400">
                {reverbDecay.toFixed(1)}s
              </span>
            </div>
            <div className="px-2 pb-2">
              <div aria-label="reverb decay slider" className="relative h-1.5">
                {/* Track background */}
                <div className="absolute inset-0 bg-orange-950"></div>
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 bg-orange-400"
                  style={{ width: `${(reverbDecay / 10) * 100}%` }}
                ></div>
                {/* Invisible but functional input */}
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={reverbDecay}
                  onChange={(e) => setReverbDecay(Number(e.target.value))}
                  className="w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
          {/* Equalizer */}
          <div className="m-2 mt-2 border-2 rounded-xs border-gray-950 bg-gray-950">
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Low</span>
              <span className="text-xs text-gray-400">{lowGain}dB</span>
            </div>
            <div className="px-2 pb-1">
              <div aria-label="low slider" className="relative h-1.5">
                <div className="absolute inset-0 bg-rose-950"></div>
                <div
                  className="absolute inset-y-0 bg-rose-400"
                  style={{ width: `${((lowGain + 40) / 80) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min={-40}
                  max={40}
                  value={lowGain}
                  onChange={(e) => setLowGain(Number(e.target.value))}
                  className="w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Mid</span>
              <span className="text-xs text-gray-400">{midGain}dB</span>
            </div>
            <div className="px-2 pb-1">
              <div aria-label="mid slider" className="relative h-1.5">
                <div className="absolute inset-0 bg-rose-950"></div>
                <div
                  className="absolute inset-y-0 bg-rose-400"
                  style={{ width: `${((midGain + 40) / 80) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min={-40}
                  max={40}
                  value={midGain}
                  onChange={(e) => setMidGain(Number(e.target.value))}
                  className="w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">High</span>
              <span className="text-xs text-gray-400">{highGain}dB</span>
            </div>
            <div className="px-2 pb-2">
              <div aria-label="high slider" className="relative h-1.5">
                <div className="absolute inset-0 bg-rose-950"></div>
                <div
                  className="absolute inset-y-0 bg-rose-400"
                  style={{ width: `${((highGain + 40) / 80) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min={-40}
                  max={40}
                  value={highGain}
                  onChange={(e) => setHighGain(Number(e.target.value))}
                  className="w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div
            aria-label="frequency cut"
            className="m-2 mt-2 border-2 rounded-xs border-gray-950 bg-gray-950"
          >
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">Low Cut</span>
              <span className="text-xs text-gray-400">{lowCutFreq}Hz</span>
            </div>
            <div className="px-2 pb-1">
              <div
                aria-label="low cut frequency slider"
                className="relative h-1.5"
              >
                <div className="absolute inset-0 bg-purple-950"></div>
                <div
                  className="absolute inset-y-0 bg-purple-400"
                  style={{ width: `${((lowCutFreq - 20) / 980) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={lowCutFreq}
                  onChange={(e) => setLowCutFreq(Number(e.target.value))}
                  className="w-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center justify-between h-5 mx-2 mt-1">
              <span className="text-xs text-gray-400">High Cut</span>
              <span className="text-xs text-gray-400">{highCutFreq}Hz</span>
            </div>
            <div className="px-2 pb-2">
              <div
                aria-label="high cut frequency slider"
                className="relative h-1.5"
              >
                <div className="absolute inset-0 bg-purple-950"></div>
                <div
                  className="absolute inset-y-0 bg-purple-400"
                  style={{ width: `${((highCutFreq - 1000) / 19000) * 100}%` }}
                ></div>
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="100"
                  value={highCutFreq}
                  onChange={(e) => setHighCutFreq(Number(e.target.value))}
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
                  &#177; {((repeat_delay[0] + repeat_delay[1]) / 2).toFixed(1)}s
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
