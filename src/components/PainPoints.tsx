import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const painPoints = [
  {
    problem: "No es el precio. Es la incertidumbre.",
    detail: "Vas a tres dentistas, te dan tres diagnósticos distintos. No sabes en quién confiar ni qué tratamiento es el correcto.",
    solution: "En Miró, la IA analiza tu caso con datos objetivos. Te entregamos un informe visual de 5 páginas para que decidas con claridad, no con fe ciega.",
  },
  {
    problem: "No entiendes porque no te explican.",
    detail: "Te hablan en jerga técnica, te muestran una radiografía que no entiendes y te piden que decidas en el momento.",
    solution: "Te mostramos tu caso en imágenes 3D, te explicamos cada alternativa sobre tu propia boca y te damos tiempo para decidir en familia.",
  },
  {
    problem: "El financiamiento es opaco.",
    detail: "No sabes cuánto cuesta realmente, qué incluye, ni si hay opciones de pago. La letra chica aparece después.",
    solution: "Transparencia total: el costo real de cada opción, formas de pago disponibles y sin sorpresas. Todo antes de comprometerte.",
  },
];

const PainPoints = () => {
  const sectionRef = useRevealOnScroll();

  return (
    <section ref={sectionRef} className="py-section px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-24">
          <p className="caption text-gold-muted tracking-widest mb-6">
            El problema real
          </p>
          <h2
            className="display-medium text-foreground text-shadow-subtle max-w-3xl mx-auto"
            style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
          >
            Muchas veces no es el precio.
            <br />
            Es no saber si te están diciendo la verdad.
          </h2>
        </div>

        {/* Pain point cards */}
        <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-12">
          {painPoints.map((item, i) => (
            <div
              key={i}
              className="group relative"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              {/* Problem */}
              <div className="mb-6">
                <span className="caption text-gold tracking-widest">
                  0{i + 1}
                </span>
                <h3
                  className="mt-3 text-lg sm:text-xl text-foreground font-medium leading-snug"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {item.problem}
                </h3>
                <p className="mt-3 body-small text-muted-foreground leading-relaxed">
                  {item.detail}
                </p>
              </div>

              {/* Divider */}
              <div className="w-12 h-px bg-gold-muted/40 mb-6" />

              {/* Solution */}
              <p className="body-small text-foreground/80 leading-relaxed">
                {item.solution}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPoints;
