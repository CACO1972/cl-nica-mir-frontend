import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import AudioToggleButton from "@/components/AudioToggleButton";
import { useAutoplayAudio } from "@/hooks/useAutoplayAudio";

interface CurodontTeaserProps {
  onComplete: () => void;
}

const SESSION_KEY = "curodont_teaser_seen";

const TIMELINE = [
  { id: "adult", duration: 4000, label: { es: "Caries no es el fin", en: "Cavities are not the end" }, sub: { es: "Es el inicio de algo nuevo", en: "It's the start of something new" } },
  { id: "child_peace", duration: 8000, label: { es: "Sin dolor, sin miedo", en: "No pain, no fear" }, sub: { es: "Odontología que regenera, no destruye", en: "Dentistry that regenerates, not destroys" } },
  { id: "curodont_tech", duration: 6000, label: { es: "Protocolo Suizo Curodont™", en: "Swiss Curodont™ Protocol" }, sub: { es: "Biomineralización guiada por péptidos", en: "Peptide-guided biomineralization" } },
  { id: "ai_scan", duration: 4000, label: { es: "IA + Experiencia Clínica", en: "AI + Clinical Experience" }, sub: { es: "Diagnóstico predictivo de precisión", en: "Precision predictive diagnosis" } },
  { id: "final_logo", duration: 3000, label: { es: "", en: "" }, sub: { es: "", en: "" } },
];

const TOTAL_DURATION = TIMELINE.reduce((sum, t) => sum + t.duration, 0);

// ─── Cinematic vignette overlay ──────────────────────────────────────────────
const CinematicVignette = () => (
  <div className="absolute inset-0 pointer-events-none z-10">
    <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/60" />
    <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
  </div>
);

// ─── Animated scan line ──────────────────────────────────────────────────────
const TeaserScanLine = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent z-20"
    initial={{ top: "0%", opacity: 0 }}
    animate={{ top: ["0%", "100%"], opacity: [0, 0.8, 0] }}
    transition={{ duration: 4, delay, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
  />
);

// ─── Progress bar ────────────────────────────────────────────────────────────
const ProgressBar = ({ elapsed, total }: { elapsed: number; total: number }) => (
  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted/20 z-30">
    <motion.div
      className="h-full bg-gold"
      initial={{ width: "0%" }}
      animate={{ width: `${Math.min((elapsed / total) * 100, 100)}%` }}
      transition={{ duration: 0.3, ease: "linear" }}
    />
  </div>
);

const CurodontTeaser = ({ onComplete }: CurodontTeaserProps) => {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Audio — placeholder path; replace with actual narration file
  const narrationAudio = useAutoplayAudio({
    src: "/assets/audio/locucion_caries_suiza.mp3",
    autoplay: true,
    fadeInMs: 1500,
    fadeOutMs: 800,
    volume: 0.7,
  });

  // Step progression
  useEffect(() => {
    if (step >= TIMELINE.length - 1 && !isExiting) {
      // Final step — wait its duration then exit
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
        narrationAudio.fadeOut();
        setTimeout(() => {
          sessionStorage.setItem(SESSION_KEY, "1");
          onComplete();
        }, 1000);
      }, TIMELINE[step].duration);
      return () => clearTimeout(exitTimer);
    }

    if (step < TIMELINE.length - 1) {
      const timer = setTimeout(() => setStep(step + 1), TIMELINE[step].duration);
      return () => clearTimeout(timer);
    }
  }, [step, isExiting, onComplete, narrationAudio]);

  // Elapsed time tracker for progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    narrationAudio.fadeOut();
    setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      onComplete();
    }, 800);
  }, [onComplete, narrationAudio]);

  const currentStep = TIMELINE[step];
  const isFinalStep = step === TIMELINE.length - 1;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 1 }}
    >
      {/* Video background — placeholder */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
          {/* 
            Replace this placeholder with actual video elements:
            <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover"
              src={`/assets/videos/regeneracion_step_${step}.mp4`} />
          */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background">
            {/* Placeholder visual — animated gold abstract shape */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.15 }}
              transition={{ duration: 2 }}
            >
              <div
                className="w-[60vmin] h-[60vmin] rounded-full"
                style={{
                  background: `radial-gradient(circle, hsla(var(--brand-h), 45%, 50%, 0.2) 0%, transparent 70%)`,
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Cinematic vignette */}
      <CinematicVignette />

      {/* Scan lines */}
      {!isFinalStep && !isExiting && (
        <>
          <TeaserScanLine delay={0} />
          <TeaserScanLine delay={3} />
        </>
      )}

      {/* Center content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {!isFinalStep && currentStep.label[language as "es" | "en"] && (
            <motion.div
              key={step}
              className="text-center max-w-3xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h2
                className="text-foreground mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(2rem, 7vw, 5rem)",
                  fontWeight: 300,
                  lineHeight: 1.1,
                }}
              >
                {currentStep.label[language as "es" | "en"]}
              </h2>
              <motion.p
                className="text-[11px] sm:text-xs text-gold-muted tracking-[0.3em] uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.5 }}
              >
                {currentStep.sub[language as "es" | "en"]}
              </motion.p>
            </motion.div>
          )}

          {/* Final step — CTA */}
          {isFinalStep && (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="space-y-3">
                <h2
                  className="text-foreground"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(2rem, 7vw, 4rem)",
                    fontWeight: 300,
                    lineHeight: 1.1,
                  }}
                >
                  {language === "es" ? (
                    <>Pioneros en <span className="text-gold">Regeneración</span></>
                  ) : (
                    <>Pioneers in <span className="text-gold">Regeneration</span></>
                  )}
                </h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground tracking-[0.3em] uppercase">
                  {language === "es" ? "Protocolo Suizo Curodont™" : "Swiss Curodont™ Protocol"}
                </p>
              </div>

              <motion.button
                onClick={handleSkip}
                className="px-12 py-5 border border-gold text-gold hover:bg-gold hover:text-background transition-all duration-500 uppercase tracking-[0.3em] text-[10px] font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {language === "es" ? "Iniciar Diagnóstico con IA" : "Start AI Diagnosis"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicators */}
        {!isFinalStep && (
          <motion.div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {TIMELINE.slice(0, -1).map((_, i) => (
              <motion.div
                key={i}
                className={`h-[2px] rounded-full transition-all duration-700 ${
                  step >= i ? "bg-gold w-6" : "bg-muted-foreground/20 w-3"
                }`}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Audio toggle */}
      <AudioToggleButton
        isPlaying={narrationAudio.isPlaying}
        blocked={narrationAudio.blocked}
        onToggle={narrationAudio.toggle}
        onUnblock={narrationAudio.play}
        position="bottom-left"
      />

      {/* Skip button — hidden on final step (CTA replaces it) */}
      {!isFinalStep && (
        <motion.button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 caption text-muted-foreground/40 hover:text-foreground transition-all duration-500 tracking-widest uppercase z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 0.6 }}
          whileHover={{ opacity: 1 }}
        >
          {language === "es" ? "Saltar" : "Skip"}
        </motion.button>
      )}

      {/* Progress bar */}
      <ProgressBar elapsed={elapsed} total={TOTAL_DURATION} />
    </motion.div>
  );
};

export default CurodontTeaser;
