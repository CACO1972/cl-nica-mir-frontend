import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PathTransitionProps {
  isVisible: boolean;
  lines: [string, string, string];
  onComplete: () => void;
}

const PathTransition = ({ isVisible, lines, onComplete }: PathTransitionProps) => {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent pointer-events-none"
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 2.8, ease: "linear" }}
          />

          {/* Corner brackets */}
          <div className="absolute top-10 left-10 w-8 h-8 border-t border-l border-gold/20" />
          <div className="absolute bottom-10 right-10 w-8 h-8 border-b border-r border-gold/20" />

          <div className="max-w-2xl text-center space-y-6">
            {/* Line 1 — question or tension */}
            <motion.p
              className="text-muted-foreground/60 text-sm sm:text-base leading-relaxed font-light"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {lines[0]}
            </motion.p>

            {/* Separator */}
            <motion.div
              className="w-16 h-px bg-gold/30 mx-auto"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            />

            {/* Line 2 — promise */}
            <motion.p
              className="text-foreground/80 text-sm sm:text-base leading-relaxed font-light"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {lines[1]}
            </motion.p>

            {/* Line 3 — payoff, serif italic */}
            <motion.p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
                fontWeight: 300,
                lineHeight: 1.2,
              }}
              className="text-gold/90 italic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              {lines[2]}
            </motion.p>
          </div>

          {/* Loading indicator */}
          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <motion.div
              className="w-24 h-px bg-gold/20"
            >
              <motion.div
                className="h-full bg-gold/60"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.8, duration: 0.9, ease: "linear" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PathTransition;
