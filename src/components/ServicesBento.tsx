import { useLanguage } from "@/contexts/LanguageContext";
import { Scan, Sparkles, Calendar, Shield, Brain, Heart } from "lucide-react";

const services = [
  {
    id: "diagnostic",
    icon: Scan,
    titleKey: "services.diagnostic.title",
    descKey: "services.diagnostic.desc",
    size: "featured", // 2x2
  },
  {
    id: "aesthetic",
    icon: Sparkles,
    titleKey: "services.aesthetic.title",
    descKey: "services.aesthetic.desc",
    size: "wide", // 2x1
  },
  {
    id: "preventive",
    icon: Shield,
    titleKey: "services.preventive.title",
    descKey: "services.preventive.desc",
    size: "normal", // 1x1
  },
  {
    id: "ai",
    icon: Brain,
    titleKey: "services.ai.title",
    descKey: "services.ai.desc",
    size: "normal", // 1x1
  },
  {
    id: "scheduling",
    icon: Calendar,
    titleKey: "services.scheduling.title",
    descKey: "services.scheduling.desc",
    size: "wide", // 2x1
  },
  {
    id: "care",
    icon: Heart,
    titleKey: "services.care.title",
    descKey: "services.care.desc",
    size: "tall", // 1x2
  },
];

const translations: Record<string, Record<string, string>> = {
  es: {
    "services.caption": "Nuestros Servicios",
    "services.headline": "Excelencia en cada detalle",
    "services.diagnostic.title": "Diagnóstico Avanzado",
    "services.diagnostic.desc": "Tomografía 3D, escáner intraoral y análisis predictivo para un diagnóstico preciso antes de cualquier intervención.",
    "services.aesthetic.title": "Estética Dental",
    "services.aesthetic.desc": "Diseño de sonrisa digital, carillas de porcelana y blanqueamiento de última generación.",
    "services.preventive.title": "Prevención",
    "services.preventive.desc": "Programas personalizados de cuidado preventivo.",
    "services.ai.title": "IA Predictiva",
    "services.ai.desc": "Análisis inteligente para anticipar tratamientos.",
    "services.scheduling.title": "Agenda Inteligente",
    "services.scheduling.desc": "Sistema de citas optimizado que respeta tu tiempo. Confirmaciones automáticas y recordatorios personalizados.",
    "services.care.title": "Atención Integral",
    "services.care.desc": "Acompañamiento completo desde la primera consulta hasta el seguimiento post-tratamiento. Tu bienestar es nuestra prioridad.",
  },
  en: {
    "services.caption": "Our Services",
    "services.headline": "Excellence in every detail",
    "services.diagnostic.title": "Advanced Diagnostics",
    "services.diagnostic.desc": "3D tomography, intraoral scanner and predictive analysis for precise diagnosis before any intervention.",
    "services.aesthetic.title": "Dental Aesthetics",
    "services.aesthetic.desc": "Digital smile design, porcelain veneers and state-of-the-art whitening.",
    "services.preventive.title": "Prevention",
    "services.preventive.desc": "Personalized preventive care programs.",
    "services.ai.title": "Predictive AI",
    "services.ai.desc": "Intelligent analysis to anticipate treatments.",
    "services.scheduling.title": "Smart Scheduling",
    "services.scheduling.desc": "Optimized appointment system that respects your time. Automatic confirmations and personalized reminders.",
    "services.care.title": "Comprehensive Care",
    "services.care.desc": "Complete support from the first consultation to post-treatment follow-up. Your wellbeing is our priority.",
  },
};

const ServicesBento = () => {
  const { language } = useLanguage();

  const t = (key: string) => translations[language]?.[key] || translations.es[key] || key;

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "featured":
        return "bento-featured";
      case "wide":
        return "bento-wide";
      case "tall":
        return "bento-tall";
      default:
        return "";
    }
  };

  return (
    <section className="py-section px-6 lg:px-12 bg-secondary">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 lg:mb-24">
          <p className="caption text-gold-muted mb-6">{t("services.caption")}</p>
          <h2 className="display-large text-foreground max-w-2xl">
            {t("services.headline")}
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {services.map((service) => {
            const Icon = service.icon;
            const isFeatured = service.size === "featured";
            
            return (
              <article
                key={service.id}
                className={`
                  ${getSizeClasses(service.size)}
                  group relative overflow-hidden
                  bg-background dark:bg-[hsl(0,0%,8%)]
                  p-6 lg:p-8
                  border border-border
                  transition-all duration-500 ease-out
                  hover:shadow-[var(--shadow-hover)]
                  hover:border-gold-muted/30
                `}
              >
                {/* Subtle gradient overlay on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, hsla(var(--gold), 0.03) 0%, transparent 60%)"
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Icon */}
                  <div className="mb-6">
                    <div 
                      className={`
                        inline-flex items-center justify-center
                        ${isFeatured ? "w-14 h-14" : "w-10 h-10"}
                        border border-gold-muted/30
                        text-gold-muted
                        group-hover:text-gold group-hover:border-gold/50
                        transition-colors duration-300
                      `}
                    >
                      <Icon className={isFeatured ? "w-7 h-7" : "w-5 h-5"} strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Text */}
                  <h3 
                    className={`
                      ${isFeatured ? "display-medium" : "body-large font-medium"}
                      text-foreground mb-3
                    `}
                  >
                    {t(service.titleKey)}
                  </h3>
                  
                  <p 
                    className={`
                      ${isFeatured ? "body-large" : "text-sm"}
                      text-muted-foreground leading-relaxed
                      ${isFeatured ? "" : "line-clamp-3"}
                    `}
                  >
                    {t(service.descKey)}
                  </p>

                  {/* Decorative element for featured card */}
                  {isFeatured && (
                    <div className="mt-auto pt-8">
                      <div className="w-12 h-px bg-gradient-to-r from-gold-muted/50 to-transparent" />
                    </div>
                  )}
                </div>

                {/* Corner accent */}
                <div 
                  className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(225deg, hsla(var(--gold), 0.08) 0%, transparent 70%)"
                  }}
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesBento;
