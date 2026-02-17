import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ───────────────────────────────────────────────────────────────
   AI Ecosystem — Three concentric rings, clean contained layout
   ─────────────────────────────────────────────────────────────── */

const LAYERS = [
  {
    label: "Analizamos",
    ring: 1,
    color: "from-gold/10 to-transparent",
    border: "border-gold-muted/20",
    nodes: ["Radiografías", "Fotografías", "Historial"],
  },
  {
    label: "Planificamos",
    ring: 2,
    color: "from-gold/6 to-transparent",
    border: "border-gold-muted/14",
    nodes: ["Diagnóstico", "Simulación", "Priorización"],
  },
  {
    label: "Te acompañamos",
    ring: 3,
    color: "from-gold/3 to-transparent",
    border: "border-gold-muted/10",
    nodes: ["Seguimiento", "Prevención", "Evolución"],
  },
];

const AIEcosystem = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

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
          <h2
            className="display-large text-foreground text-shadow-subtle max-w-3xl mx-auto"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Así funciona nuestro sistema
          </h2>
          <p className="body-large text-muted-foreground mt-6 max-w-xl mx-auto">
            Inteligencia artificial al servicio del criterio clínico.
          </p>
        </div>

        {/* Three-layer diagram */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
          {LAYERS.map((layer, layerIdx) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + layerIdx * 0.18, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden"
            >
              {/* Layer header */}
              <div className={`px-6 py-5 bg-gradient-to-br ${layer.color} border-b border-border/40`}>
                <p className="caption text-gold tracking-widest mb-1">
                  {String(layerIdx + 1).padStart(2, "0")}
                </p>
                <h3
                  className="text-lg text-foreground font-medium"
                  style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
                >
                  {layer.label}
                </h3>
              </div>

              {/* Nodes */}
              <div className="flex flex-col gap-3 p-5 flex-1">
                {layer.nodes.map((node, nodeIdx) => (
                  <motion.div
                    key={node}
                    initial={{ opacity: 0, x: -8 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 + layerIdx * 0.18 + nodeIdx * 0.08, duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-muted/60 shrink-0" />
                    <span className="text-sm text-muted-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {node}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Centre nucleus — decorative */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 via-gold/10 to-transparent border border-gold-muted/30 flex flex-col items-center justify-center text-center backdrop-blur-sm shadow-elegant">
            <span
              className="block text-base text-foreground tracking-tight leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
            >
              IA Clínica
            </span>
            <span className="block text-[9px] text-gold-muted mt-0.5 tracking-wider uppercase">
              Miró
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIEcosystem;
