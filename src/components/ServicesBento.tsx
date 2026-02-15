import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Shield, Smile, Heart, Sparkles, Zap, ArrowRight } from "lucide-react";

const services = [
  {
    id: "implant",
    icon: Shield,
    titleKey: "services.implant.title",
    descKey: "services.implant.desc",
    ctaKey: "services.implant.cta",
    size: "featured",
    link: "/evaluation",
  },
  {
    id: "simetria",
    icon: Smile,
    titleKey: "services.simetria.title",
    descKey: "services.simetria.desc",
    ctaKey: "services.simetria.cta",
    size: "wide",
    link: "/evaluation",
  },
  {
    id: "sentia",
    icon: Heart,
    titleKey: "services.sentia.title",
    descKey: "services.sentia.desc",
    size: "tall",
  },
  {
    id: "orthopro",
    icon: Sparkles,
    titleKey: "services.orthopro.title",
    descKey: "services.orthopro.desc",
    ctaKey: "services.orthopro.cta",
    size: "normal",
    link: "/evaluation",
  },
  {
    id: "zerocaries",
    icon: Zap,
    titleKey: "services.zerocaries.title",
    descKey: "services.zerocaries.desc",
    ctaKey: "services.zerocaries.cta",
    size: "normal",
    link: "/evaluation",
  },
];

const translations: Record<string, Record<string, string>> = {
  es: {
    "services.caption": "Tratamientos Exclusivos",
    "services.headline": "Excelencia en cada detalle",
    "services.subline": "Cinco protocolos exclusivos. Cada uno con identidad propia, respaldados por inteligencia artificial y 27 años de experiencia clínica.",
    "services.implant.title": "Implant ONE",
    "services.implant.desc": "Rehabilitación implantológica inmediata con planificación digital 3D y carga en el mismo día. Cirugía guiada por computador.",
    "services.implant.cta": "Iniciar evaluación",
    "services.simetria.title": "Simetría",
    "services.simetria.desc": "Análisis y planificación de armonía dentofacial. Diseño de sonrisa con proporciones faciales y simulación digital.",
    "services.simetria.cta": "Conocer más",
    "services.sentia.title": "Sentia",
    "services.sentia.desc": "Bruxismo, ansiedad dental y trastornos del sueño asociados. Enfoque multidisciplinario con seguimiento emocional del paciente.",
    "services.orthopro.title": "OrthoPro",
    "services.orthopro.desc": "Simulación de sonrisa, comparación de brackets, estimación de duración y riesgo de recidiva.",
    "services.orthopro.cta": "Simular sonrisa",
    "services.zerocaries.title": "ZeroCaries",
    "services.zerocaries.desc": "Tratamiento de caries pequeñas sin dolor con tecnología Curodont. Sin anestesia, sin fresa.",
    "services.zerocaries.cta": "Conocer más",
  },
  en: {
    "services.caption": "Exclusive Treatments",
    "services.headline": "Excellence in every detail",
    "services.subline": "Five exclusive protocols. Each with its own identity, backed by artificial intelligence and 27 years of clinical experience.",
    "services.implant.title": "Implant ONE",
    "services.implant.desc": "Immediate implant rehabilitation with 3D digital planning and same-day loading. Computer-guided surgery.",
    "services.implant.cta": "Start evaluation",
    "services.simetria.title": "Simetría",
    "services.simetria.desc": "Dentofacial harmony analysis and planning. Smile design with facial proportions and digital simulation.",
    "services.simetria.cta": "Learn more",
    "services.sentia.title": "Sentia",
    "services.sentia.desc": "Bruxism, dental anxiety and associated sleep disorders. Multidisciplinary approach with emotional patient follow-up.",
    "services.orthopro.title": "OrthoPro",
    "services.orthopro.desc": "Smile simulation, bracket comparison, treatment duration estimation and relapse risk assessment.",
    "services.orthopro.cta": "Simulate smile",
    "services.zerocaries.title": "ZeroCaries",
    "services.zerocaries.desc": "Painless treatment of small cavities with Curodont technology. No anesthesia, no drill.",
    "services.zerocaries.cta": "Learn more",
  },
};

const ServicesBento = () => {
  const { language } = useLanguage();

  const t = (key: string) => translations[language]?.[key] || translations.es[key] || key;

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "featured": return "bento-featured";
      case "wide": return "bento-wide";
      case "tall": return "bento-tall";
      default: return "";
    }
  };

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

        {/* Bento Grid */}
        <div className="bento-grid">
          {services.map((service) => {
            const Icon = service.icon;
            const isFeatured = service.size === "featured";
            const hasLink = !!service.link;

            const cardContent = (
              <div className={`flex flex-col justify-between h-full ${isFeatured ? 'p-8 lg:p-12' : 'p-6 lg:p-8'}`}>
                <div className="flex items-start justify-between">
                  <Icon
                    className={`${isFeatured ? 'w-8 h-8' : 'w-6 h-6'} text-gold-muted mb-4 transition-colors duration-300 ${hasLink ? 'group-hover:text-gold' : ''}`}
                    strokeWidth={1.5}
                  />
                  {hasLink && (
                    <ArrowRight
                      className="w-4 h-4 text-gold/0 group-hover:text-gold transition-all duration-500 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <div>
                  <h3 className={`${
                    hasLink
                      ? (isFeatured ? 'text-3xl lg:text-4xl' : 'text-xl lg:text-2xl')
                      : (isFeatured ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl')
                  } font-medium text-foreground text-shadow-subtle mb-3 leading-tight`}>
                    {t(service.titleKey)}
                  </h3>
                  <p className={`${isFeatured ? 'body-large' : 'body-small'} text-muted-foreground`}>
                    {t(service.descKey)}
                  </p>
                  {hasLink && service.ctaKey && (
                    <p className="mt-5 flex items-center gap-2 text-gold tracking-widest text-xs uppercase font-medium editorial-link">
                      {t(service.ctaKey)}
                    </p>
                  )}
                </div>
              </div>
            );

            const baseClasses = `bento-card group ${getSizeClasses(service.size)}`;

            if (hasLink) {
              return (
                <Link
                  key={service.id}
                  to={service.link!}
                  className={`${baseClasses} bento-card-interactive`}
                >
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={service.id} className={baseClasses}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesBento;
