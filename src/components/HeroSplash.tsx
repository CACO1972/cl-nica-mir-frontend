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

/* ─── Cinematic wipe line ──────────────────────────────────────────────── */
const WipeLine = ({ direction = "horizontal" }: { direction?: "horizontal" | "vertical" }) => (
  <motion.div
    className={`absolute ${
      direction === "horizontal"
        ? "left-0 right-0 h-[2px]"
        : "top-0 bottom-0 w-[2px]"
    } bg-gradient-to-r from-transparent via-gold/60 to-transparent z-20`}
    initial={direction === "horizontal" ? { top: "-2px", opacity: 0 } : { left: "-2px", opacity: 0 }}
    animate={
      direction === "horizontal"
        ? { top: ["0%", "100%"], opacity: [0, 1, 1, 0] }
        : { left: ["0%", "100%"], opacity: [0, 1, 1, 0] }
    }
    transition={{ duration: 2.5, ease: [0.25, 0.1, 0.25, 1] }}
  />
);

/* ─── Corner bracket decoration ───────────────────────────────────────── */
const CornerBrackets = ({ visible }: { visible: boolean }) => (
  <>
    <motion.div
      className="absolute top-12 left-8 sm:top-16 sm:left-12 w-10 h-10 border-t border-l border-gold/30"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.7 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    />
    <motion.div
      className="absolute top-12 right-8 sm:top-16 sm:right-12 w-10 h-10 border-t border-r border-gold/30"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.7 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    />
    <motion.div
      className="absolute bottom-20 left-8 sm:bottom-24 sm:left-12 w-10 h-10 border-b border-l border-gold/30"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.7 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    />
    <motion.div
      className="absolute bottom-20 right-8 sm:bottom-24 sm:right-12 w-10 h-10 border-b border-r border-gold/30"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.7 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    />
  </>
);

/* ─── Horizontal reveal mask (cinematic letterbox open) ───────────────── */
const LetterboxReveal = ({ phase }: { phase: number }) => (
  <>
    <motion.div
      className="absolute top-0 left-0 right-0 bg-background z-30"
      initial={{ height: "50%" }}
      animate={{ height: phase >= 1 ? "0%" : "50%" }}
      transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
    />
    <motion.div
      className="absolute bottom-0 left-0 right-0 bg-background z-30"
      initial={{ height: "50%" }}
      animate={{ height: phase >= 1 ? "0%" : "50%" }}
      transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1] }}
    />
  </>
);

const HeroSplash = ({ onComplete }: HeroSplashProps) => {
  const { language } = useLanguage();
  const [phase, setPhase] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const messages =
    language === "es"
      ? [
          { main: "CARIES SIN", sub: "Tratamiento por infiltración · Sin fresa, sin anestesia", accent: "TALADRO" },
          { main: "ARMONÍA", sub: "Análisis integral de estética facial y dental con IA", accent: "FACIAL + DENTAL" },
          { main: "IMPLANTES", sub: "Evaluación predictiva a distancia · Desde cualquier región", accent: "A DISTANCIA" },
        ]
      : [
          { main: "CAVITIES", sub: "Infiltration treatment · No drill, no anesthesia", accent: "WITHOUT DRILLING" },
          { main: "FACIAL +", sub: "Integrated facial & dental aesthetics analysis with AI", accent: "DENTAL HARMONY" },
          { main: "REMOTE", sub: "Predictive evaluation from anywhere · Any region", accent: "IMPLANT PLANNING" },
        ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),     // Letterbox open
      setTimeout(() => setPhase(2), 1800),    // Logo + first message
      setTimeout(() => setPhase(3), 4500),    // Second message
      setTimeout(() => setPhase(4), 7200),    // Third message
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          markHeroSplashSeen();
          onComplete();
        }, 1000);
      }, 9500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      markHeroSplashSeen();
      onComplete();
    }, 600);
  }, [onComplete]);

  const currentMsgIndex =
    phase >= 4 ? 2 : phase >= 3 ? 1 : phase >= 2 ? 0 : -1;
  const currentMsg = currentMsgIndex >= 0 ? messages[currentMsgIndex] : null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Letterbox reveal */}
      <LetterboxReveal phase={phase} />

      {/* Wipe line on open */}
      {phase >= 1 && phase < 3 && <WipeLine direction="horizontal" />}

      {/* Corner brackets */}
      <CornerBrackets visible={phase >= 1 && !isExiting} />

      {/* Ambient gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: phase >= 1 ? 1 : 0, scale: phase >= 1 ? 1 : 0.5 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 0.04) 0%, transparent 70%)", filter: "blur(80px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        transition={{ duration: 3 }}
      />

      {/* Center content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        {/* Logo — appears with scale and blur */}
        <motion.img
          src={logoHero}
          alt="Clínica Miró"
          className="h-16 sm:h-24 md:h-32 w-auto mb-8"
          initial={{ opacity: 0, scale: 1.1, filter: "blur(12px)" }}
          animate={{
            opacity: phase >= 2 ? 1 : 0,
            scale: phase >= 2 ? 1 : 1.1,
            filter: phase >= 2 ? "blur(0px)" : "blur(12px)",
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Gold separator — expands cinematically */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-8"
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: phase >= 2 ? "clamp(120px, 30vw, 300px)" : 0,
            opacity: phase >= 2 ? 1 : 0,
          }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Messages — cinematic text reveal */}
        <div className="h-36 sm:h-44 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {currentMsg && (
              <motion.div
                key={currentMsgIndex}
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -30, filter: "blur(4px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Main text — bold cinematic */}
                <motion.h2
                  className="text-foreground mb-2 overflow-hidden"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "clamp(1.8rem, 7vw, 5rem)",
                    fontWeight: 800,
                    lineHeight: 0.95,
                    letterSpacing: "-0.03em",
                  }}
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {currentMsg.main}
                </motion.h2>

                {/* Accent word — gold */}
                {"accent" in currentMsg && currentMsg.accent && (
                  <motion.h2
                    className="text-gold mb-4"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "clamp(1.8rem, 7vw, 5rem)",
                      fontWeight: 800,
                      lineHeight: 0.95,
                      letterSpacing: "-0.03em",
                    }}
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {currentMsg.accent}
                  </motion.h2>
                )}

                {/* Subtitle */}
                <motion.p
                  className="text-[10px] sm:text-xs text-muted-foreground tracking-[0.4em] uppercase mt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.7, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {currentMsg.sub}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar — cinematic style */}
        <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-muted-foreground/10 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
        >
          <motion.div
            className="h-full bg-gold/60 rounded-full"
            initial={{ width: "0%" }}
            animate={{
              width:
                phase >= 4 ? "100%" : phase >= 3 ? "66%" : phase >= 2 ? "33%" : "0%",
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </motion.div>
      </div>

      {/* Status tag — top right */}
      <motion.div
        className="absolute top-6 right-8 sm:top-8 sm:right-12 flex items-center gap-2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 2 && !isExiting ? 0.5 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        <span className="text-[9px] tracking-[0.4em] text-muted-foreground font-mono uppercase">
          {language === "es" ? "Cargando experiencia" : "Loading experience"}
        </span>
      </motion.div>

      {/* Skip button */}
      <motion.button
        onClick={handleSkip}
        className="absolute bottom-6 right-8 sm:bottom-8 sm:right-12 text-[10px] text-muted-foreground/30 hover:text-muted-foreground/70 transition-all duration-500 tracking-[0.3em] uppercase z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ delay: 2 }}
      >
        {language === "es" ? "Saltar" : "Skip"}
      </motion.button>
    </motion.div>
  );
};

export default HeroSplash;