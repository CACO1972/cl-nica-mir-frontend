import { useLanguage } from "@/contexts/LanguageContext";
import { Scan, Sparkles, Calendar, Shield, Brain, Heart } from "lucide-react";

const services = [
{
  id: "diagnostic",
  icon: Scan,
  titleKey: "services.diagnostic.title",
  descKey: "services.diagnostic.desc",
  size: "featured" // 2x2
},
{
  id: "aesthetic",
  icon: Sparkles,
  titleKey: "services.aesthetic.title",
  descKey: "services.aesthetic.desc",
  size: "wide" // 2x1
},
{
  id: "preventive",
  icon: Shield,
  titleKey: "services.preventive.title",
  descKey: "services.preventive.desc",
  size: "normal" // 1x1
},
{
  id: "ai",
  icon: Brain,
  titleKey: "services.ai.title",
  descKey: "services.ai.desc",
  size: "normal" // 1x1
},
{
  id: "scheduling",
  icon: Calendar,
  titleKey: "services.scheduling.title",
  descKey: "services.scheduling.desc",
  size: "wide" // 2x1
},
{
  id: "care",
  icon: Heart,
  titleKey: "services.care.title",
  descKey: "services.care.desc",
  size: "tall" // 1x2
}];


const translations: Record<string, Record<string, string>> = {
  es: {
    "services.caption": "Miró",
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
    "services.care.desc": "Acompañamiento completo desde la primera consulta hasta el seguimiento post-tratamiento. Tu bienestar es nuestra prioridad."
  },
  en: {
    "services.caption": "Miró",
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
    "services.care.desc": "Complete support from the first consultation to post-treatment follow-up. Your wellbeing is our priority."
  }
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
              <div
                key={service.id}
                className={`bento-card group ${getSizeClasses(service.size)}`}
              >
                <div className={`flex flex-col justify-between h-full ${isFeatured ? 'p-8 lg:p-12' : 'p-6 lg:p-8'}`}>
                  <Icon className={`${isFeatured ? 'w-8 h-8' : 'w-6 h-6'} text-gold-muted mb-4`} strokeWidth={1.5} />
                  <div>
                    <h3 className={`${isFeatured ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'} font-medium text-foreground mb-2`}>
                      {t(service.titleKey)}
                    </h3>
                    <p className={`${isFeatured ? 'body-large' : 'body-small'} text-muted-foreground`}>
                      {t(service.descKey)}
                    </p>
                  </div>
                </div>
              </div>
            );












































































          })}
        </div>
      </div>
    </section>);

};

export default ServicesBento;