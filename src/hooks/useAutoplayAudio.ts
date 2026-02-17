import { useState, useEffect, useRef, useCallback } from "react";

interface UseAutoplayAudioOptions {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  volume?: number;
  fadeInMs?: number;
  fadeOutMs?: number;
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
  // Prevent double-play from StrictMode double-mount
  const hasAttemptedAutoplay = useRef(false);
  const isUnmounted = useRef(false);

  const clearFade = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  // Create audio element once
  useEffect(() => {
    isUnmounted.current = false;

    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = fadeInMs > 0 ? 0 : volume;
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => {
      if (!isUnmounted.current) {
        setIsPlaying(false);
        onEnded?.();
      }
    };
    audio.addEventListener("ended", handleEnded);

    return () => {
      isUnmounted.current = true;
      clearFade();
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const fadeIn = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || fadeInMs <= 0) return;
    clearFade();

    audio.volume = 0;
    const steps = 20;
    const stepTime = fadeInMs / steps;
    const stepVolume = volume / steps;
    let current = 0;

    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) { clearFade(); return; }
      current += stepVolume;
      if (current >= volume) {
        audioRef.current.volume = volume;
        clearFade();
      } else {
        audioRef.current.volume = current;
      }
    }, stepTime);
  }, [fadeInMs, volume, clearFade]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset to beginning if ended
    if (audio.ended) {
      audio.currentTime = 0;
    }

    try {
      await audio.play();
      if (!isUnmounted.current) {
        setIsPlaying(true);
        setBlocked(false);
        if (fadeInMs > 0) fadeIn();
      }
    } catch {
      if (!isUnmounted.current) {
        setBlocked(true);
        setIsPlaying(false);
      }
    }
  }, [fadeIn, fadeInMs]);

  const fadeOut = useCallback((onComplete?: () => void) => {
    const audio = audioRef.current;
    clearFade();

    if (!audio || fadeOutMs <= 0) {
      audio?.pause();
      if (!isUnmounted.current) setIsPlaying(false);
      onComplete?.();
      return;
    }

    const steps = 20;
    const stepTime = fadeOutMs / steps;
    const startVol = audio.volume;
    const stepVolume = startVol / steps;

    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) { clearFade(); return; }
      const newVol = audioRef.current.volume - stepVolume;
      if (newVol <= 0) {
        audioRef.current.volume = 0;
        audioRef.current.pause();
        clearFade();
        if (!isUnmounted.current) setIsPlaying(false);
        onComplete?.();
      } else {
        audioRef.current.volume = newVol;
      }
    }, stepTime);
  }, [fadeOutMs, clearFade]);

  const stop = useCallback(() => fadeOut(), [fadeOut]);

  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else play();
  }, [isPlaying, play, stop]);

  // Attempt autoplay — only once, guarded against StrictMode double-mount
  useEffect(() => {
    if (autoplay && !hasAttemptedAutoplay.current) {
      hasAttemptedAutoplay.current = true;
      play();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isPlaying, blocked, play, stop, fadeOut, toggle, audioRef };
}
