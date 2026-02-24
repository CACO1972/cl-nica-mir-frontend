import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import logoHero from "@/assets/logo-clinica-miro-hero.svg";

interface HeroSplashProps {
  onComplete: () => void;
}

const SESSION_KEY = "hero_splash_seen";

export function shouldShowHeroSplash(): boolean {
  return !sessionStorage.getItem(SESSION_KEY);
}

export function markHeroSplashSeen(): void {
  sessionStorage.setItem(SESSION_KEY, "1");
}

// ─── Animated pulse ring ─────────────────────────────────────────────────────
const PulseRing = ({ delay, size }: { delay: number; size: number }) => (
  <motion.div
    className="absolute rounded-full border border-gold/20"
    style={{
      width: size,
      height: size,
      left: "50%",
      top: "50%",
      marginLeft: -size / 2,
      marginTop: -size / 2,
    }}
    initial={{ scale: 0.6, opacity: 0 }}
    animate={{ scale: [0.6, 1.2, 0.6], opacity: [0, 0.5, 0] }}
    transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

// ─── Floating gold particle ──────────────────────────────────────────────────
const GoldParticle = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-gold/40"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 0.7, 0], scale: [0, 1.5, 0], y: [0, -20, -40] }}
    transition={{ duration: 3.5, delay, repeat: Infinity, ease: "easeOut" }}
  />
);

// ─── Horizontal scan line ────────────────────────────────────────────────────
const SplashScanLine = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent"
    initial={{ top: "0%", opacity: 0 }}
    animate={{ top: ["0%", "100%"], opacity: [0, 0.6, 0] }}
    transition={{ duration: 3, delay, ease: "easeInOut" }}
  />
);

const HeroSplash = ({ onComplete }: HeroSplashProps) => {
  const { language } = useLanguage();
  const [phase, setPhase] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 15 + Math.random() * 70,
    y: 15 + Math.random() * 70,
    delay: Math.random() * 6,
  }));

  const messages =
    language === "es"
      ? [
          { text: "Clínica Miró", sub: "30 años de experiencia clínica" },
          { text: "Inteligencia artificial", sub: "Sumada a la experiencia humana" },
          { text: "Diagnóstico preciso", sub: "Decisiones compartidas contigo" },
          { text: "Tu sonrisa, nuestro compromiso", sub: "Con total transparencia" },
        ]
      : [
          { text: "Clínica Miró", sub: "30 years of clinical experience" },
          { text: "Artificial intelligence", sub: "Combined with human expertise" },
          { text: "Precise diagnosis", sub: "Decisions shared with you" },
          { text: "Your smile, our commitment", sub: "With full transparency" },
        ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 3000),
      setTimeout(() => setPhase(3), 6000),
      setTimeout(() => setPhase(4), 9000),
      setTimeout(() => setPhase(5), 12000),
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          markHeroSplashSeen();
          onComplete();
        }, 1200);
      }, 15000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      markHeroSplashSeen();
      onComplete();
    }, 800);
  }, [onComplete]);

  const currentMsg = phase >= 2 && phase <= 5 ? messages[phase - 2] : null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 1 }}
    >
      {/* Particles */}
      {particles.map((p) => (
        <GoldParticle key={p.id} x={p.x} y={p.y} delay={p.delay} />
      ))}

      {/* Scan lines */}
      <AnimatePresence>
        {phase >= 1 && !isExiting && (
          <>
            <SplashScanLine delay={0} />
            <SplashScanLine delay={2} />
          </>
        )}
      </AnimatePresence>

      {/* Pulse rings */}
      <PulseRing delay={0.5} size={200} />
      <PulseRing delay={1.5} size={320} />
      <PulseRing delay={2.5} size={440} />

      {/* Center content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        {/* Logo */}
        <motion.img
          src={logoHero}
          alt="Clínica Miró"
          className="h-20 sm:h-28 md:h-36 w-auto mb-10"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, scale: phase >= 1 ? 1 : 0.85 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Gold separator */}
        <motion.div
          className="w-24 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: phase >= 1 ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 1.2 }}
        />

        {/* Messages */}
        <div className="h-28 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {currentMsg && (
              <motion.div
                key={phase}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h2
                  className="text-foreground mb-3"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(1.8rem, 6vw, 4rem)",
                    fontWeight: 300,
                    lineHeight: 1.1,
                  }}
                >
                  {currentMsg.text}
                </h2>
                <motion.p
                  className="text-[11px] sm:text-xs text-gold-muted tracking-[0.3em] uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentMsg.sub}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <motion.div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
        >
          {[2, 3, 4, 5].map((p) => (
            <motion.div
              key={p}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                phase >= p ? "bg-gold" : "bg-muted-foreground/20"
              }`}
              animate={{ scale: phase === p ? 1.4 : 1 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Skip button */}
      <motion.button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 caption text-muted-foreground/40 hover:text-foreground transition-all duration-500 tracking-widest uppercase z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 0.6 }}
        whileHover={{ opacity: 1 }}
      >
        {language === "es" ? "Saltar" : "Skip"}
      </motion.button>

      {/* Bottom gradient line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isExiting ? 0 : 1 }}
        transition={{ duration: 1.5 }}
      />
    </motion.div>
  );
};

export default HeroSplash;