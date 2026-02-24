import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowRight } from "lucide-react";
import LogoMiro from "@/components/LogoMiro";

/* ─── Session gate ─────────────────────────────────────────────────────────── */
const SESSION_KEY = "hero_splash_seen";
export const shouldShowHeroSplash = (): boolean => !sessionStorage.getItem(SESSION_KEY);
export const markHeroSplashSeen = (): void => sessionStorage.setItem(SESSION_KEY, "1");

/* ─── Easings ──────────────────────────────────────────────────────────────── */
const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ─── Dot mesh background ──────────────────────────────────────────────────── */
const DOT_COLS = 18;
const DOT_ROWS = 12;

const DotMesh = ({ phase }: { phase: number }) => {
  const dots = useMemo(() => {
    const arr: { x: number; y: number; delay: number }[] = [];
    for (let r = 0; r < DOT_ROWS; r++) {
      for (let c = 0; c < DOT_COLS; c++) {
        arr.push({
          x: (c / (DOT_COLS - 1)) * 100,
          y: (r / (DOT_ROWS - 1)) * 100,
          delay: Math.random() * 0.8,
        });
      }
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute w-[2px] h-[2px] rounded-full bg-gold/20"
          style={{ left: `${d.x}%`, top: `${d.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            phase >= 1
              ? {
                  opacity: [0, 0.6, 0.25],
                  scale: [0, 1.2, 1],
                }
              : {}
          }
          transition={{
            duration: 1.6,
            delay: d.delay,
            ease: easeOutExpo,
          }}
        />
      ))}
    </div>
  );
};

/* ─── Breathing radial glow ────────────────────────────────────────────────── */
const RadialGlow = ({ phase }: { phase: number }) => (
  <motion.div
    className="absolute inset-0 pointer-events-none"
    style={{
      background:
        "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(var(--gold) / 0.06) 0%, transparent 70%)",
    }}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={phase >= 1 ? { opacity: [0, 1, 0.5], scale: [0.8, 1.15, 1] } : {}}
    transition={{ duration: 2.5, ease: easeOutExpo }}
  />
);

/* ─── Chip component ───────────────────────────────────────────────────────── */
const Chip = ({
  text,
  delay,
  phase,
}: {
  text: string;
  delay: number;
  phase: number;
}) => (
  <motion.div
    className="px-4 py-2 border border-gold/20 bg-gold/5 text-foreground text-sm sm:text-base font-medium tracking-wide"
    initial={{ opacity: 0, scale: 0.98, y: 8 }}
    animate={
      phase >= 4
        ? { opacity: 1, scale: 1, y: 0 }
        : { opacity: 0, scale: 0.98, y: 8 }
    }
    transition={{ duration: 0.5, delay, ease: easeOutExpo }}
  >
    {text}
  </motion.div>
);

/* ─── Main HeroSplash ──────────────────────────────────────────────────────── */
interface HeroSplashProps {
  onComplete: () => void;
}

const HeroSplash = ({ onComplete }: HeroSplashProps) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [phase, setPhase] = useState(0);
  // 0=mount, 1=mesh breathe, 2=kicker, 3=H1, 4=sub+chips, 5=CTAs, 6=wow, 7=exit

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 100),    // mesh + glow
      setTimeout(() => setPhase(2), 300),    // kicker
      setTimeout(() => setPhase(3), 700),    // H1
      setTimeout(() => setPhase(4), 1500),   // sub + chips
      setTimeout(() => setPhase(5), 2600),   // CTAs
      setTimeout(() => setPhase(6), 3400),   // wow moment
      setTimeout(() => setPhase(7), 5000),   // exit
      setTimeout(() => {
        markHeroSplashSeen();
        onComplete();
      }, 5800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    markHeroSplashSeen();
    onComplete();
  }, [onComplete]);

  const handleEnter = useCallback(() => {
    markHeroSplashSeen();
    onComplete();
  }, [onComplete]);

  const isExiting = phase >= 7;

  const chips =
    language === "es"
      ? [
          "ImplantX: probabilidad de éxito en implantes",
          "Caries incipientes: sin inyección ni taladro",
          "Estética facial + dental: un solo análisis",
        ]
      : [
          "ImplantX: implant success probability",
          "Early cavities: no injection, no drill",
          "Facial + dental aesthetics: one analysis",
        ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-background overflow-hidden flex flex-col items-center justify-center"
        initial={{ opacity: 1 }}
        animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.8, ease: easeOutExpo }}
      >
        {/* Background layers */}
        <DotMesh phase={phase} />
        <RadialGlow phase={phase} />

        {/* Skip — always visible */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="absolute top-6 right-6 sm:top-8 sm:right-8 text-sm tracking-[0.15em] text-muted-foreground/60 hover:text-muted-foreground transition-colors uppercase z-20 min-h-[44px] min-w-[44px] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {language === "es" ? "Saltar" : "Skip"} →
        </motion.button>

        {/* Logo — top left */}
        <motion.div
          className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <LogoMiro className="h-10 sm:h-12 w-auto" />
        </motion.div>

        {/* ── Center content ──────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto px-6 sm:px-8 text-center">
          {/* Kicker */}
          <motion.span
            className="text-xs sm:text-sm tracking-[0.3em] text-gold uppercase font-semibold mb-6 sm:mb-8"
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={
              phase >= 2
                ? { opacity: 1, filter: "blur(0px)" }
                : { opacity: 0, filter: "blur(8px)" }
            }
            transition={{ duration: 0.5, ease: easeOutExpo }}
          >
            {language === "es" ? "NUEVO EN CLÍNICA MIRÓ" : "NEW AT CLÍNICA MIRÓ"}
          </motion.span>

          {/* H1 */}
          <motion.h1
            className="text-foreground leading-[1.05] mb-4 sm:mb-6"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(2rem, 7vw, 4.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={
              phase >= 3
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
            }
            transition={{ duration: 0.8, ease: easeOutExpo }}
          >
            {language === "es" ? (
              <>
                Odontología{" "}
                <motion.span
                  className="text-gold relative inline-block"
                  initial={{}}
                  animate={phase >= 3 ? {} : {}}
                >
                  predictiva.
                  {/* Micro-shine */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                    initial={{ x: "-120%" }}
                    animate={phase >= 3 ? { x: "120%" } : {}}
                    transition={{ delay: 0.6, duration: 0.5, ease: "easeInOut" }}
                  />
                </motion.span>
                <br />
                Antes de decidir, entiende.
              </>
            ) : (
              <>
                Predictive{" "}
                <span className="text-gold">dentistry.</span>
                <br />
                Understand before you decide.
              </>
            )}
          </motion.h1>

          {/* Subtitle — mask reveal */}
          <motion.p
            className="text-muted-foreground max-w-xl mx-auto mb-8 sm:mb-10"
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              fontStyle: "italic",
              lineHeight: 1.6,
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={
              phase >= 4
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 12 }
            }
            transition={{ duration: 0.6, ease: easeOutExpo }}
          >
            {language === "es"
              ? "Pre-evaluación a distancia para pacientes de otras regiones. Diagnóstico claro, opciones transparentes."
              : "Remote pre-evaluation for patients from other regions. Clear diagnosis, transparent options."}
          </motion.p>

          {/* Chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 sm:mb-12">
            {chips.map((chip, i) => (
              <Chip key={i} text={chip} delay={i * 0.12} phase={phase} />
            ))}
          </div>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={
              phase >= 5
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 16 }
            }
            transition={{ duration: 0.6, ease: easeOutExpo }}
          >
            <motion.button
              onClick={handleEnter}
              className="group flex items-center justify-center gap-3 px-8 py-4 min-h-[48px] bg-foreground text-background font-semibold text-base tracking-[0.1em] uppercase hover:bg-gold hover:text-background transition-all duration-300 w-full sm:w-auto"
              whileHover={{ y: -2, boxShadow: "0 8px 24px hsl(var(--gold) / 0.25)" }}
              whileTap={{ scale: 0.98 }}
            >
              {language === "es" ? "Ver novedades" : "See what's new"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              onClick={() => {
                markHeroSplashSeen();
                window.location.href = "/regional";
              }}
              className="flex items-center justify-center gap-3 px-8 py-4 min-h-[48px] border border-gold/40 text-gold font-semibold text-base tracking-[0.1em] uppercase hover:bg-gold/10 transition-all duration-300 w-full sm:w-auto"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {language === "es"
                ? "Pre-evaluación a distancia"
                : "Remote pre-evaluation"}
            </motion.button>
          </motion.div>

          {/* Disclaimer */}
          <motion.p
            className="mt-6 text-xs text-muted-foreground/50 max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={phase >= 5 ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {language === "es"
              ? "Según diagnóstico. Predicción orientativa; no garantiza resultados."
              : "Based on diagnosis. Predictive guidance; does not guarantee results."}
          </motion.p>
        </div>

        {/* ── Wow moment — converging lines ──────────────────────────── */}
        {phase >= 6 && (
          <>
            {[0, 1, 2, 3].map((i) => {
              const angles = [45, 135, 225, 315];
              const rad = (angles[i] * Math.PI) / 180;
              const x1 = 50 + Math.cos(rad) * 60;
              const y1 = 50 + Math.sin(rad) * 60;
              return (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${x1}%`,
                    top: `${y1}%`,
                    width: "1px",
                    height: "120px",
                    background: `linear-gradient(to bottom, transparent, hsl(var(--gold) / 0.3), transparent)`,
                    transformOrigin: "center",
                    transform: `rotate(${angles[i] + 90}deg)`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 1.5] }}
                  transition={{ duration: 1.2, ease: easeOutExpo }}
                />
              );
            })}
            {/* Center flash */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, hsl(var(--gold) / 0.12) 0%, transparent 40%)",
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
              transition={{ duration: 1, ease: easeOutExpo }}
            />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default HeroSplash;
