import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Shield, Smile, Heart, Sparkles, Zap, ArrowRight, Brain, CheckCircle } from "lucide-react";

const brands = [
  {
    id: "implant",
    name: "Implant ONE",
    font: "'Inter', sans-serif",
    weight: 700,
    spacing: "-0.02em",
    color: "hsl(210, 20%, 28%)",
    accent: "hsl(210, 26%, 48%)",
    accentBg: "hsla(210, 26%, 48%, 0.08)",
    accentBorder: "hsla(210, 26%, 48%, 0.15)",
    tagKey: "services.implant.tag",
    tagStyle: "uppercase" as const,
    descKey: "services.implant.desc",
    features: [
      "services.implant.f1",
      "services.implant.f2",
      "services.implant.f3",
      "services.implant.f4",
      "services.implant.f5",
    ],
    appKey: "services.implant.app",
    imgKey: "services.implant.img",
    icon: Shield,
    wide: true,
  },
  {
    id: "simetria",
    name: "Simetría",
    font: "'Lora', serif",
    weight: 400,
    spacing: "0.02em",
    color: "hsl(43, 70%, 31%)",
    accent: "hsl(43, 65%, 44%)",
    accentBg: "hsla(43, 65%, 44%, 0.08)",
    accentBorder: "hsla(43, 65%, 44%, 0.15)",
    tagKey: "services.simetria.tag",
    tagStyle: "italic" as const,
    descKey: "services.simetria.desc",
    features: [
      "services.simetria.f1",
      "services.simetria.f2",
      "services.simetria.f3",
      "services.simetria.f4",
    ],
    appKey: "services.simetria.app",
    imgKey: "services.simetria.img",
    icon: Smile,
    wide: false,
  },
  {
    id: "sentia",
    name: "Sentia",
    font: "'Inter', sans-serif",
    weight: 300,
    spacing: "0.04em",
    color: "hsl(296, 18%, 37%)",
    accent: "hsl(296, 18%, 55%)",
    accentBg: "hsla(296, 18%, 55%, 0.08)",
    accentBorder: "hsla(296, 18%, 55%, 0.15)",
    tagKey: "services.sentia.tag",
    tagStyle: "normal" as const,
    descKey: "services.sentia.desc",
    features: [
      "services.sentia.f1",
      "services.sentia.f2",
      "services.sentia.f3",
      "services.sentia.f4",
      "services.sentia.f5",
    ],
    appKey: "services.sentia.app",
    imgKey: "services.sentia.img",
    icon: Heart,
    wide: false,
  },
  {
    id: "orthopro",
    name: "OrthoPro",
    font: "'Inter', sans-serif",
    weight: 600,
    spacing: "-0.01em",
    color: "hsl(165, 60%, 26%)",
    accent: "hsl(165, 53%, 39%)",
    accentBg: "hsla(165, 53%, 39%, 0.08)",
    accentBorder: "hsla(165, 53%, 39%, 0.15)",
    tagKey: "services.orthopro.tag",
    tagStyle: "uppercase" as const,
    descKey: "services.orthopro.desc",
    features: [
      "services.orthopro.f1",
      "services.orthopro.f2",
      "services.orthopro.f3",
      "services.orthopro.f4",
      "services.orthopro.f5",
    ],
    appKey: "services.orthopro.app",
    imgKey: "services.orthopro.img",
    icon: Sparkles,
    wide: false,
  },
  {
    id: "zerocaries",
    name: "ZeroCaries",
    font: "'Inter', sans-serif",
    weight: 500,
    spacing: "0.01em",
    color: "hsl(145, 43%, 29%)",
    accent: "hsl(140, 40%, 44%)",
    accentBg: "hsla(140, 40%, 44%, 0.07)",
    accentBorder: "hsla(140, 40%, 44%, 0.15)",
    tagKey: "services.zerocaries.tag",
    tagStyle: "uppercase" as const,
    descKey: "services.zerocaries.desc",
    features: [
      "services.zerocaries.f1",
      "services.zerocaries.f2",
      "services.zerocaries.f3",
      "services.zerocaries.f4",
      "services.zerocaries.f5",
    ],
    appKey: "services.zerocaries.app",
    imgKey: "services.zerocaries.img",
    icon: Zap,
    wide: false,
  },
];

