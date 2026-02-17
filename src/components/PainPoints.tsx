import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";

const painPoints = [
  {
    problem: "Entre 40% y 80% de los tratamientos nunca se completan.",
    detail: "Solo el 34% de los tratamientos presentados son aceptados por los pacientes, y de ellos, no todos llegan a completarse. El miedo, el costo y la incertidumbre son las principales barreras.",
    solution: "Aquí entra el primer motor inteligente de Miró: ya no tendrás que «creerle» a uno u otro dentista. Nuestra IA tiene una sensibilidad de 0.85 y especificidad de 0.90, superando al dentista promedio en detección temprana.",
    source: "Jarvis Analytics · Levin Group Data Center · Martin et al., Frontiers in Public Health, 2017 (DOI: 10.3389/fpubh.2017.00171)",
    sourceUrl: "https://doi.org/10.3389/fpubh.2017.00171",
  },
  {
    problem: "Un mismo paciente puede recibir presupuestos con diferencia de 20x.",
    detail: "136 dentistas de 14 países evaluaron la misma radiografía de boca completa: no hubo ni un solo caso de acuerdo unánime sobre la presencia de caries. Para el mismo paciente, un dentista propuso un plan de $200.000 CLP y otro uno de $28.000.000 CLP.",
    solution: "Aquí entra el segundo motor inteligente de Miró: un copiloto de asistencia clínica que muestra en vivo los tratamientos con mayores probabilidades de éxito para cada paciente específico.",
    source: "Dental AI Council, 2020 · Garcia Cantu et al., Journal of Dentistry, 2020 (DOI: 10.1016/j.jdent.2020.103444)",
    sourceUrl: "https://doi.org/10.1016/j.jdent.2020.103444",
  },
  {
    problem: "América Latina tiene la mayor carga de enfermedad oral del mundo.",
    detail: "Más de la mitad de los niños de la región tiene caries. En adultos mayores, las necesidades dentales no satisfechas llegan hasta el 98.4%.",
    solution: "La odontología predictiva democratiza el diagnóstico de calidad en la región que más lo necesita.",
    source: "Global Burden of Disease 2021, The Lancet (DOI: 10.1016/S0140-6736(24)02811-3) · Gimenez et al., PLOS ONE, 2016 (DOI: 10.1371/journal.pone.0164903)",
    sourceUrl: "https://doi.org/10.1016/S0140-6736(24)02811-3",
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
            La evidencia
          </p>
          <h2
            className="display-medium text-foreground text-shadow-subtle max-w-3xl mx-auto"
            style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
          >
            Datos que respaldan
            <br />
            una nueva forma de diagnosticar.
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

              {/* Source */}
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-[10px] text-muted-foreground/50 leading-relaxed tracking-wide hover:text-gold-muted transition-colors underline underline-offset-2 decoration-muted-foreground/20"
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
