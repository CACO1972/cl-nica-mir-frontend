import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Loader2, Square } from "lucide-react";

interface PathAudioButtonProps {
  text: string;
  voiceId?: string;
  className?: string;
}

/**
 * Small button that generates & plays ElevenLabs TTS narration for a path.
 * Calls the existing elevenlabs-tts edge function.
 */
const PathAudioButton = ({
  text,
  voiceId = "hOJRzgF2L32317WPwM2t",
  className = "",
}: PathAudioButtonProps) => {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState("idle");
  }, []);

  const play = useCallback(async () => {
    // If already have blob, replay
    if (blobUrlRef.current) {
      const audio = new Audio(blobUrlRef.current);
      audioRef.current = audio;
      audio.onended = () => setState("idle");
      setState("playing");
      await audio.play();
      return;
    }

    setState("loading");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, voiceId }),
        }
      );

      if (!response.ok) throw new Error(`TTS error: ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setState("idle");
      setState("playing");
      await audio.play();
    } catch (err) {
      console.error("PathAudioButton TTS error:", err);
      setState("idle");
    }
  }, [text, voiceId]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (state === "playing") stop();
      else if (state === "idle") play();
    },
    [state, play, stop]
  );

  return (
    <motion.button
      onClick={handleClick}
      className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
        state === "playing"
          ? "border-gold/60 bg-gold/10"
          : "border-border/40 hover:border-gold/40 bg-foreground/5 hover:bg-gold/5"
      } ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title={state === "playing" ? "Detener" : "Escuchar"}
    >
      <AnimatePresence mode="wait">
        {state === "loading" ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="w-3.5 h-3.5 text-gold animate-spin" />
          </motion.div>
        ) : state === "playing" ? (
          <motion.div
            key="stop"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Square className="w-3 h-3 text-gold fill-gold" />
          </motion.div>
        ) : (
          <motion.div
            key="play"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Volume2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-gold transition-colors" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse ring when playing */}
      {state === "playing" && (
        <motion.div
          className="absolute inset-0 rounded-full border border-gold/30"
          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.button>
  );
};

export default PathAudioButton;