const translations: Record<string, Record<string, string>> = {
  es: {
    "services.caption": "Tratamientos Exclusivos",
    "services.headline": "Excelencia en cada detalle",
    "services.subline": "Cinco protocolos exclusivos. Cada uno con identidad propia, respaldados por inteligencia artificial y 27 años de experiencia clínica.",
    "services.includes": "Incluye",
    "services.tech": "Tecnología HUMANA.AI",
    "services.imaging": "Imagenología",
    "services.cta": "Agendar Evaluación",
    "services.ecosystem": "Ecosistema de tratamientos",
    // Implant ONE
    "services.implant.tag": "Implantes en un día",
    "services.implant.desc": "Rehabilitación implantológica inmediata con planificación digital 3D y carga en el mismo día.",
    "services.implant.f1": "Cirugía guiada por computador",
    "services.implant.f2": "Prótesis provisional inmediata",
    "services.implant.f3": "Planificación con Cone Beam",
    "services.implant.f4": "Seguimiento predictivo post-quirúrgico",
    "services.implant.f5": "Validación ImplantX (ROC-AUC 0.894)",
    "services.implant.app": "ImplantX",
    "services.implant.img": "Cone Beam (CBCT)",
    // Simetría
    "services.simetria.tag": "Armonía Dentofacial",
    "services.simetria.desc": "Análisis y planificación de armonía dentofacial. Diseño de sonrisa con proporciones faciales.",
    "services.simetria.f1": "Análisis de simetría facial con IA",
    "services.simetria.f2": "Proporciones áureas dentofaciales",
    "services.simetria.f3": "Simulación digital pre-tratamiento",
    "services.simetria.f4": "Integración con Índice Miró",
    "services.simetria.app": "Simetría + Armonía",
    "services.simetria.img": "Fotografía facial estandarizada",
    // Sentia
    "services.sentia.tag": "Bienestar Integral",
    "services.sentia.desc": "Bruxismo, ansiedad dental y trastornos del sueño asociados. Enfoque multidisciplinario.",
    "services.sentia.f1": "Diagnóstico bruxismo diurno y nocturno",
    "services.sentia.f2": "Manejo de ansiedad y fobia dental",
    "services.sentia.f3": "Evaluación de trastornos del sueño",
    "services.sentia.f4": "Dispositivos de protección personalizados",
    "services.sentia.f5": "Seguimiento emocional del paciente",
    "services.sentia.app": "Sentia (en desarrollo)",
    "services.sentia.img": "Panorámica + evaluación funcional",
    // OrthoPro
    "services.orthopro.tag": "Ortodoncia Personalizada",
    "services.orthopro.desc": "Simulación de sonrisa, comparación de brackets, estimación de duración y riesgo de recidiva.",
    "services.orthopro.f1": "Simulación de sonrisa final",
    "services.orthopro.f2": "Comparación entre tipos de brackets",
    "services.orthopro.f3": "Estimación duración del tratamiento",
    "services.orthopro.f4": "Evaluación de riesgo de recidiva",
    "services.orthopro.f5": "Acompañamiento digital continuo",
    "services.orthopro.app": "OrthoPro",
    "services.orthopro.img": "Panorámica + Teleradiografía",
    // ZeroCaries
    "services.zerocaries.tag": "Sin Inyección · Sin Taladro",
    "services.zerocaries.desc": "Tratamiento de caries pequeñas sin dolor con tecnología Curodont. Sin anestesia, sin fresa.",
    "services.zerocaries.f1": "Tratamiento con Curodont Repair",
    "services.zerocaries.f2": "Sin inyección ni anestesia",
    "services.zerocaries.f3": "Sin taladro ni fresa",
    "services.zerocaries.f4": "Ideal para caries incipientes",
    "services.zerocaries.f5": "Detección precoz con IA",
    "services.zerocaries.app": "ZeroCaries",
    "services.zerocaries.img": "Bitewing completa + Periapicales",
  },
  en: {
    "services.caption": "Exclusive Treatments",
    "services.headline": "Excellence in every detail",
    "services.subline": "Five exclusive protocols. Each with its own identity, backed by artificial intelligence and 27 years of clinical experience.",
    "services.includes": "Includes",
    "services.tech": "HUMANA.AI Technology",
    "services.imaging": "Imaging",
    "services.cta": "Book Evaluation",
    "services.ecosystem": "Treatment Ecosystem",
    // Implant ONE
    "services.implant.tag": "Same-day implants",
    "services.implant.desc": "Immediate implant rehabilitation with 3D digital planning and same-day loading.",
    "services.implant.f1": "Computer-guided surgery",
    "services.implant.f2": "Immediate provisional prosthesis",
    "services.implant.f3": "Cone Beam planning",
    "services.implant.f4": "Predictive post-surgical follow-up",
    "services.implant.f5": "ImplantX validation (ROC-AUC 0.894)",
    "services.implant.app": "ImplantX",
    "services.implant.img": "Cone Beam (CBCT)",
    // Simetría
    "services.simetria.tag": "Dentofacial Harmony",
    "services.simetria.desc": "Dentofacial harmony analysis and planning. Smile design with facial proportions.",
    "services.simetria.f1": "AI facial symmetry analysis",
    "services.simetria.f2": "Golden dentofacial proportions",
    "services.simetria.f3": "Pre-treatment digital simulation",
    "services.simetria.f4": "Miró Index integration",
    "services.simetria.app": "Simetría + Harmony",
    "services.simetria.img": "Standardized facial photography",
    // Sentia
    "services.sentia.tag": "Comprehensive Wellbeing",
    "services.sentia.desc": "Bruxism, dental anxiety and associated sleep disorders. Multidisciplinary approach.",
    "services.sentia.f1": "Daytime and nighttime bruxism diagnosis",
    "services.sentia.f2": "Anxiety and dental phobia management",
    "services.sentia.f3": "Sleep disorder evaluation",
    "services.sentia.f4": "Custom protection devices",
    "services.sentia.f5": "Emotional patient follow-up",
    "services.sentia.app": "Sentia (in development)",
    "services.sentia.img": "Panoramic + functional evaluation",
    // OrthoPro
    "services.orthopro.tag": "Personalized Orthodontics",
    "services.orthopro.desc": "Smile simulation, bracket comparison, treatment duration estimation and relapse risk.",
    "services.orthopro.f1": "Final smile simulation",
    "services.orthopro.f2": "Bracket type comparison",
    "services.orthopro.f3": "Treatment duration estimation",
    "services.orthopro.f4": "Relapse risk assessment",
    "services.orthopro.f5": "Continuous digital support",
    "services.orthopro.app": "OrthoPro",
    "services.orthopro.img": "Panoramic + Cephalometric",
    // ZeroCaries
    "services.zerocaries.tag": "No Injection · No Drill",
    "services.zerocaries.desc": "Painless treatment of small cavities with Curodont technology. No anesthesia, no drill.",
    "services.zerocaries.f1": "Curodont Repair treatment",
    "services.zerocaries.f2": "No injection or anesthesia",
    "services.zerocaries.f3": "No drill or burr",
    "services.zerocaries.f4": "Ideal for incipient cavities",
    "services.zerocaries.f5": "Early AI detection",
    "services.zerocaries.app": "ZeroCaries",
    "services.zerocaries.img": "Full Bitewing + Periapicals",
  },
};

