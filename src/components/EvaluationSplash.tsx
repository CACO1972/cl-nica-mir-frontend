import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface EvaluationSplashProps {
  onComplete: () => void;
}

/* ─── Cinematic crosshair ─────────────────────────────────────────────── */
const Crosshair = ({ phase }: { phase: number }) => (
  <motion.div
    className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: phase >= 1 ? 0.4 : 0 }}
    transition={{ duration: 1 }}
  >
    {/* Horizontal line */}
    <motion.div
      className="absolute h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      initial={{ width: 0 }}
      animate={{ width: phase >= 1 ? "80%" : 0 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    />
    {/* Vertical line */}
    <motion.div
      className="absolute w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent"
      initial={{ height: 0 }}
      animate={{ height: phase >= 1 ? "60%" : 0 }}
      transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    />
    {/* Center ring */}
    <motion.div
      className="absolute w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-gold/20"
      initial={{ scale: 2, opacity: 0 }}
      animate={{ scale: phase >= 1 ? 1 : 2, opacity: phase >= 1 ? 0.5 : 0 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
    />
    <motion.div
      className="absolute w-32 h-32 sm:w-44 sm:h-44 rounded-full border border-gold/10"
      initial={{ scale: 2.5, opacity: 0 }}
      animate={{ scale: phase >= 2 ? 1 : 2.5, opacity: phase >= 2 ? 0.3 : 0 }}
      transition={{ duration: 1.5, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
    />
  </motion.div>
);

/* ─── Data readout — clinical metrics ─────────────────────────────────── */
const DataReadout = ({ phase, language }: { phase: number; language: string }) => {
  const metrics = language === "es"
    ? ["Análisis facial", "Oclusión dental", "Tejido periodontal", "Planificación IA"]
    : ["Facial analysis", "Dental occlusion", "Periodontal tissue", "AI planning"];

  return (
    <motion.div
      className="absolute left-6 sm:left-12 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: phase >= 2 ? 0.6 : 0, x: phase >= 2 ? 0 : -20 }}
      transition={{ duration: 0.8 }}
    >
      {metrics.map((metric, i) => (
        <motion.div
          key={metric}
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: phase >= 2 + i * 0.5 ? 1 : 0, x: phase >= 2 ? 0 : -10 }}
          transition={{ delay: i * 0.3, duration: 0.5 }}
        >
          <motion.div
            className={`w-1.5 h-1.5 rounded-full ${
              phase >= 3 + i ? "bg-gold" : "bg-muted-foreground/30"
            }`}
            animate={phase >= 3 + i ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
          <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-muted-foreground font-mono uppercase whitespace-nowrap">
            {metric}
          </span>
          {phase >= 3 + i && (
            <motion.span
              className="text-[9px] text-gold/70 font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              ✓
            </motion.span>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

/* ─── Scanning sweep ──────────────────────────────────────────────────── */
const ScanSweep = ({ active }: { active: boolean }) => (
  <motion.div
    className="absolute inset-0 pointer-events-none z-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: active ? 1 : 0 }}
  >
    <motion.div
      className="absolute left-0 right-0 h-[3px]"
      style={{
        background: "linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.6) 30%, hsl(var(--gold) / 0.8) 50%, hsl(var(--gold) / 0.6) 70%, transparent 100%)",
        boxShadow: "0 0 20px hsl(var(--gold) / 0.3), 0 0 60px hsl(var(--gold) / 0.1)",
      }}
      animate={{ top: ["0%", "100%"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

const EvaluationSplash = ({ onComplete }: EvaluationSplashProps) => {
  const { language } = useLanguage();
  const [phase, setPhase] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const messages = {
    es: [
      { main: "ANALIZANDO", accent: "TU CASO", sub: "Inteligencia artificial aplicada" },
      { main: "DIAGNÓSTICO", accent: "PRECISO", sub: "Certeza antes de actuar" },
      { main: "RESULTADOS", accent: "PREDECIBLES", sub: "El futuro de tu sonrisa" },
    ],
    en: [
      { main: "ANALYZING", accent: "YOUR CASE", sub: "Applied artificial intelligence" },
      { main: "PRECISE", accent: "DIAGNOSIS", sub: "Certainty before action" },
      { main: "PREDICTABLE", accent: "RESULTS", sub: "The future of your smile" },
    ],
  };

  const currentMessages = messages[language as "es" | "en"] || messages.es;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),     // Crosshair appears
      setTimeout(() => setPhase(2), 1200),    // Data readout starts
      setTimeout(() => setPhase(3), 2800),    // First message
      setTimeout(() => setPhase(4), 5000),    // Second message
      setTimeout(() => setPhase(5), 7000),    // Third message
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 800);
      }, 9000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    setTimeout(onComplete, 600);
  }, [onComplete]);

  const currentMsgIndex = phase >= 5 ? 2 : phase >= 4 ? 1 : phase >= 3 ? 0 : -1;
  const currentMsg = currentMsgIndex >= 0 ? currentMessages[currentMsgIndex] : null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, hsl(var(--gold) / 0.04) 0%, transparent 60%)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 2 }}
      />

      {/* Crosshair targeting */}
      <Crosshair phase={phase} />

      {/* Scanning sweep */}
      <ScanSweep active={phase >= 2 && phase < 5 && !isExiting} />

      {/* Data readout — left side */}
      <DataReadout phase={phase} language={language} />

      {/* Corner brackets */}
      {[
        "top-6 left-6 border-t border-l",
        "top-6 right-6 border-t border-r",
        "bottom-16 left-6 border-b border-l",
        "bottom-16 right-6 border-b border-r",
      ].map((pos, i) => (
        <motion.div
          key={i}
          className={`absolute w-8 h-8 ${pos} border-gold/20 z-10`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: phase >= 1 ? 0.6 : 0, scale: phase >= 1 ? 1 : 0.5 }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
        />
      ))}

      {/* Center content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        {/* Messages — cinematic bold */}
        <div className="h-40 sm:h-48 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {currentMsg && (
              <motion.div
                key={currentMsgIndex}
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="overflow-hidden">
                  <motion.h2
                    className="text-foreground"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "clamp(2rem, 8vw, 5.5rem)",
                      fontWeight: 800,
                      lineHeight: 0.9,
                      letterSpacing: "-0.04em",
                    }}
                    initial={{ y: "120%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {currentMsg.main}
                  </motion.h2>
                </div>

                <div className="overflow-hidden mt-1">
                  <motion.h2
                    className="text-gold"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "clamp(2rem, 8vw, 5.5rem)",
                      fontWeight: 800,
                      lineHeight: 0.9,
                      letterSpacing: "-0.04em",
                    }}
                    initial={{ y: "120%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {currentMsg.accent}
                  </motion.h2>
                </div>

                <motion.p
                  className="text-[10px] sm:text-xs text-muted-foreground tracking-[0.4em] uppercase mt-5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {currentMsg.sub}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status indicator — top */}
      <motion.div
        className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: phase >= 2 && !isExiting ? 0.5 : 0, y: phase >= 2 ? 0 : -10 }}
        transition={{ duration: 0.6 }}
      >
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-gold"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[9px] tracking-[0.3em] text-muted-foreground font-mono uppercase">
          {language === "es" ? "IA · Procesando" : "AI · Processing"}
        </span>
      </motion.div>

      {/* Progress — bottom bar */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-20 h-[2px] bg-muted-foreground/10 rounded-full overflow-hidden z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 3 ? 1 : 0 }}
      >
        <motion.div
          className="h-full bg-gold/60 rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width: phase >= 5 ? "100%" : phase >= 4 ? "66%" : phase >= 3 ? "33%" : "0%",
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </motion.div>

      {/* Skip */}
      <motion.button
        onClick={handleSkip}
        className="absolute bottom-6 right-8 text-[10px] text-muted-foreground/30 hover:text-muted-foreground/70 transition-all duration-500 tracking-[0.3em] uppercase z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ delay: 1.5 }}
      >
        {language === "es" ? "Saltar" : "Skip"}
      </motion.button>
    </motion.div>
  );
};

export default EvaluationSplash;