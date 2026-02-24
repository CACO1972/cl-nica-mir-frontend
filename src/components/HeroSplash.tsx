import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import logoDark from "@/assets/logomiro-dark.png";
import logoLight from "@/assets/logomiro-light.png";

/* ─── Session gate ─────────────────────────────────────────────────────────── */
const SESSION_KEY = "hero_splash_seen";
export const shouldShowHeroSplash = (): boolean => !sessionStorage.getItem(SESSION_KEY);
export const markHeroSplashSeen = (): void => sessionStorage.setItem(SESSION_KEY, "1");

/* ─── Easings ──────────────────────────────────────────────────────────────── */
const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeInOutQuart: [number, number, number, number] = [0.76, 0, 0.24, 1];

/* ─── Particle ring ────────────────────────────────────────────────────────── */
const PARTICLE_COUNT = 60;
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
  const radius = 38 + Math.random() * 8;
  return { angle, radius, size: 1 + Math.random() * 2, delay: Math.random() * 0.6 };
});

/* ─── Scanning lines ───────────────────────────────────────────────────────── */
const ScanLines = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[0.2, 0.35, 0.5, 0.65, 0.8].map((pos, i) => (
      <motion.div
        key={i}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent"
        style={{ top: `${pos * 100}%` }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 0.6, 0.6, 0] }}
        transition={{
          duration: 2.5,
          delay: 0.3 + i * 0.15,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

/* ─── Main HeroSplash ──────────────────────────────────────────────────────── */
interface HeroSplashProps {
  onComplete: () => void;
}

const HeroSplash = ({ onComplete }: HeroSplashProps) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [phase, setPhase] = useState(0);
  // 0=black, 1=ring expands, 2=logo reveal, 3=tagline, 4=flash+exit

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),    // ring starts
      setTimeout(() => setPhase(2), 1200),   // logo appears
      setTimeout(() => setPhase(3), 2400),   // tagline
      setTimeout(() => setPhase(4), 4200),   // exit flash
      setTimeout(() => {
        markHeroSplashSeen();
        onComplete();
      }, 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    markHeroSplashSeen();
    onComplete();
  }, [onComplete]);

  const isExiting = phase >= 4;
  const tagline = language === "es"
    ? "Odontología predictiva"
    : "Predictive dentistry";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-background overflow-hidden cursor-pointer flex items-center justify-center"
        onClick={handleSkip}
        initial={{ opacity: 1 }}
        animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: isExiting ? 0.9 : 0, ease: easeInOutQuart }}
      >
        {/* ── Scan lines ──────────────────────────────────────────────── */}
        <ScanLines />

        {/* ── Radial glow pulse ───────────────────────────────────────── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, hsl(var(--gold) / 0.08) 0%, transparent 60%)",
          }}
          animate={phase >= 1 ? { scale: [0.5, 1.3, 1], opacity: [0, 1, 0.4] } : {}}
          transition={{ duration: 2, ease: easeOutExpo }}
        />

        {/* ── Particle ring ───────────────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <svg viewBox="-50 -50 100 100" className="w-[70vmin] h-[70vmin] max-w-[500px] max-h-[500px]">
            {particles.map((p, i) => {
              const collapsed = phase < 1;
              const cx = collapsed ? 0 : Math.cos(p.angle) * p.radius;
              const cy = collapsed ? 0 : Math.sin(p.angle) * p.radius;
              return (
                <motion.circle
                  key={i}
                  r={p.size * 0.15}
                  className="fill-gold/60"
                  initial={{ cx: 0, cy: 0, opacity: 0 }}
                  animate={{
                    cx,
                    cy,
                    opacity: phase >= 1 ? [0, 0.8, 0.4] : 0,
                    scale: phase >= 2 ? [1, 1.5, 0.8] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: p.delay,
                    ease: easeOutExpo,
                  }}
                />
              );
            })}
            {/* Orbit ring */}
            <motion.circle
              r={38}
              fill="none"
              className="stroke-gold/15"
              strokeWidth={0.3}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={phase >= 1 ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 2, delay: 0.3, ease: easeOutExpo }}
            />
          </svg>
        </div>

        {/* ── Crosshair lines ─────────────────────────────────────────── */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Horizontal */}
          <motion.div
            className="absolute h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"
            style={{ width: "60vw", maxWidth: "500px" }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={phase >= 1 ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.5, ease: easeOutExpo }}
          />
          {/* Vertical */}
          <motion.div
            className="absolute w-px bg-gradient-to-b from-transparent via-gold/25 to-transparent"
            style={{ height: "60vh", maxHeight: "500px" }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={phase >= 1 ? { scaleY: 1, opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.6, ease: easeOutExpo }}
          />
        </div>

        {/* ── Center content ──────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
          {/* Logo — dramatic scale reveal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.3, filter: "blur(20px)" }}
            animate={
              phase >= 2
                ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, scale: 0.3, filter: "blur(20px)" }
            }
            transition={{ duration: 1.2, ease: easeOutExpo }}
          >
            <img
              src={theme === "dark" ? logoDark : logoLight}
              alt="Clínica Miró"
              className="h-20 sm:h-28 md:h-36 w-auto"
            />
            {/* Shine sweep across logo */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
              initial={{ x: "-120%" }}
              animate={phase >= 2 ? { x: "120%" } : {}}
              transition={{ delay: 0.8, duration: 0.6, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Tagline — minimal, powerful */}
          <motion.div
            className="mt-6 sm:mt-8 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={phase >= 3 ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              className="text-xs sm:text-sm tracking-[0.4em] text-gold/80 uppercase font-medium text-center"
              initial={{ y: 30, opacity: 0 }}
              animate={phase >= 3 ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: easeOutExpo }}
            >
              {tagline}
            </motion.p>
            {/* Underline sweep */}
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mt-3"
              initial={{ scaleX: 0 }}
              animate={phase >= 3 ? { scaleX: 1 } : {}}
              transition={{ delay: 0.4, duration: 0.8, ease: easeOutExpo }}
            />
          </motion.div>
        </div>

        {/* ── Flash on exit ───────────────────────────────────────────── */}
        <motion.div
          className="absolute inset-0 bg-gold/10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={isExiting ? { opacity: [0, 0.3, 0] } : {}}
          transition={{ duration: 0.6 }}
        />

        {/* ── Skip button ─────────────────────────────────────────────── */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="absolute bottom-8 right-8 text-[10px] tracking-[0.3em] text-muted-foreground/40 hover:text-muted-foreground transition-colors uppercase z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {language === "es" ? "Saltar" : "Skip"} →
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
};

export default HeroSplash;