const ServicesBento = () => {
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>(null);

  const t = (key: string) => translations[language]?.[key] || translations.es[key] || key;

  return (
    <section className="py-section px-6 lg:px-12 bg-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 lg:mb-24">
          <p className="caption text-gold-muted mb-6">{t("services.caption")}</p>
          <h2 className="display-large text-foreground text-shadow-subtle max-w-2xl">
            {t("services.headline")}
          </h2>
          <p className="body-large text-muted-foreground mt-6 max-w-xl">
            {t("services.subline")}
          </p>
        </div>

        {/* Treatment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {brands.map((b) => {
            const isOpen = expanded === b.id;
            const Icon = b.icon;

            return (
              <div
                key={b.id}
                className={`rounded-2xl overflow-hidden transition-all duration-500 ${
                  b.wide ? "md:col-span-2" : ""
                }`}
                style={{
                  border: isOpen ? `1.5px solid ${b.accentBorder}` : "1px solid hsl(var(--border))",
                  background: isOpen ? "hsl(var(--card))" : "hsl(var(--card) / 0.5)",
                  boxShadow: isOpen ? `0 8px 40px ${b.accentBg}` : "none",
                }}
              >
                {/* Card Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : b.id)}
                  className="w-full text-left"
                  style={{ padding: b.wide ? "40px 44px" : "36px" }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      {/* Icon */}
                      <div
                        className="flex items-center justify-center mb-6 rounded-2xl"
                        style={{
                          width: 56,
                          height: 56,
                          background: b.accentBg,
                          border: `1px solid ${b.accentBorder}`,
                        }}
                      >
                        <Icon size={26} style={{ color: b.accent }} strokeWidth={1.8} />
                      </div>

                      {/* Brand Name */}
                      <h3
                        className="leading-tight mb-1.5"
                        style={{
                          fontFamily: b.font,
                          fontWeight: b.weight,
                          fontSize: b.wide ? "clamp(28px, 4vw, 40px)" : "clamp(24px, 3vw, 34px)",
                          color: b.color,
                          letterSpacing: b.spacing,
                        }}
                      >
                        {b.name}
                      </h3>

                      {/* Tagline */}
                      <p
                        className="mb-4"
                        style={{
                          color: b.accent,
                          fontSize: 13,
                          fontWeight: 500,
                          fontStyle: b.tagStyle === "italic" ? "italic" : "normal",
                          textTransform: b.tagStyle === "uppercase" ? "uppercase" : "none",
                          letterSpacing: b.tagStyle === "uppercase" ? "0.12em" : "0.01em",
                          fontFamily: b.tagStyle === "italic" ? b.font : "'Inter', sans-serif",
                        }}
                      >
                        {t(b.tagKey)}
                      </p>

                      {/* Description */}
                      <p className="body-small text-muted-foreground max-w-lg uppercase tracking-wider text-xs leading-relaxed">
                        {t(b.descKey)}
                      </p>

                      {/* Brand Line */}
                      <div
                        className="mt-5"
                        style={{ width: 40, height: 2, borderRadius: 1, background: `${b.accent}66` }}
                      />
                    </div>

                    {/* Expand Arrow */}
                    <div
                      className="shrink-0 flex items-center justify-center transition-all duration-300 rounded-full"
                      style={{
                        width: 32,
                        height: 32,
                        border: `1px solid ${isOpen ? b.accentBorder : "hsl(var(--border))"}`,
                        background: isOpen ? b.accentBg : "transparent",
                        transform: isOpen ? "rotate(90deg)" : "none",
                      }}
                    >
                      <ArrowRight size={16} style={{ color: isOpen ? b.accent : "hsl(var(--muted-foreground))" }} />
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {isOpen && (
                  <div
                    className="px-8 md:px-11 pb-10"
                    style={{ borderTop: `1px solid ${b.accent}30` }}
                  >
                    <div
                      className={`pt-8 grid gap-8 ${
                        b.wide ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                      }`}
                    >
                      {/* Features */}
                      <div>
                        <h4
                          className="mb-4 uppercase tracking-[0.2em]"
                          style={{ fontSize: 11, fontWeight: 600, color: b.accent }}
                        >
                          {t("services.includes")}
                        </h4>
                        <ul className="space-y-3">
                          {b.features.map((fKey, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-3 text-sm text-muted-foreground"
                            >
                              <CheckCircle
                                size={16}
                                style={{ color: b.accent }}
                                className="shrink-0 mt-0.5"
                              />
                              {t(fKey)}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tech + CTA */}
                      <div className="space-y-6">
                        <div>
                          <h4
                            className="mb-3 uppercase tracking-[0.2em]"
                            style={{ fontSize: 11, fontWeight: 600, color: b.accent }}
                          >
                            {t("services.tech")}
                          </h4>
                          <span
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px]"
                            style={{
                              background: b.color,
                              fontFamily: b.font,
                              fontWeight: 500,
                            }}
                          >
                            <Brain size={16} /> {t(b.appKey)}
                          </span>
                        </div>

                        <div>
                          <h4
                            className="mb-2 uppercase tracking-[0.2em]"
                            style={{ fontSize: 11, fontWeight: 600, color: b.accent }}
                          >
                            {t("services.imaging")}
                          </h4>
                          <p className="text-sm text-muted-foreground">{t(b.imgKey)}</p>
                        </div>

                        <Link
                          to="/evaluation"
                          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] font-semibold text-sm text-white transition-opacity hover:opacity-90"
                          style={{
                            background: b.color,
                            fontFamily: b.font,
                          }}
                        >
                          {t("services.cta")}
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Brand Ecosystem Bar */}
        <div className="mt-16 text-center">
          <p className="caption text-muted-foreground mb-5 tracking-[0.2em] uppercase">
            {t("services.ecosystem")}
          </p>
          <div className="flex justify-center gap-6 md:gap-8 flex-wrap items-baseline">
            {brands.map((b) => (
              <span
                key={b.id}
                onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                className="cursor-pointer transition-all duration-300 pb-1"
                style={{
                  fontFamily: b.font,
                  fontWeight: b.weight,
                  fontSize: 18,
                  color: expanded === b.id ? b.color : "hsl(var(--muted-foreground) / 0.55)",
                  letterSpacing: b.spacing,
                  borderBottom: expanded === b.id ? `2px solid ${b.accent}` : "2px solid transparent",
                  opacity: expanded === b.id ? 1 : 0.7,
                }}
              >
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesBento;
