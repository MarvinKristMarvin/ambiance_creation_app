"use client";

import { useGlobalStore } from "@/stores/useGlobalStore";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X, Copy, VolumeX, ChevronUp } from "lucide-react";
import * as Tone from "tone";
import { useShowToast } from "@/hooks/useShowToast";
import { useCallback } from "react";
import {
  addIndexedDbSoundWithEviction,
  getIndexedDbSoundById,
} from "@/lib/indexedDb";
import { IndexedDbSound, Ambiance } from "@/types";

interface Props {
  imagePath: string;
  audioPaths: string[];
  soundName: string;
  initialVolume: number;
  initialReverb: number;
  initialReverbDuration: number;
  initialDirection: number;
  initialSpeed: number;
  initialLow: number;
  initialMid: number;
  initialHigh: number;
  initialLowCut: number;
  initialHighCut: number;
  number: number;
  id: number;
  looping: boolean;
  repeat_delay: number[] | null;
  audioBlobs: Blob[];
  category: string;
  dbSoundId: number;
  onBlobStored: (soundId: number, indexedDbSound: IndexedDbSound) => void;
}

// Helper function to convert AudioBuffer to WAV Blob
async function audioBufferToWavBlob(
  buffer: AudioBuffer,
  sampleRate: number
): Promise<Blob> {
  const numberOfChannels = buffer.numberOfChannels;
  const length = buffer.length * numberOfChannels * 2 + 44;
  const result = new ArrayBuffer(length);
  const view = new DataView(result);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data: number) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data: number) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  // RIFF chunk descriptor
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  // FMT sub-chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // subchunk1 size, PCM
  setUint16(1); // audio format, PCM
  setUint16(numberOfChannels);
  setUint32(sampleRate);
  setUint32(sampleRate * numberOfChannels * 2); // byte rate
  setUint16(numberOfChannels * 2); // block align
  setUint16(16); // bits per sample

  // Data sub-chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4); // subchunk2 size

  // Write interleaved data
  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([result], { type: "audio/wav" });
}

// Helper to fetch download count via HEAD request
async function fetchDownloadCountFromHead(url: string): Promise<number | null> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (!response.ok) {
      console.error("HEAD request failed");
      return null;
    }
    const count = response.headers.get("X-Download-Count");
    return count ? parseInt(count, 10) : null;
  } catch (err) {
    console.error("HEAD request error:", err);
    return null;
  }
}

