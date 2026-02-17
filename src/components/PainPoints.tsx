import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const painPoints = [
  {
    number: "01",
    label: "Tratamientos no completados",
    detail: "Estudios muestran que una parte relevante de los tratamientos presentados no llega a ejecutarse.",
    sourceUrl: "https://doi.org/10.3389/fpubh.2017.00171",
    source: "Frontiers in Public Health, 2017",
  },
  {
    number: "02",
    label: "Variabilidad clínica",
    detail: "Investigaciones internacionales demuestran diferencias significativas en diagnósticos y planes para un mismo caso.",
    sourceUrl: "https://doi.org/10.1016/j.jdent.2020.103444",
    source: "Journal of Dentistry, 2020",
  },
  {
    number: "03",
    label: "Alta carga en LATAM",
    detail: "América Latina concentra algunas de las mayores tasas de enfermedad oral a nivel mundial.",
    sourceUrl: "https://doi.org/10.1016/S0140-6736(24)02811-3",
    source: "The Lancet, 2021",
  },
];

const PainPoints = () => {
  const sectionRef = useRevealOnScroll();

  return (
    <section ref={sectionRef} className="py-section px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="caption text-gold-muted tracking-widest mb-6">
            La evidencia
          </p>
          <h2
            className="display-medium text-foreground text-shadow-subtle max-w-3xl mx-auto"
            style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
          >
            Datos que respaldan una nueva forma de diagnosticar.
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
              <div className="mb-4">
                <span className="caption text-gold tracking-widest">
                  {item.number}
                </span>
                <h3
                  className="mt-3 text-lg sm:text-xl text-foreground font-medium leading-snug"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  {item.label}
                </h3>
                <p className="mt-3 body-small text-muted-foreground leading-relaxed">
                  {item.detail}
                </p>
              </div>

              {/* Divider */}
              <div className="w-12 h-px bg-gold-muted/40 mt-6" />

              {/* Source */}
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-[10px] text-muted-foreground/50 leading-relaxed tracking-wide hover:text-gold-muted transition-colors underline underline-offset-2 decoration-muted-foreground/20"
              >
                {item.source}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPoints;
