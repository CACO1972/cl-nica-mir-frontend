import { useState, useEffect, useRef, useCallback } from "react";

interface UseAutoplayAudioOptions {
  /** Audio source (imported asset path) */
  src: string;
  /** Whether to attempt autoplay immediately */
  autoplay?: boolean;
  /** Loop the audio */
  loop?: boolean;
  /** Volume 0-1 */
  volume?: number;
  /** Fade in duration in ms */
  fadeInMs?: number;
  /** Fade out duration in ms */
  fadeOutMs?: number;
  /** Callback when audio ends naturally */
  onEnded?: () => void;
}

export function useAutoplayAudio({
  src,
  autoplay = true,
  loop = false,
  volume = 1,
  fadeInMs = 0,
  fadeOutMs = 0,
  onEnded,
}: UseAutoplayAudioOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Create audio element
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = fadeInMs > 0 ? 0 : volume;
    audio.preload = "auto";
    audioRef.current = audio;

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      onEnded?.();
    });

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [src, loop]);

  const fadeIn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || fadeInMs <= 0) return;
    
    audio.volume = 0;
    const steps = 20;
    const stepTime = fadeInMs / steps;
    const stepVolume = volume / steps;
    let current = 0;

    fadeIntervalRef.current = setInterval(() => {
      current += stepVolume;
      if (current >= volume) {
        audio.volume = volume;
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume = current;
      }
    }, stepTime);
  }, [fadeInMs, volume]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      setIsPlaying(true);
      setBlocked(false);
      if (fadeInMs > 0) fadeIn();
    } catch {
      // Autoplay blocked by browser
      setBlocked(true);
      setIsPlaying(false);
    }
  }, [fadeIn, fadeInMs]);

  const fadeOut = useCallback((onComplete?: () => void) => {
    const audio = audioRef.current;
    if (!audio || fadeOutMs <= 0) {
      audio?.pause();
      setIsPlaying(false);
      onComplete?.();
      return;
    }

    const steps = 20;
    const stepTime = fadeOutMs / steps;
    const stepVolume = audio.volume / steps;

    fadeIntervalRef.current = setInterval(() => {
      const newVol = audio.volume - stepVolume;
      if (newVol <= 0) {
        audio.volume = 0;
        audio.pause();
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        setIsPlaying(false);
        onComplete?.();
      } else {
        audio.volume = newVol;
      }
    }, stepTime);
  }, [fadeOutMs]);

  const stop = useCallback(() => {
    fadeOut();
  }, [fadeOut]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  // Attempt autoplay
  useEffect(() => {
    if (autoplay) {
      play();
    }
  }, [autoplay]);

  return { isPlaying, blocked, play, stop, fadeOut, toggle, audioRef };
}
