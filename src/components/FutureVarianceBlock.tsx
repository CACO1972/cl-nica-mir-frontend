import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

export function FutureVarianceBlock() {
  const sectionRef = useRevealOnScroll();

  return (
    <section ref={sectionRef} className="py-section px-6 lg:px-12 bg-background">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Título + historia 20x */}
        <div className="space-y-3">
          <p className="caption text-gold tracking-[0.15em] uppercase">
            02 · Variabilidad entre dentistas
          </p>
          <h2 className="text-xl md:text-2xl font-semibold leading-snug text-foreground" style={{ fontFamily: "'Lora', serif" }}>
            Un mismo paciente puede recibir presupuestos con diferencia de 20x.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            136 dentistas de 14 países evaluaron la misma radiografía de boca completa.
            No hubo ni un solo caso de acuerdo unánime sobre la presencia de caries.
            Para el mismo paciente, un dentista propuso un plan de aproximadamente{" "}
            <span className="font-semibold text-foreground">$200.000 CLP</span> y otro uno de{" "}
            <span className="font-semibold text-foreground">$28.000.000 CLP</span>.
          </p>
        </div>

        {/* Explicación corta */}
        <div className="border-l border-border pl-4 text-sm text-muted-foreground">
          <p>
            No es que uno «se equivoque» y el otro no. Algunos clínicos deciden tratar
            todas las caries iniciales; otros prefieren observar y controlar. Esa
            diferencia de criterio se traduce en planes y costos muy distintos para
            la misma boca.
          </p>
        </div>

        {/* Dos escenarios visuales */}
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="caption uppercase tracking-[0.14em] text-gold">
                Escenario A · Plan mínimo
              </p>
              <p className="font-semibold text-foreground">Intervenir solo lo más evidente hoy.</p>
              <p className="text-xs text-muted-foreground">
                Tratamiento inicial reducido (p.ej. 3 piezas), costo cercano a{" "}
                <span className="font-semibold text-foreground">$200.000 CLP</span>.
              </p>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">A 3–5 años, si no se hace nada más:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Mayor probabilidad de que caries «pequeñas» progresen.</li>
                <li>Más riesgo de terminar en endodoncias y coronas en esos dientes.</li>
                <li>Costo acumulado potencialmente mayor y más estructura perdida.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="caption uppercase tracking-[0.14em] text-gold">
                Escenario B · Plan intensivo
              </p>
              <p className="font-semibold text-foreground">Tratar todas las lesiones detectadas hoy.</p>
              <p className="text-xs text-muted-foreground">
                Tratamiento inicial amplio (p.ej. 10–12 piezas), con un presupuesto que
                puede acercarse a{" "}
                <span className="font-semibold text-foreground">$28.000.000 CLP</span> en casos extremos.
              </p>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">A 3–5 años, si se mantiene el control:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Menor probabilidad de urgencias y tratamientos mayores.</li>
                <li>Más dientes estabilizados, pero con mayor intervención hoy.</li>
                <li>Costo inicial más alto, riesgo futuro más bajo.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Rol de HUMANA / Miró */}
        <div className="space-y-3 text-sm">
          <p className="font-semibold text-foreground">
            Aquí entra nuestro motor de futuro:
          </p>
          <p className="text-muted-foreground">
            HUMANA.AI no elige por ti ni reemplaza al dentista. Toma el diagnóstico
            y simula qué pasa con tu boca si sigues un plan mínimo o un plan intensivo:
            probabilidad de nuevas caries, necesidad de endodoncia, número de dientes
            comprometidos y costo acumulado estimado a 3–5 años.
          </p>
          <p className="text-muted-foreground">
            En vez de comparar solo presupuestos, comparas{" "}
            <span className="font-semibold text-foreground">futuros posibles</span> y
            decides qué camino se ajusta mejor a tu salud, tu tiempo y tu realidad.
          </p>
        </div>

      </div>
    </section>
  );
}

export default FutureVarianceBlock;
