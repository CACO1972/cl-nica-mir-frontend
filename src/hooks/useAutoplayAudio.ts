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
  // Guards against StrictMode double-mount and unmounted updates
  const mountedRef = useRef(false);
  const playedOnceRef = useRef(false);

  // Create audio element once
  useEffect(() => {
    mountedRef.current = true;

    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = fadeInMs > 0 ? 0 : volume;
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => {
      if (mountedRef.current) setIsPlaying(false);
      onEnded?.();
    };
    audio.addEventListener("ended", handleEnded);

    return () => {
      mountedRef.current = false;
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
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
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    audio.volume = 0;
    const steps = 20;
    const stepTime = fadeInMs / steps;
    const stepVolume = volume / steps;
    let current = 0;

    fadeIntervalRef.current = setInterval(() => {
      const a = audioRef.current;
      if (!a) { clearInterval(fadeIntervalRef.current!); return; }
      current += stepVolume;
      if (current >= volume) {
        a.volume = volume;
        clearInterval(fadeIntervalRef.current!);
        fadeIntervalRef.current = null;
      } else {
        a.volume = current;
      }
    }, stepTime);
  }, [fadeInMs, volume]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.ended) audio.currentTime = 0;

    try {
      await audio.play();
      if (mountedRef.current) {
        setIsPlaying(true);
        setBlocked(false);
        if (fadeInMs > 0) fadeIn();
      }
    } catch {
      if (mountedRef.current) {
        setBlocked(true);
        setIsPlaying(false);
      }
    }
  }, [fadeIn, fadeInMs]);

  const fadeOut = useCallback((onComplete?: () => void) => {
    const audio = audioRef.current;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    if (!audio || fadeOutMs <= 0) {
      audio?.pause();
      if (mountedRef.current) setIsPlaying(false);
      onComplete?.();
      return;
    }

    const steps = 20;
    const stepTime = fadeOutMs / steps;
    const stepVolume = audio.volume / steps;

    fadeIntervalRef.current = setInterval(() => {
      const a = audioRef.current;
      if (!a) { clearInterval(fadeIntervalRef.current!); return; }
      const newVol = a.volume - stepVolume;
      if (newVol <= 0) {
        a.volume = 0;
        a.pause();
        clearInterval(fadeIntervalRef.current!);
        fadeIntervalRef.current = null;
        if (mountedRef.current) setIsPlaying(false);
        onComplete?.();
      } else {
        a.volume = newVol;
      }
    }, stepTime);
  }, [fadeOutMs]);

  const stop = useCallback(() => fadeOut(), [fadeOut]);

  const toggle = useCallback(() => {
    if (isPlaying) stop();
    else play();
  }, [isPlaying, play, stop]);

  // Autoplay — guarded with playedOnceRef to prevent StrictMode double-fire
  useEffect(() => {
    if (autoplay && !playedOnceRef.current) {
      playedOnceRef.current = true;
      play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isPlaying, blocked, play, stop, fadeOut, toggle, audioRef };
}