export default function SimpleSound({
  imagePath,
  audioPaths,
  soundName,
  initialVolume,
  initialReverb,
  initialReverbDuration,
  initialDirection,
  initialSpeed,
  number,
  id,
  looping,
  repeat_delay,
  initialLow,
  initialMid,
  initialHigh,
  initialLowCut,
  initialHighCut,
  audioBlobs,
  category,
  dbSoundId,
}: Props) {
  const globalVolume = useGlobalStore((state) => state.globalVolume);
  const currentAmbiance = useGlobalStore((state) => state.currentAmbiance);
  const setCurrentAmbiance = useGlobalStore(
    (state) => state.setCurrentAmbiance
  );
  const { ShowToast } = useShowToast();
  // const setNumberOfSoundsDownloaded = useGlobalStore(
  //   (state) => state.setNumberOfSoundsDownloaded
  // );

  const [mute, setMute] = useState(1);
  const [volume, setVolume] = useState(initialVolume);
  const [reverbWet, setReverbWet] = useState(initialReverb);
  const [reverbDecay, setReverbDecay] = useState(initialReverbDuration);
  const [direction, setDirection] = useState(initialDirection);
  const [playbackRate, setPlaybackRate] = useState(initialSpeed);
  const [expanded, setExpanded] = useState(false);
  const [hoverButton, setHoverButton] = useState(false);
  const [lowGain, setLowGain] = useState(initialLow);
  const [midGain, setMidGain] = useState(initialMid);
  const [highGain, setHighGain] = useState(initialHigh);
  const [lowCutFreq, setLowCutFreq] = useState(initialLowCut);
  const [highCutFreq, setHighCutFreq] = useState(initialHighCut);

  // Tone.js Refs
  const playerRef = useRef<Tone.Player | null>(null);
  const gainNodeRef = useRef<Tone.Gain | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pannerRef = useRef<Tone.Panner | null>(null);
  const eqRef = useRef<Tone.EQ3 | null>(null);
  const highpassFilterRef = useRef<Tone.Filter | null>(null);
  const lowpassFilterRef = useRef<Tone.Filter | null>(null);
  // Add these refs for preloaded audio buffers
  const audioBuffersRef = useRef<Tone.ToneAudioBuffer[]>([]);
  const buffersLoadedRef = useRef(false);

  // Options Refs
  const volumeRef = useRef(volume);
  const directionRef = useRef(direction);
  const reverbWetRef = useRef(reverbWet);
  const reverbDecayRef = useRef(reverbDecay);
  const playbackRateRef = useRef(playbackRate);
  const lowGainRef = useRef(lowGain);
  const midGainRef = useRef(midGain);
  const highGainRef = useRef(highGain);
  const lowCutFreqRef = useRef(lowCutFreq);
  const highCutFreqRef = useRef(highCutFreq);
  const globalVolumeRef = useRef(globalVolume);
  const muteRef = useRef(mute);

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

  useEffect(() => {
    globalVolumeRef.current = globalVolume;
  }, [globalVolume]);

  useEffect(() => {
    muteRef.current = mute;
  }, [mute]);

  // Add this function to capture and store the loaded audio
  const captureAndStoreAudio = useCallback(
    async (
      soundId: number,
      soundName: string,
      audioPath: string,
      audioBlob: Blob,
      currentAmbiance: Ambiance // Replace with your Ambiance type
    ) => {
      try {
        // Check if this sound is already in IndexedDB
        const existingSound = await getIndexedDbSoundById(soundId);
        if (existingSound) {
          return; // Already stored
        }

        // Create IndexedDbSound object
        const indexedSound: IndexedDbSound = {
          id: soundId,
          sound_name: soundName,
          audio_paths: [audioPath],
          image_path: imagePath,
          looping: looping,
          volume: volume,
          reverb: reverbWet,
          reverb_duration: reverbDecay,
          speed: playbackRate,
          direction: direction,
          category: category,
          repeat_delay: repeat_delay,
          // Add other required properties from your Sound type
          audios: [audioBlob],
          storageIndex: Date.now(), // Temporary index, will be updated if needed
        };

        // Store in IndexedDB with eviction logic
        if (currentAmbiance) {
          await addIndexedDbSoundWithEviction(indexedSound, currentAmbiance);
          console.log(
            `✅ Captured and stored audio for sound ${soundId}: ${soundName}`
          );
        }
      } catch (error) {
        console.error(
          `Failed to capture and store audio for sound ${soundId}:`,
          error
        );
      }
    },
    []
  );

  // LOOPING SOUNDS SETUP AND PLAYBACK
  useEffect(() => {
    if (!audioPaths[0] || !looping) return;

    // Create audio nodes (same as before)
    const gainNode = new Tone.Gain(
      (volumeRef.current / 100) * globalVolumeRef.current * muteRef.current
    );
    const panner = new Tone.Panner(direction);
    const eq = new Tone.EQ3({
      low: lowGain,
      mid: midGain,
      high: highGain,
    });
    const reverb = new Tone.Reverb({
      decay: reverbDecay + 0.001,
      wet: reverbWet / 100,
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

    // Connect nodes (same as before)
    gainNode.connect(panner);
    panner.connect(highpassFilter);
    highpassFilter.connect(lowpassFilter);
    lowpassFilter.connect(eq);
    eq.connect(reverb);
    reverb.toDestination();

    // Save references (same as before)
    gainNodeRef.current = gainNode;
    reverbRef.current = reverb;
    pannerRef.current = panner;
    eqRef.current = eq;
    highpassFilterRef.current = highpassFilter;
    lowpassFilterRef.current = lowpassFilter;

    // MODIFIED: Create player with blob capture logic
    let objectUrl: string | null = null;
    let finalUrl: string;
    let shouldCaptureBlob = false;

    if (audioBlobs?.[0]) {
      // Use existing blob
      objectUrl = URL.createObjectURL(audioBlobs[0]);
      finalUrl = objectUrl;
      console.log(`🟢 Using cached blob for sound`);
    } else {
      // Use API URL and mark for capture
      finalUrl = "/api" + audioPaths[0];
      shouldCaptureBlob = true;
      console.log(`🟡 Loading from URL, will capture blob: ${finalUrl}`);

      // HEAD request for download count
      fetchDownloadCountFromHead(finalUrl).then((count) => {
        if (count !== null) {
          ShowToast("warning", "info", `Number of sounds downloaded: ${count}`);
        }
      });
    }

    const player = new Tone.Player({
      url: finalUrl,
      loop: looping,
      autostart: false,
      onload: async () => {
        // MODIFIED: Capture the loaded audio if it came from URL
        if (shouldCaptureBlob && player.buffer && currentAmbiance) {
          try {
            // Convert the loaded audio buffer to blob
            const audioContext = Tone.getContext();
            const buffer = player.buffer.get();

            if (buffer instanceof AudioBuffer) {
              // Convert AudioBuffer to WAV blob
              const wavBlob = await audioBufferToWavBlob(
                buffer,
                audioContext.sampleRate
              );

              // Find the sound info (you might need to pass more props to SimpleSound)
              //! maybe use id instead of dbSoundId
              const soundId = dbSoundId; // Assuming you have sound ID available
              const name = soundName; // Assuming you have sound name available

              // Capture and store the blob
              await captureAndStoreAudio(
                soundId,
                name,
                audioPaths[0],
                wavBlob,
                currentAmbiance
              );
            }
          } catch (error) {
            console.error("Failed to capture audio blob:", error);
          }
        }

        player.start();
      },
    }).connect(gainNode);

    player.playbackRate = playbackRate;
    playerRef.current = player;

    // Cleanup (same as before)
    return () => {
      player.dispose();
      gainNode.dispose();
      panner.dispose();
      highpassFilter.dispose();
      lowpassFilter.dispose();
      reverb.dispose();
      eq.dispose();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [audioPaths[0], looping, mute, currentAmbiance, captureAndStoreAudio]);

  // Looping sounds updates when slider changes
  useEffect(() => {
    if (!looping) return;

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value =
        (volumeRef.current / 100) * globalVolumeRef.current * muteRef.current;
    }

    if (reverbRef.current) {
      reverbRef.current.wet.value = reverbWet / 100;
      reverbRef.current.decay = reverbDecay + 0.001;
    }

    if (pannerRef.current) {
      pannerRef.current.pan.value = direction; // -1 to 1
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
    mute,
  ]);

  const handleRemove = () => {
    if (!currentAmbiance) return;

    const updatedSounds = currentAmbiance.ambiance_sounds.filter(
      (sound) => sound.id !== id
    );

    setCurrentAmbiance({
      ...currentAmbiance,
      ambiance_sounds: updatedSounds,
    });

    ShowToast("neutral", "delete", "Sound removed");
  };

  const handleMute = () => {
    if (!currentAmbiance) return;
    if (mute === 1) {
      setMute(0);
    } else {
      setMute(1);
    }
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

    ShowToast("neutral", "addsound", "Sound copied");
  };

  // PRELOAD AUDIO BUFFERS FOR PUNCTUAL SOUNDS
  useEffect(() => {
    if (!audioPaths.length || looping) return;

    let isCancelled = false;
    buffersLoadedRef.current = false;
    audioBuffersRef.current = [];

    const loadBuffers = async () => {
      try {
        // Only check HEAD for audioPaths[0] if no corresponding blob
        if (!audioBlobs?.[0]) {
          try {
            const headRes = await fetch("/api" + audioPaths[0], {
              method: "HEAD",
            });
            const count = headRes.headers.get("X-Download-Count");
            if (count) {
              ShowToast(
                "warning",
                "info",
                `number of sounds downloaded (from x-download-count): ${count}`
              );
            }
          } catch (err) {
            console.warn(
              "HEAD request failed for:",
              "/api" + audioPaths[0],
              err
            );
          }
        }

        // Load all audio files in parallel
        const bufferPromises = audioPaths.map((path, index) => {
          if (audioBlobs?.[index]) {
            const objectUrl = URL.createObjectURL(audioBlobs[index]);
            return Tone.ToneAudioBuffer.fromUrl(objectUrl).then((buffer) => {
              URL.revokeObjectURL(objectUrl);
              return buffer;
            });
          } else {
            return Tone.ToneAudioBuffer.fromUrl("/api" + path);
          }
        });

        const buffers = await Promise.all(bufferPromises);

        if (!isCancelled) {
          audioBuffersRef.current = buffers;
          buffersLoadedRef.current = true;
        }
      } catch (error) {
        console.error("Error loading audio buffers:", error);
      }
    };

    loadBuffers();

    return () => {
      isCancelled = true;
      // Clean up buffers
      audioBuffersRef.current.forEach((buffer) => buffer.dispose());
      audioBuffersRef.current = [];
      buffersLoadedRef.current = false;
    };
  }, [audioPaths, looping]);

  /// PUNCTUAL SOUNDS PLAYBACK WITH PRELOADED BUFFERS
  useEffect(() => {
    if (!audioPaths.length || looping) return;

    let isCancelled = false;

    const playWithRandomDelay = () => {
      if (isCancelled || !buffersLoadedRef.current) return;

      const buffer =
        audioBuffersRef.current[
          Math.floor(Math.random() * audioBuffersRef.current.length)
        ];

      const player = new Tone.Player({
        url: buffer,
        autostart: false,
      });

      player.playbackRate = playbackRateRef.current;

      const gainNode = new Tone.Gain(
        (volumeRef.current / 100) * globalVolumeRef.current * muteRef.current
      );
      const panner = new Tone.Panner(directionRef.current);
      const reverb = new Tone.Reverb({
        decay: reverbDecayRef.current + 0.001,
        wet: reverbWetRef.current / 100,
      });
      const eq = new Tone.EQ3({
        low: lowGainRef.current,
        mid: midGainRef.current,
        high: highGainRef.current,
      });
      const highpass = new Tone.Filter({
        type: "highpass",
        frequency: lowCutFreqRef.current,
        rolloff: -24,
      });
      const lowpass = new Tone.Filter({
        type: "lowpass",
        frequency: highCutFreqRef.current,
        rolloff: -24,
      });

      // Connect chain
      player.chain(
        gainNode,
        panner,
        highpass,
        lowpass,
        eq,
        reverb,
        Tone.Destination
      );

      Tone.start().then(() => {
        if (isCancelled) return;

        player.start();

        // Schedule disposal after playback ends
        const duration = buffer.duration / playbackRateRef.current;
        const randomDelay = repeat_delay
          ? Math.random() * (repeat_delay[1] - repeat_delay[0]) +
            repeat_delay[0]
          : 0;

        setTimeout(() => {
          player.dispose();
          gainNode.dispose();
          panner.dispose();
          reverb.dispose();
          eq.dispose();
          highpass.dispose();
          lowpass.dispose();

          // Schedule next playback
          if (!isCancelled) {
            timeoutRef.current = setTimeout(
              playWithRandomDelay,
              randomDelay * 1000
            );
          }
        }, duration * 1000); // Dispose right after sound ends
      });
    };

    // Wait for buffers to load, then start playing
    const checkBuffersAndStart = () => {
      if (buffersLoadedRef.current) {
        playWithRandomDelay();
      } else {
        // Check again in 100ms
        setTimeout(checkBuffersAndStart, 100);
      }
    };

    checkBuffersAndStart();

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
  }, [audioPaths, repeat_delay]); // Remove mute from dependencies as discussed earlier // ⚠️ don't include volume/globalVolume here to avoid restarting sounds

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
    gainNodeRef.current.gain.value =
      (volumeRef.current / 100) * globalVolumeRef.current * muteRef.current;
    pannerRef.current.pan.value = direction;
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
    mute,
  ]);

  // Shortcuts for expand/collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for 'E' key (expand)
      if (e.key === "E" || e.key === "e") {
        if (e.ctrlKey) {
          e.preventDefault();
          setExpanded(true);
        }
      }
      // Check for 'C' key (collapse)
      else if (e.key === "C" || e.key === "c") {
        if (e.ctrlKey) {
          e.preventDefault();
          setExpanded(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded, setExpanded]);

  return (
    <div
      aria-label={soundName + " sound"}
      className={`sm:w-40 w-full text-lg font-bold text-center bg-gray-950 text-gray-400 group flex flex-col flex-shrink-0  ${
        expanded ? "sm:h-full" : ""
      }`}
    >
      <div className="relative bg-black min-h-24 sm:min-h-38 group/image">
        <Image
          aria-label="toggle sound options on click"
          src={imagePath}
          alt={soundName}
          fill
          className={`relative object-cover hover:cursor-pointer ${
            mute === 0 ? "opacity-40" : ""
          }`}
          onClick={() => setExpanded(!expanded)}
        />
        {mute === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center hover:cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="text-gray-100 text-md">MUTED</span>
          </div>
        )}

        {/* Show "more options" or "less options" when image is hovered */}
        <div
          aria-label="toggle sound options on click"
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

        {/* Buttons visible only when image is hovered on pc*/}
        <div
          onMouseEnter={() => setHoverButton(true)}
          onMouseLeave={() => setHoverButton(false)}
          className={`absolute flex space-x-1 transition-opacity top-1 right-1 duration-100
    ${
      expanded
        ? "opacity-100"
        : "opacity-0 sm:opacity-0 hidden sm:flex group-hover/image:opacity-100"
    }
  `}
        >
          <button
            aria-label="mute sound button"
            onClick={handleMute}
            className="flex items-center justify-center w-8 h-8 text-gray-200 sm:w-6 sm:h-6 bg-black/50 text-md hover:bg-black/75 hover:cursor-pointer"
            title="Mute sound"
          >
            <VolumeX size={17} />
          </button>
          <button
            aria-label="copy sound button"
            onClick={handleCopy}
            className="flex items-center justify-center w-8 h-8 text-gray-200 sm:w-6 sm:h-6 bg-black/50 text-md hover:bg-black/75 hover:cursor-pointer"
            title="Copy sound"
          >
            <Copy size={14} />
          </button>
          <button
            aria-label="remove sound button"
            onClick={handleRemove}
            className="flex items-center justify-center w-8 h-8 text-gray-200 sm:w-6 sm:h-6 bg-red-800/50 sm:bg-black/50 text-md hover:bg-red-700/60 hover:cursor-pointer"
            title="Remove sound"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {!expanded && (
        <div className="relative px-0 mt-0 group/slider">
          <div aria-label="volume slider" className="relative h-5 sm:h-2.5">
            {/* Track background */}
            <div className="absolute inset-0 bg-emerald-800"></div>
            {/* Filled portion */}
            <div
              className="absolute inset-y-0 bg-emerald-400"
              style={{ width: `${volume}%` }}
            ></div>
            {/* Invisible but functional input */}
            <input
              aria-label="volume slider input"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (!currentAmbiance) return;
                const updatedSounds = currentAmbiance.ambiance_sounds.map(
                  (sound) =>
                    sound.id === id
                      ? {
                          ...sound,
                          volume: Number(e.target.value),
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
          {/* Triangle indicator - only shows on hover*/}
          <div
            className="absolute hidden mt-2 transition-opacity opacity-0 pointer-events-none sm:block duration-0 top-full group-hover/slider:opacity-100"
            style={{ left: `calc(${volume}% - 4px)` }}
          >
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-emerald-300"></div>
          </div>
        </div>
      )}

      {expanded && (
        <div
          aria-label="expanded options"
          className="flex flex-col justify-start flex-1 gap-0 px-3 pb-3 overflow-y-scroll border-t-0 border-gray-800 border-1 rounded-b-xs bg-gray-950"
        >
          <div aria-label="volume" className="">
            <div className="flex items-center justify-between h-5 mt-2 mb-0.5 font-bold">
              <span className="text-xs text-gray-300">Volume</span>
              <span className="text-xs text-gray-300">{volume}%</span>
            </div>
            <div className="">
              <div aria-label="volume slider" className="relative h-2">
                {/* Track background */}
                <div className="absolute inset-0 rounded-full bg-emerald-900"></div>
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 rounded-full bg-emerald-500"
                  style={{ width: `${volume}%` }}
                ></div>
                {/* Invisible but functional input */}
                <input
                  aria-label="volume slider input"
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    if (!currentAmbiance) return;
                    const updatedSounds = currentAmbiance.ambiance_sounds.map(
                      (sound) =>
                        sound.id === id
                          ? {
                              ...sound,
                              volume: Number(e.target.value),
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

          <div aria-label="direction" className="">
            <div className="flex items-center justify-between h-5 mt-2 mb-0.5">
              <span className="text-xs text-gray-300">Left / Right</span>
              <span className="text-xs text-gray-300">{direction}</span>
            </div>
            <div className="">
              <div aria-label="direction slider" className="relative h-2">
                {/* Track background */}
                <div className="absolute inset-0 rounded-full bg-stone-900"></div>

                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 rounded-full bg-stone-900"
                  style={{ width: `${((direction + 1) / 2) * 100}%` }}
                ></div>

                {/* Fake slider handle */}
                <div
                  className="absolute w-4 h-2 -translate-y-1/2 rounded-full bg-stone-400 top-1/2"
                  style={{
                    left: `calc(${((direction + 1) / 2) * 100}% - (${
                      ((direction + 1) / 2) * 100
                    }/100 * 16px))`,
                  }}
                ></div>

                {/* Transparent range slider with styled thumb */}
                <input
                  aria-label="direction slider input"
                  type="range"
                  min="-1"
                  max="1"
                  step="0.1"
                  value={direction}
                  onChange={(e) => {
                    setDirection(Number(e.target.value));
                    if (!currentAmbiance) return;
                    const updatedSounds = currentAmbiance.ambiance_sounds.map(
                      (sound) =>
                        sound.id === id
                          ? {
                              ...sound,
                              direction: Number(e.target.value),
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

          <div aria-label="speed" className="">
            <div className="flex items-center justify-between h-5 mt-2 mb-0.5">
              <span className="text-xs text-gray-300">Speed</span>
              <span className="text-xs text-gray-300">x{playbackRate}</span>
            </div>
            <div className="">
              <div aria-label="playbackRate slider" className="relative h-2">
                <div className="absolute inset-0 rounded-full bg-blue-950"></div>
                <div
                  className="absolute inset-y-0 bg-blue-400 rounded-full"
                  style={{ width: `${((playbackRate - 0.1) / 2.9) * 100}%` }}
                ></div>
                <input
                  aria-label="speed slider input"
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={playbackRate}
                  onChange={(e) => {
                    setPlaybackRate(Number(e.target.value));
                    if (!currentAmbiance) return;
                    const updatedSounds = currentAmbiance.ambiance_sounds.map(
                      (sound) =>
                        sound.id === id
                          ? {
                              ...sound,
                              speed: Number(e.target.value),
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

          <div aria-label="reverb" className="">
            <div className="flex items-center justify-between h-5 mt-2 mb-0.5">
              <span className="text-xs text-gray-300">Echo</span>
              <span className="text-xs text-gray-300">{reverbWet}%</span>
            </div>
            <div className="">
              <div aria-label="echo slider" className="relative h-2">
                {/* Track background */}
                <div className="absolute inset-0 rounded-full bg-orange-950"></div>
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 bg-orange-400 rounded-full"
                  style={{ width: `${reverbWet}%` }}
                ></div>
                {/* Invisible but functional input */}
                <input
                  aria-label="echo slider input"
                  type="range"
                  min="0"
                  max="100"
                  value={reverbWet}
                  onChange={(e) => {
                    setReverbWet(Number(e.target.value));
                    if (!currentAmbiance) return;
                    const updatedSounds = currentAmbiance.ambiance_sounds.map(
                      (sound) =>
                        sound.id === id
                          ? {
                              ...sound,
                              reverb: Number(e.target.value),
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
            <div className="flex items-center justify-between h-5 mt-2 mb-0.5">
              <span className="text-xs text-gray-300">Echo duration</span>
              <span className="text-xs text-gray-300">
                {reverbDecay.toFixed(1)}s
              </span>
            </div>
            <div className="">
              <div aria-label="echo duration slider" className="relative h-2">
                {/* Track background */}
                <div className="absolute inset-0 rounded-full bg-orange-950"></div>
                {/* Filled portion */}
                <div
                  className="absolute inset-y-0 bg-orange-400 rounded-full"
                  style={{ width: `${(reverbDecay / 10) * 100}%` }}
                ></div>
                {/* Invisible but functional input */}
                <input
                  aria-label="echo duration slider input"
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={reverbDecay}
                  onChange={(e) => {
                    setReverbDecay(Number(e.target.value));
                    if (!currentAmbiance) return;
                    const updatedSounds = currentAmbiance.ambiance_sounds.map(
                      (sound) =>
                        sound.id === id
                          ? {
                              ...sound,
                              reverb_duration: Number(e.target.value),
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
          {/* Equalizer */}
          <div className="">
            <div className="flex items-center justify-between h-5 mt-2 mb-0.5">
              <span className="text-xs text-gray-300">Low</span>
              <span className="text-xs text-gray-300">
                {" "}
                {Math.round(((lowGain + 50) / 50) * 100)}%
              </span>
            </div>
            <div className="">
              <div aria-label="low slider" className="relative h-2">
                <div className="absolute inset-0 rounded-full bg-rose-950"></div>
                <div
                  className="absolute inset-y-0 rounded-full bg-rose-400"
                  style={{ width: `${((lowGain + 50) / 50) * 100}%` }}
                ></div>
                <input
                  aria-label="low slider input"
                  type="range"
                  min={-50}
                  max={0}
                  value={lowGain}
                  onChange={(e) => {
                    setLowGain(Number(e.target.value));
                    if (!currentAmbiance) return;
                    const updatedSounds = currentAmbiance.ambiance_sounds.map(
                      (sound) =>
                        sound.id === id
                          ? {
                              ...sound,
                              low: Number(e.target.value),
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
            <div className="flex items-center justify-between h-5 mt-2 mb-0.5">
              <span className="text-xs text-gray-300">Mid</span>
              <span className="text-xs text-gray-300">
                {Math.round(((midGain + 50) / 50) * 100)}%
              </span>
            </div>
            <div className="">
              <div aria-label="mid slider" className="relative h-2">
                <div className="absolute inset-0 rounded-full bg-rose-950"></div>
                <div
                  className="absolute inset-y-0 rounded-full bg-rose-400"
                  style={{ width: `${((midGain + 50) / 50) * 100}%` }}
                ></div>
                <input
                  aria-label="mid slider input"
                  type="range"
                  min={-50}
                  max={0}
                  value={midGain}
                  onChange={(e) => {
                    setMidGain(Number(e.target.value));
                    if (!currentAmbiance) return;
                    const updatedSounds = currentAmbiance.ambiance_sounds.map(
                      (sound) =>
                        sound.id === id
                          ? {
                              ...sound,
                              mid: Number(e.target.value),
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
            <div className="flex items-center justify-between h-5 mt-2 mb-0.5">
              <span className="text-xs text-gray-300">High</span>
              <span className="text-xs text-gray-300">
                {Math.round(((highGain + 50) / 50) * 100)}%
              </span>
            </div>
            <div className="">
              <div aria-label="high slider" className="relative h-2">
                <div className="absolute inset-0 rounded-full bg-rose-950"></div>
                <div
                  className="absolute inset-y-0 rounded-full bg-rose-400"
                  style={{ width: `${((highGain + 50) / 50) * 100}%` }}
                ></div>
                <input
                  aria-label="high slider input"
                  type="range"
                  min={-50}
                  max={0}
                  value={highGain}
                  onChange={(e) => {
                    setHighGain(Number(e.target.value));
                    if (!currentAmbiance) return;
                    const updatedSounds = currentAmbiance.ambiance_sounds.map(
                      (sound) =>
                        sound.id === id
                          ? {
                              ...sound,
                              high: Number(e.target.value),
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
            aria-label="frequency cut"
            className="hidden mx-2 mt-0 border-2 rounded-xs border-gray-950 bg-gray-950"
          >
            <div className="flex items-center justify-between h-5 mt-1">
              <span className="text-xs text-gray-400">Low Cut</span>
              <span className="text-xs text-gray-400">
                {Math.round(((lowCutFreq - 20) / 1980) * 100)}%
              </span>
            </div>
            <div className="px-2 pb-1">
              <div
                aria-label="low cut frequency slider"
                className="relative h-1.5"
              >
                <div className="absolute inset-0 rounded-full bg-purple-950"></div>
                <div
                  className="absolute inset-y-0 bg-purple-400 rounded-full"
                  style={{ width: `${((lowCutFreq - 20) / 2000) * 100}%` }}
                ></div>
                <input
                  aria-label="low cut slider input"
                  type="range"
                  min="20"
                  max="2000"
                  step="10"
                  value={lowCutFreq}
                  onChange={(e) => {
                    setLowCutFreq(Number(e.target.value));
                    if (!currentAmbiance) return;
                    const updatedSounds = currentAmbiance.ambiance_sounds.map(
                      (sound) =>
                        sound.id === id
                          ? {
                              ...sound,
                              low_cut: Number(e.target.value),
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
            <div className="flex items-center justify-between h-5 mt-1">
              <span className="text-xs text-gray-400">High Cut</span>
              <span className="text-xs text-gray-400">
                {Math.round(((20000 - highCutFreq) / 19500) * 100)}%
              </span>
            </div>
            <div className="px-2 pb-2">
              <div
                aria-label="high cut frequency slider"
                className="relative h-1.5"
              >
                <div className="absolute inset-0 rounded-full bg-purple-950"></div>
                <div
                  className="absolute inset-y-0 bg-purple-400 rounded-full"
                  style={{ width: `${((20000 - highCutFreq) / 19500) * 100}%` }}
                ></div>
                <input
                  aria-label="high cut slider input"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(((20000 - highCutFreq) / 19500) * 100)}
                  onChange={(e) => {
                    setHighCutFreq(
                      20000 - (Number(e.target.value) / 100) * 19500
                    );
                    if (!currentAmbiance) return;
                    const updatedSounds = currentAmbiance.ambiance_sounds.map(
                      (sound) =>
                        sound.id === id
                          ? {
                              ...sound,
                              high_cut:
                                20000 - (Number(e.target.value) / 100) * 19500,
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
            <div aria-label="Repeat delay" className="w-full">
              <div className="flex items-center justify-between h-5 mt-2 mb-0.75">
                <span className="text-xs text-gray-300">Plays every</span>
                <span className="text-xs text-gray-300">
                  &#177; {((repeat_delay[0] + repeat_delay[1]) / 2).toFixed(1)}s
                </span>
              </div>
              <div className="w-full">
                <div className="flex items-center justify-center w-full text-xs">
                  <input
                    aria-label="repeat delay minimum input"
                    type="number"
                    min="0"
                    className=" px-2 py-1 w-[calc(50%-0.75rem)] bg-gray-800 rounded-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    aria-label="repeat delay maximum input"
                    type="number"
                    min="0"
                    className="w-[calc(50%-0.75rem)] px-2 py-1 bg-gray-800 rounded-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          <button
            aria-label="close options button"
            onClick={() => setExpanded(!expanded)}
            className="flex flex-col items-center justify-center py-0.5 pt-3.5 mt-3 text-gray-500 border-gray-800 border-t-1 bg-gray-950 sm:mt-auto justify-self-end-safe hover:cursor-pointer hover:text-gray-50 "
          >
            <ChevronUp className="w-4 h-4 mb-0.5" strokeWidth={4}></ChevronUp>
            {/* <span className="text-xs">Close</span> */}
          </button>
        </div>
      )}
    </div>
  );
}
