import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

export function FutureVarianceBlock() {
  const sectionRef = useRevealOnScroll();

  return (
    <section ref={sectionRef} className="py-section px-6 lg:px-12 bg-background">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Headline */}
        <div className="space-y-2">
          <h2
            className="text-2xl md:text-3xl font-semibold leading-snug text-foreground"
            style={{ fontFamily: "'Lora', serif" }}
          >
            No compares presupuestos.
          </h2>
          <p
            className="text-xl md:text-2xl text-gold leading-snug"
            style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
          >
            Compara futuros posibles.
          </p>
        </div>

        {/* Dos escenarios */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <p className="caption uppercase tracking-[0.14em] text-gold">
              Plan mínimo hoy
            </p>
            <p className="text-foreground font-medium leading-snug">
              Mayor riesgo a 3–5 años.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Menor intervención inicial, pero mayor probabilidad de que lesiones progresen y requieran tratamientos más complejos en el futuro.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <p className="caption uppercase tracking-[0.14em] text-gold">
              Plan intensivo hoy
            </p>
            <p className="text-foreground font-medium leading-snug">
              Menor riesgo futuro, mayor inversión inicial.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tratamiento amplio desde el inicio. Más dientes estabilizados, menor probabilidad de urgencias y complicaciones a largo plazo.
            </p>
          </div>
        </div>

        {/* Cierre */}
        <p className="text-sm text-muted-foreground leading-relaxed border-l border-border pl-4">
          Con nuestro sistema puedes visualizar qué camino se ajusta mejor a tu salud y realidad, antes de comprometerte con cualquier tratamiento.
        </p>

      </div>
    </section>
  );
}

export default FutureVarianceBlock;
