import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LogoMiro from "@/components/LogoMiro";

/* ─── Session gate ─────────────────────────────────────────────────────────── */
const SESSION_KEY = "hero_splash_seen";
export const shouldShowHeroSplash = (): boolean => !sessionStorage.getItem(SESSION_KEY);
export const markHeroSplashSeen = (): void => sessionStorage.setItem(SESSION_KEY, "1");

/* ─── Easings ──────────────────────────────────────────────────────────────── */
const expo: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ─── Orbital ring of particles ────────────────────────────────────────────── */
const PARTICLE_COUNT = 80;

const OrbitalRing = ({ phase }: { phase: number }) => {
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
      radius: 140 + Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      delay: Math.random() * 1.2,
      speed: 0.8 + Math.random() * 0.6,
    }));
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map((p, i) => {
        const x = Math.cos(p.angle) * p.radius;
        const y = Math.sin(p.angle) * p.radius * 0.45; // ellipse
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              background: `hsl(38, 60%, ${55 + Math.random() * 15}%)`,
              boxShadow: `0 0 ${p.size * 3}px hsl(38, 55%, 55% / 0.6)`,
            }}
            initial={{ opacity: 0, x, y, scale: 0 }}
            animate={
              phase >= 2
                ? {
                    opacity: [0, 0.9, 0.4],
                    x,
                    y,
                    scale: [0, 1.4, 1],
                  }
                : {}
            }
            transition={{
              duration: p.speed,
              delay: p.delay,
              ease: expo,
            }}
          />
        );
      })}

      {/* Rotating outer ring */}
      {phase >= 2 && (
        <motion.div
          className="absolute rounded-full border border-gold/20"
          style={{ width: 320, height: 144 }}
          initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{ opacity: [0, 0.5, 0.3], scale: 1, rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
};

/* ─── Convergent light beams ───────────────────────────────────────────────── */
const LightBeams = ({ phase }: { phase: number }) => {
  if (phase < 3) return null;
  const beams = [
    { angle: -30, delay: 0 },
    { angle: 0, delay: 0.1 },
    { angle: 30, delay: 0.2 },
    { angle: -15, delay: 0.15 },
    { angle: 15, delay: 0.05 },
    { angle: -45, delay: 0.25 },
    { angle: 45, delay: 0.3 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {beams.map((b, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: "2px",
            height: "100vh",
            background: `linear-gradient(to top, transparent 0%, hsl(38, 60%, 55% / 0.4) 40%, hsl(38, 60%, 55% / 0.1) 100%)`,
            transformOrigin: "bottom center",
            transform: `rotate(${b.angle}deg)`,
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: [0, 0.7, 0.2], scaleY: [0, 1, 1] }}
          transition={{ duration: 1.2, delay: b.delay, ease: expo }}
        />
      ))}
    </div>
  );
};

/* ─── Radial pulse ─────────────────────────────────────────────────────────── */
const RadialPulse = ({ phase }: { phase: number }) => {
  if (phase < 4) return null;
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            border: "1px solid hsl(38, 55%, 55% / 0.3)",
          }}
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={{
            width: [0, 600, 900],
            height: [0, 270, 405],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.4,
            ease: expo,
          }}
        />
      ))}
    </>
  );
};

/* ─── Center flash ─────────────────────────────────────────────────────────── */
const CenterFlash = ({ phase }: { phase: number }) => {
  if (phase < 5) return null;
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, hsl(38, 60%, 60% / 0.2) 0%, transparent 50%)",
      }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: [0, 1, 0], scale: [0.3, 2, 3] }}
      transition={{ duration: 1.5, ease: expo }}
    />
  );
};

/* ─── Main HeroSplash ──────────────────────────────────────────────────────── */
interface HeroSplashProps {
  onComplete: () => void;
}

const HeroSplash = ({ onComplete }: HeroSplashProps) => {
  const [phase, setPhase] = useState(0);
  // 0=mount, 1=logo, 2=particles, 3=beams, 4=pulse, 5=flash+text, 6=exit

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1400),
      setTimeout(() => setPhase(4), 2200),
      setTimeout(() => setPhase(5), 3000),
      setTimeout(() => setPhase(6), 4200),
      setTimeout(() => {
        markHeroSplashSeen();
        onComplete();
      }, 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    markHeroSplashSeen();
    onComplete();
  }, [onComplete]);

  const isExiting = phase >= 6;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.8, ease: expo }}
      >
        {/* Skip */}
        <motion.button
          onClick={handleSkip}
          className="absolute top-6 right-6 sm:top-8 sm:right-8 text-xs tracking-[0.2em] text-white/40 hover:text-white/80 transition-colors uppercase z-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          Skip →
        </motion.button>

        {/* ── Animation layers ─── */}
        <OrbitalRing phase={phase} />
        <LightBeams phase={phase} />
        <RadialPulse phase={phase} />
        <CenterFlash phase={phase} />

        {/* ── Center content ─── */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo — dramatic reveal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, filter: "blur(20px)" }}
            animate={
              phase >= 1
                ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                : {}
            }
            transition={{ duration: 1.2, ease: expo }}
          >
            <LogoMiro className="h-16 sm:h-20 w-auto" />

            {/* Shine sweep over logo */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
              initial={{ x: "-150%" }}
              animate={phase >= 1 ? { x: "150%" } : {}}
              transition={{ delay: 0.8, duration: 0.6, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Minimal tagline */}
          <motion.p
            className="mt-8 text-white/70 text-sm sm:text-base tracking-[0.35em] uppercase font-light"
            initial={{ opacity: 0, y: 12 }}
            animate={
              phase >= 5
                ? { opacity: 1, y: 0 }
                : {}
            }
            transition={{ duration: 0.6, ease: expo }}
          >
            Odontología predictiva
          </motion.p>
        </div>

        {/* ── Ambient floating particles (background) ─── */}
        {phase >= 1 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={`ambient-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 1 + Math.random() * 2,
                  height: 1 + Math.random() * 2,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: `hsl(38, 50%, 55% / ${0.1 + Math.random() * 0.2})`,
                }}
                animate={{
                  y: [0, -40, 0],
                  opacity: [0.1, 0.4, 0.1],
                }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default HeroSplash;
