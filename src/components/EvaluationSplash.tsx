import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface EvaluationSplashProps {
  onComplete: () => void;
}

// Particle component for background effect
const Particle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-gold-muted/30"
    style={{ left: `${x}%`, top: `${y}%` }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 0.6, 0],
      scale: [0, 1.5, 0],
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

// Scanning line component
const ScanLine = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-muted to-transparent"
    initial={{ top: "0%", opacity: 0 }}
    animate={{ 
      top: ["0%", "100%"],
      opacity: [0, 0.8, 0]
    }}
    transition={{
      duration: 2.5,
      delay,
      ease: "easeInOut"
    }}
  />
);

// Neural connection line
const NeuralLine = ({ x1, y1, x2, y2, delay }: { x1: number; y1: number; x2: number; y2: number; delay: number }) => (
  <motion.line
    x1={`${x1}%`}
    y1={`${y1}%`}
    x2={`${x2}%`}
    y2={`${y2}%`}
    stroke="hsl(var(--gold-muted))"
    strokeWidth="0.5"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: [0, 0.4, 0.4, 0] }}
    transition={{ duration: 2, delay, ease: "easeOut" }}
  />
);

// Neural node
const NeuralNode = ({ x, y, delay, size = 4 }: { x: number; y: number; delay: number; size?: number }) => (
  <motion.circle
    cx={`${x}%`}
    cy={`${y}%`}
    r={size}
    fill="hsl(var(--gold-muted))"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1.2, 1],
      opacity: [0, 0.8, 0.6, 0]
    }}
    transition={{ duration: 2.5, delay, ease: "easeOut" }}
  />
);

// Stylized tooth SVG with AI scanning effect
const ToothVisualization = ({ phase }: { phase: number }) => (
  <motion.div 
    className="relative w-64 h-64 md:w-80 md:h-80"
    initial={{ opacity: 0 }}
    animate={{ opacity: phase >= 1 ? 1 : 0 }}
    transition={{ duration: 1 }}
  >
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Neural network background */}
      <g className="neural-network">
        <NeuralNode x={20} y={30} delay={0.5} size={3} />
        <NeuralNode x={80} y={20} delay={0.7} size={2} />
        <NeuralNode x={50} y={50} delay={0.9} size={4} />
        <NeuralNode x={30} y={70} delay={1.1} size={2} />
        <NeuralNode x={70} y={80} delay={1.3} size={3} />
        <NeuralNode x={85} y={60} delay={1.5} size={2} />
        <NeuralNode x={15} y={85} delay={1.7} size={2} />
        
        <NeuralLine x1={20} y1={30} x2={50} y2={50} delay={0.8} />
        <NeuralLine x1={80} y1={20} x2={50} y2={50} delay={1.0} />
        <NeuralLine x1={50} y1={50} x2={30} y2={70} delay={1.2} />
        <NeuralLine x1={50} y1={50} x2={70} y2={80} delay={1.4} />
        <NeuralLine x1={50} y1={50} x2={85} y2={60} delay={1.6} />
        <NeuralLine x1={30} y1={70} x2={15} y2={85} delay={1.8} />
      </g>

      {/* Stylized tooth outline */}
      <motion.path
        d="M100 25
           C120 25 135 35 140 55
           C145 75 145 95 140 115
           C135 135 125 155 115 175
           C110 185 105 190 100 190
           C95 190 90 185 85 175
           C75 155 65 135 60 115
           C55 95 55 75 60 55
           C65 35 80 25 100 25Z"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="1"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: phase >= 1 ? 1 : 0,
          opacity: phase >= 1 ? 0.3 : 0
        }}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
      />

      {/* AI scan overlay on tooth */}
      <motion.path
        d="M100 35
           C115 35 125 42 130 58
           C134 74 134 90 130 106
           C126 122 118 140 110 158
           C106 166 103 170 100 170
           C97 170 94 166 90 158
           C82 140 74 122 70 106
           C66 90 66 74 70 58
           C75 42 85 35 100 35Z"
        fill="url(#scanGradient)"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: phase >= 2 ? [0, 0.6, 0.3] : 0
        }}
        transition={{ duration: 1.5, delay: 0.3 }}
      />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--gold-muted))" stopOpacity="0.1" />
          <stop offset="50%" stopColor="hsl(var(--gold-muted))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(var(--gold-muted))" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="pulseGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--gold-muted))" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(var(--gold-muted))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Pulsing center point */}
      <motion.circle
        cx="100"
        cy="100"
        r="8"
        fill="url(#pulseGradient)"
        initial={{ scale: 0 }}
        animate={{ 
          scale: phase >= 2 ? [1, 1.5, 1] : 0,
          opacity: phase >= 2 ? [0.8, 0.4, 0.8] : 0
        }}
        transition={{ 
          duration: 2,
          repeat: phase >= 2 ? Infinity : 0,
          ease: "easeInOut"
        }}
      />

      {/* Data points appearing */}
      {phase >= 2 && (
        <>
          <motion.circle cx="85" cy="60" r="2" fill="hsl(var(--gold-muted))"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} />
          <motion.circle cx="115" cy="65" r="2" fill="hsl(var(--gold-muted))"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} />
          <motion.circle cx="100" cy="85" r="2" fill="hsl(var(--gold-muted))"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} />
          <motion.circle cx="90" cy="110" r="2" fill="hsl(var(--gold-muted))"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} />
          <motion.circle cx="110" cy={115} r="2" fill="hsl(var(--gold-muted))"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0 }} />
        </>
      )}
    </svg>

    {/* Rotating ring effect */}
    <motion.div
      className="absolute inset-0 border border-gold-muted/20 rounded-full"
      initial={{ scale: 0.8, opacity: 0, rotate: 0 }}
      animate={{ 
        scale: phase >= 1 ? 1.2 : 0.8,
        opacity: phase >= 1 ? [0, 0.5, 0.3] : 0,
        rotate: 360
      }}
      transition={{ 
        scale: { duration: 2 },
        opacity: { duration: 2 },
        rotate: { duration: 20, repeat: Infinity, ease: "linear" }
      }}
    />

    {/* Second rotating ring */}
    <motion.div
      className="absolute inset-4 border border-gold-muted/10 rounded-full"
      initial={{ scale: 0.9, opacity: 0, rotate: 0 }}
      animate={{ 
        scale: phase >= 1 ? 1.1 : 0.9,
        opacity: phase >= 1 ? 0.4 : 0,
        rotate: -360
      }}
      transition={{ 
        scale: { duration: 2.5 },
        opacity: { duration: 2.5 },
        rotate: { duration: 15, repeat: Infinity, ease: "linear" }
      }}
    />
  </motion.div>
);

