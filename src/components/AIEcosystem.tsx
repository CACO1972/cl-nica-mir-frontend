import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

/* ───────────────────────────────────────────────────────────────
   AI Ecosystem — Orbital visualization (patient-facing)
   3 orbits: Análisis → Planificación → Acompañamiento
   ─────────────────────────────────────────────────────────────── */

interface OrbitNode {
  label: string;
  angleDeg: number;
}

interface OrbitRing {
  radiusMobile: number;
  radiusDesktop: number;
  duration: number; // seconds per full rotation
  reverse?: boolean;
  nodes: OrbitNode[];
}

const ORBITS: OrbitRing[] = [
  {
    radiusMobile: 110,
    radiusDesktop: 170,
    duration: 50,
    nodes: [
      { label: "Radiografías", angleDeg: 0 },
      { label: "Fotografías", angleDeg: 120 },
      { label: "Historial", angleDeg: 240 },
    ],
  },
  {
    radiusMobile: 175,
    radiusDesktop: 280,
    duration: 70,
    reverse: true,
    nodes: [
      { label: "Diagnóstico", angleDeg: 45 },
      { label: "Simulación", angleDeg: 165 },
      { label: "Priorización", angleDeg: 285 },
    ],
  },
  {
    radiusMobile: 240,
    radiusDesktop: 390,
    duration: 100,
    nodes: [
      { label: "Seguimiento", angleDeg: 30 },
      { label: "Prevención", angleDeg: 150 },
      { label: "Evolución", angleDeg: 270 },
    ],
  },
];

const ORBIT_LABELS = ["Analizamos", "Planificamos", "Te acompañamos"];

const AIEcosystem = () => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      className="py-section px-6 lg:px-12 bg-background overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-24">
          <p className="caption text-gold-muted mb-6 tracking-widest">
            Tecnología con propósito
          </p>
          <h2 className="display-large text-foreground text-shadow-subtle max-w-3xl mx-auto">
            Así funciona nuestro sistema
          </h2>
          <p className="body-large text-muted-foreground mt-8 max-w-xl mx-auto">
            Inteligencia artificial al servicio del criterio clínico. Cada capa trabaja para que tu tratamiento sea más preciso y seguro.
          </p>
        </div>

        {/* Orbital visualization */}
        <div className="relative mx-auto w-full max-w-[500px] lg:max-w-[820px] aspect-square">
          {/* Core nucleus */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full bg-gradient-to-br from-gold/20 via-gold/10 to-transparent border border-gold-muted/30 flex items-center justify-center text-center backdrop-blur-sm shadow-elegant">
              <div>
                <span
                  className="block text-lg sm:text-xl lg:text-2xl text-foreground tracking-tight"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
                >
                  IA Clínica
                </span>
                <span
                  className="block text-[10px] sm:text-xs text-gold-muted mt-1 tracking-wider uppercase"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Miró
                </span>
              </div>
            </div>
          </motion.div>

          {/* Orbit rings + nodes */}
          {ORBITS.map((orbit, orbitIdx) => (
            <OrbitLayer
              key={orbitIdx}
              orbit={orbit}
              index={orbitIdx}
              label={ORBIT_LABELS[orbitIdx]}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Bottom legend */}
        <div className="flex flex-wrap justify-center gap-8 lg:gap-16 mt-16 lg:mt-24">
          {ORBIT_LABELS.map((label, i) => (
            <motion.div
              key={label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1 + i * 0.2, duration: 0.6 }}
            >
              <span className="block w-2 h-2 rounded-full bg-gold-muted/60 mx-auto mb-3" />
              <span
                className="text-sm sm:text-base text-foreground tracking-wide"
                style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
              >
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Orbit layer (ring + rotating nodes) ─── */

const OrbitLayer = ({
  orbit,
  index,
  label,
  isInView,
}: {
  orbit: OrbitRing;
  index: number;
  label: string;
  isInView: boolean;
}) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const radius = isMobile ? orbit.radiusMobile : orbit.radiusDesktop;
  const size = radius * 2;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{
        width: size,
        height: size,
        marginLeft: -radius,
        marginTop: -radius,
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: 0.3 + index * 0.25, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Dashed ring */}
      <div
        className="absolute inset-0 rounded-full border border-dashed border-gold-muted/15"
      />

      {/* Rotating container */}
      <div
        className="absolute inset-0"
        style={{
          animation: `ecosystem-rotate ${orbit.duration}s linear infinite ${orbit.reverse ? "reverse" : "normal"}`,
        }}
      >
        {orbit.nodes.map((node, nodeIdx) => {
          const angleRad = (node.angleDeg * Math.PI) / 180;
          const x = Math.cos(angleRad) * radius + radius;
          const y = Math.sin(angleRad) * radius + radius;

          return (
            <div
              key={nodeIdx}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              {/* Counter-rotate so text stays upright */}
              <div
                style={{
                  animation: `ecosystem-rotate ${orbit.duration}s linear infinite ${orbit.reverse ? "normal" : "reverse"}`,
                }}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-background/80 dark:bg-background/60 backdrop-blur-sm border border-gold-muted/20 flex items-center justify-center text-center transition-all duration-300 hover:border-gold-muted/50 hover:scale-110 hover:shadow-brand-hover cursor-default">
                  <span className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-tight px-1" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
                    {node.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AIEcosystem;
