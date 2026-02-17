import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface AudioToggleButtonProps {
  isPlaying: boolean;
  blocked: boolean;
  onToggle: () => void;
  onUnblock: () => void;
  className?: string;
  position?: "bottom-left" | "bottom-right" | "top-right";
}

const AudioToggleButton = ({
  isPlaying,
  blocked,
  onToggle,
  onUnblock,
  className = "",
  position = "bottom-left",
}: AudioToggleButtonProps) => {
  const positionClasses = {
    "bottom-left": "bottom-8 left-8",
    "bottom-right": "bottom-8 right-8",
    "top-right": "top-24 right-8",
  };

  return (
    <AnimatePresence>
      {blocked ? (
        <motion.button
          key="unblock"
          onClick={onUnblock}
          className={`fixed ${positionClasses[position]} z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 backdrop-blur-sm border border-gold-muted/20 hover:border-gold-muted/40 transition-all duration-500 group ${className}`}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Volume2 className="w-4 h-4 text-gold-muted group-hover:text-gold transition-colors" />
          <span className="caption text-muted-foreground group-hover:text-foreground transition-colors tracking-widest text-[10px]">
            SONIDO
          </span>
        </motion.button>
      ) : (
        <motion.button
          key="toggle"
          onClick={onToggle}
          className={`fixed ${positionClasses[position]} z-50 p-3 rounded-full bg-foreground/5 backdrop-blur-sm border border-border/30 hover:border-gold-muted/30 transition-all duration-500 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          whileHover={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {isPlaying ? (
            <Volume2 className="w-4 h-4 text-gold-muted" />
          ) : (
            <VolumeX className="w-4 h-4 text-muted-foreground" />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default AudioToggleButton;