const EvaluationSplash = ({ onComplete }: EvaluationSplashProps) => {
  const { language } = useLanguage();
  const [phase, setPhase] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Generate random particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5
  }));

  const messages = {
    es: [
      { text: "Analizando", sub: "Inteligencia artificial aplicada" },
      { text: "Diagnóstico preciso", sub: "Certeza antes de actuar" },
      { text: "Tratamiento seguro", sub: "Decisiones basadas en datos" },
      { text: "Resultados predecibles", sub: "El futuro de tu sonrisa" }
    ],
    en: [
      { text: "Analyzing", sub: "Applied artificial intelligence" },
      { text: "Precise diagnosis", sub: "Certainty before action" },
      { text: "Safe treatment", sub: "Data-driven decisions" },
      { text: "Predictable results", sub: "The future of your smile" }
    ]
  };

  const currentMessages = messages[language as "es" | "en"] || messages.es;

  useEffect(() => {
    // Phase progression
    const timers = [
      setTimeout(() => setPhase(1), 500),    // Show tooth visualization
      setTimeout(() => setPhase(2), 2000),   // AI scan effect
      setTimeout(() => setPhase(3), 4000),   // Show first message
      setTimeout(() => setPhase(4), 5500),   // Show second message
      setTimeout(() => setPhase(5), 7000),   // Show third message
      setTimeout(() => setPhase(6), 8500),   // Show fourth message
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(onComplete, 1200);
      }, 11000) // Exit
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    setIsExiting(true);
    setTimeout(onComplete, 800);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 1 }}
    >
      {/* Particle background */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <Particle key={p.id} x={p.x} y={p.y} delay={p.delay} />
        ))}
      </div>

      {/* Scan lines */}
      <AnimatePresence>
        {phase >= 1 && phase < 6 && (
          <>
            <ScanLine delay={0} />
            <ScanLine delay={1.5} />
            <ScanLine delay={3} />
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        {/* Tooth visualization with AI effect */}
        <ToothVisualization phase={phase} />

        {/* Message display */}
        <div className="mt-12 h-32 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {phase >= 3 && phase <= 6 && (
              <motion.div
                key={phase}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.h2 
                  className="font-serif text-3xl md:text-5xl lg:text-6xl text-foreground mb-4"
                  initial={{ letterSpacing: "0.1em" }}
                  animate={{ letterSpacing: "0.02em" }}
                  transition={{ duration: 1 }}
                >
                  {currentMessages[phase - 3]?.text}
                </motion.h2>
                <motion.p 
                  className="text-sm md:text-base text-gold-muted tracking-[0.3em] uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentMessages[phase - 3]?.sub}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress indicator */}
        <motion.div 
          className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 3 ? 1 : 0 }}
        >
          {[3, 4, 5, 6].map((p) => (
            <motion.div
              key={p}
              className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                phase >= p ? "bg-gold-muted" : "bg-muted-foreground/20"
              }`}
              animate={{ scale: phase === p ? 1.3 : 1 }}
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
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-muted/40 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isExiting ? 0 : 1 }}
        transition={{ duration: 1.5 }}
      />
    </motion.div>
  );
};

export default EvaluationSplash;
