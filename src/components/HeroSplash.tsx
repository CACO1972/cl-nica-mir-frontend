import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Crosshair, Sparkles, Globe } from "lucide-react";
import logoHero from "@/assets/logo-clinica-miro-hero.svg";

/* ─── Session gate ─────────────────────────────────────────────────────────── */
const SESSION_KEY = "hero_splash_seen";
export const shouldShowHeroSplash = (): boolean => !sessionStorage.getItem(SESSION_KEY);
export const markHeroSplashSeen = (): void => sessionStorage.setItem(SESSION_KEY, "1");

/* ─── Easings ──────────────────────────────────────────────────────────────── */
const easeOutCubic: [number, number, number, number] = [0.33, 1, 0.68, 1];
const easeInOutQuart: [number, number, number, number] = [0.76, 0, 0.24, 1];

/* ─── Dot-mesh background ──────────────────────────────────────────────────── */
const DotMesh = ({ wowActive }: { wowActive: boolean }) => {
  const dots = useMemo(() => {
    const arr: { x: number; y: number; delay: number }[] = [];
    const cols = 28;
    const rows = 16;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        arr.push({
          x: (c / (cols - 1)) * 100,
          y: (r / (rows - 1)) * 100,
          delay: Math.random() * 0.5,
        });
      }
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle gradient breath */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 45%, hsl(var(--gold) / 0.04) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.03, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Dot grid */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {dots.map((d, i) => {
          // During "wow" phase, dots near center-bottom curve upward (smile)
          const dx = d.x - 50;
          const dy = d.y - 65;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const inSmile = dist < 25 && dy > -10 && dy < 12;
          const smileOffset = inSmile ? -Math.cos((dx / 25) * Math.PI) * 2.5 : 0;

          return (
            <motion.circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={0.18}
              className="fill-foreground/[0.07]"
              animate={
                wowActive
                  ? {
                      cy: [d.y, d.y + smileOffset, d.y],
                      fillOpacity: inSmile ? [0.07, 0.25, 0.07] : [0.07],
                    }
                  : { cy: d.y }
              }
              transition={
                wowActive
                  ? { duration: 0.8, delay: d.delay * 0.3, ease: easeOutCubic }
                  : { duration: 0 }
              }
            />
          );
        })}
      </svg>
    </div>
  );
};

/* ─── Chip component ───────────────────────────────────────────────────────── */
interface ChipData {
  icon: React.ReactNode;
  text: string;
}

const Chip = ({
  data,
  delay,
}: {
  data: ChipData;
  delay: number;
}) => (
  <motion.div
    className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-border/40 bg-background/60 backdrop-blur-sm text-[10px] sm:text-xs text-muted-foreground tracking-wide transition-all duration-200 hover:border-gold/40 group cursor-default"
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.35, ease: easeOutCubic }}
  >
    {/* Glow ring on enter */}
    <motion.span
      className="absolute inset-0 rounded-full"
      style={{ boxShadow: "0 0 12px 2px hsl(var(--gold) / 0.15)" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: delay + 0.15, duration: 0.25 }}
    />
    <span className="text-gold/70 group-hover:-translate-y-0.5 transition-transform duration-200 relative z-10">
      {data.icon}
    </span>
    <span className="relative z-10">{data.text}</span>
  </motion.div>
);

/* ─── Main HeroSplash ──────────────────────────────────────────────────────── */
interface HeroSplashProps {
  onComplete: () => void;
}

const HeroSplash = ({ onComplete }: HeroSplashProps) => {
  const { language } = useLanguage();
  const [phase, setPhase] = useState(0);
  // phases: 0=init, 1=kicker, 2=h1, 3=sub, 4=chips, 5=ctas, 6=wow, 7=exit

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Timeline ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 150),   // 0.15s — kicker
      setTimeout(() => setPhase(2), 450),   // 0.45s — h1
      setTimeout(() => setPhase(3), 1050),  // 1.05s — subtitle
      setTimeout(() => setPhase(4), 1550),  // 1.55s — chips
      setTimeout(() => setPhase(5), 2300),  // 2.30s — CTAs
      setTimeout(() => setPhase(6), 3100),  // 3.10s — wow moment
      setTimeout(() => setPhase(7), 4400),  // 4.40s — auto exit
      setTimeout(() => {
        markHeroSplashSeen();
        onComplete();
      }, 5500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    markHeroSplashSeen();
    onComplete();
  }, [onComplete]);

  const handlePrimary = useCallback(() => {
    markHeroSplashSeen();
    onComplete();
  }, [onComplete]);

  const handleSecondary = useCallback(() => {
    markHeroSplashSeen();
    // Navigate will happen after onComplete in parent via route
    onComplete();
    // Small delay to allow state update, then navigate
    setTimeout(() => {
      window.location.hash = "";
      window.location.pathname = "/regional";
    }, 100);
  }, [onComplete]);

  /* ── Copy ──────────────────────────────────────────────────────────────── */
  const kicker = language === "es" ? "NUEVO EN CLÍNICA MIRÓ" : "NEW AT CLÍNICA MIRÓ";

  const h1Parts =
    language === "es"
      ? { before: "Odontología ", keyword: "predictiva", after: ".\nAntes de decidir, entiende." }
      : { before: "Predictive ", keyword: "dentistry", after: ".\nBefore deciding, understand." };

  const subtitle =
    language === "es"
      ? "Predice, planifica y elige con claridad. Pre-evaluación a distancia para pacientes de otras regiones."
      : "Predict, plan and choose with clarity. Remote pre-evaluation for patients from other regions.";

  const chips: ChipData[] = [
    {
      icon: <Crosshair className="w-3.5 h-3.5" />,
      text:
        language === "es"
          ? "ImplantX: probabilidad de éxito en implantes"
          : "ImplantX: implant success probability",
    },
    {
      icon: <Sparkles className="w-3.5 h-3.5" />,
      text:
        language === "es"
          ? "Caries incipientes: sin inyección ni taladro* — Curodont"
          : "Early cavities: no injection, no drill* — Curodont",
    },
    {
      icon: <Globe className="w-3.5 h-3.5" />,
      text:
        language === "es"
          ? "Estética facial + dental: un solo análisis"
          : "Facial + dental aesthetics: one analysis",
    },
  ];

  const ctaPrimary = language === "es" ? "Ver las novedades" : "See what's new";
  const ctaSecondary =
    language === "es" ? "Quiero pre-evaluación a distancia" : "I want a remote pre-evaluation";
  const disclaimer =
    language === "es"
      ? "*Según diagnóstico. Predicción orientativa; no garantiza resultados."
      : "*Based on diagnosis. Predictive guidance; does not guarantee results.";

  const isExiting = phase >= 7;
  const wowActive = phase === 6;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background overflow-hidden cursor-pointer"
      onClick={handleSkip}
      initial={{ opacity: 1 }}
      animate={
        isExiting
          ? prefersReduced
            ? { opacity: 0 }
            : { opacity: 0, scale: 1.02 }
          : { opacity: 1 }
      }
      transition={{ duration: prefersReduced ? 0.4 : 1, ease: easeInOutQuart }}
    >
      {/* ── Dot mesh background ──────────────────────────────────────────── */}
      <DotMesh wowActive={wowActive} />

      {/* ── Top bar: logo + skip ─────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 sm:px-10 py-5 sm:py-6">
        <img
          src={logoHero}
          alt="Clínica Miró"
          className="h-8 sm:h-10 w-auto"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
          }}
          className="text-[11px] tracking-[0.25em] text-muted-foreground/60 hover:text-foreground transition-colors uppercase flex items-center gap-1"
        >
          {language === "es" ? "Saltar" : "Skip"} →
        </button>
      </div>

      {/* ── Center content block ─────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center px-6 sm:px-10"
        animate={
          isExiting
            ? prefersReduced
              ? { opacity: 0 }
              : { opacity: 0, y: -10 }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: prefersReduced ? 0.4 : 0.95, ease: easeInOutQuart }}
      >
        <div
          className="max-w-2xl w-full text-center flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Kicker ───────────────────────────────────────────────────── */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.span
                className="text-[10px] sm:text-xs tracking-[0.45em] text-gold/80 font-medium uppercase mb-4 sm:mb-5"
                initial={
                  prefersReduced
                    ? { opacity: 0 }
                    : { opacity: 0, filter: "blur(10px)", y: 8 }
                }
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 0.4, ease: easeOutCubic }}
              >
                {kicker}
              </motion.span>
            )}
          </AnimatePresence>

          {/* ── H1 ───────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.h1
                className="text-foreground mb-4 sm:mb-5 whitespace-pre-line"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "clamp(1.5rem, 5vw, 2.8rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                }}
                initial={
                  prefersReduced
                    ? { opacity: 0 }
                    : { opacity: 0, y: 18, letterSpacing: "0.06em" }
                }
                animate={{ opacity: 1, y: 0, letterSpacing: "-0.01em" }}
                transition={{ duration: 0.75, ease: easeOutCubic }}
              >
                {h1Parts.before}
                <span className="relative inline-block text-gold">
                  {h1Parts.keyword}
                  {/* Shine sweep on keyword */}
                  {!prefersReduced && (
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                      style={{ mixBlendMode: "overlay" }}
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ delay: 0.3, duration: 0.5, ease: "easeInOut" }}
                    />
                  )}
                </span>
                {h1Parts.after}
              </motion.h1>
            )}
          </AnimatePresence>

          {/* ── Subtitle (mask reveal) ───────────────────────────────────── */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div className="overflow-hidden mb-6 sm:mb-7 max-w-lg">
                <motion.p
                  className="text-muted-foreground text-sm sm:text-base leading-relaxed"
                  initial={
                    prefersReduced
                      ? { opacity: 0 }
                      : { opacity: 0, clipPath: "inset(0 100% 0 0)" }
                  }
                  animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                  transition={{ duration: 0.6, ease: easeOutCubic }}
                >
                  {subtitle}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Chips cascade ────────────────────────────────────────────── */}
          <AnimatePresence>
            {phase >= 4 && (
              <motion.div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-7 relative">
                {chips.map((chip, i) => (
                  <Chip
                    key={i}
                    data={chip}
                    delay={prefersReduced ? 0 : i * 0.12}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── CTAs ─────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {phase >= 5 && (
              <motion.div
                className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-3"
                initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: easeOutCubic }}
              >
                {/* Primary CTA */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrimary();
                  }}
                  className="group relative overflow-hidden px-6 py-2.5 sm:px-7 sm:py-3 bg-gold text-background text-xs sm:text-sm font-medium tracking-wide rounded-sm transition-all duration-200 hover:shadow-lg hover:shadow-gold/20"
                  animate={
                    !prefersReduced && phase === 5
                      ? { scale: [1, 1.02, 1] }
                      : {}
                  }
                  transition={{ delay: 0.3, duration: 0.35, ease: easeOutCubic }}
                >
                  {/* Diagonal shine on hover */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-200 pointer-events-none" />
                  <span className="relative z-10">{ctaPrimary}</span>
                </motion.button>

                {/* Secondary CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSecondary();
                  }}
                  className="px-6 py-2.5 sm:px-7 sm:py-3 border border-border/50 text-muted-foreground hover:text-foreground hover:border-gold/40 text-xs sm:text-sm tracking-wide rounded-sm transition-all duration-200"
                >
                  {ctaSecondary}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Disclaimer ───────────────────────────────────────────────── */}
          <AnimatePresence>
            {phase >= 5 && (
              <motion.p
                className="text-[9px] sm:text-[10px] text-muted-foreground/40 max-w-md leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {disclaimer}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeroSplash;
