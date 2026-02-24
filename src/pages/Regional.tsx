import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import PreEvaluationWizard from "@/components/PreEvaluationWizard";
import MenuOverlay from "@/components/MenuOverlay";
import EditorialQuote from "@/components/EditorialQuote";
import LogoMiro from "@/components/LogoMiro";

const Regional = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (showWizard) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowWizard(false)} className="text-muted-foreground hover:text-gold transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setShowWizard(false)} className="editorial-link">
                  <LogoMiro className="h-12 md:h-14 w-auto" />
                </button>
              </div>
              <div className="flex items-center gap-6">
                <button onClick={() => setLanguage(language === "es" ? "en" : "es")} className="caption text-muted-foreground hover:text-foreground transition-colors">
                  {language === "es" ? "EN" : "ES"}
                </button>
                <button onClick={toggleTheme} className="caption text-muted-foreground hover:text-foreground transition-colors">
                  {theme === "light" ? "Night" : "Day"}
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="pt-20">
          <PreEvaluationWizard origin="regional-international" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-gold transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Link to="/" className="editorial-link">
                <LogoMiro className="h-12 md:h-14 w-auto" />
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => setLanguage(language === "es" ? "en" : "es")} className="caption text-muted-foreground hover:text-foreground transition-colors">
                {language === "es" ? "EN" : "ES"}
              </button>
              <button onClick={toggleTheme} className="caption text-muted-foreground hover:text-foreground transition-colors">
                {theme === "light" ? "Night" : "Day"}
              </button>
              <button onClick={() => setMenuOpen(true)} className="caption text-muted-foreground hover:text-gold transition-colors duration-300">
                {t("menu.open")}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col justify-center px-6 lg:px-12 pt-24 pb-16">
        <div className="max-w-7xl mx-auto w-full">
          <p className="caption text-muted-foreground/60 mb-12">
            {language === "es" ? "Pacientes regionales e internacionales" : "Regional & international patients"}
          </p>
          <h1 className="display-huge text-foreground max-w-5xl">
            {language === "es"
              ? "Tu sonrisa no tiene fronteras"
              : "Your smile has no borders"}
          </h1>
          <p className="mt-16 body-large text-muted-foreground/80 max-w-xl">
            {language === "es"
              ? "Preparamos tu caso antes de que llegues. Evaluación predictiva con IA, coordinación de viaje y agenda optimizada para que aproveches cada día."
              : "We prepare your case before you arrive. Predictive AI evaluation, travel coordination and optimized scheduling so you make the most of every day."}
          </p>
        </div>
      </section>

      <EditorialQuote
        lines={[
          language === "es" ? "Llegas con todo preparado." : "You arrive fully prepared.",
          language === "es" ? "Sin sorpresas, sin esperas." : "No surprises, no waiting.",
        ]}
        goldWord={language === "es" ? "preparado" : "prepared"}
        variant="medium"
      />

      {/* Process */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="caption text-muted-foreground mb-6">
            {language === "es" ? "Cómo funciona" : "How it works"}
          </p>
          <h2 className="display-large text-foreground mb-16">
            {language === "es" ? "Tu proceso en 4 pasos" : "Your process in 4 steps"}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { step: "01", title: language === "es" ? "Pre-evaluación online" : "Online pre-evaluation", desc: language === "es" ? "Completa el cuestionario y sube tu imagen. Nuestra IA analiza tu caso." : "Complete the questionnaire and upload your image. Our AI analyzes your case." },
              { step: "02", title: language === "es" ? "Informe y ruta clínica" : "Report & clinical path", desc: language === "es" ? "Recibes tu pre-diagnóstico con la ruta de tratamiento sugerida." : "Receive your pre-diagnosis with suggested treatment path." },
              { step: "03", title: language === "es" ? "Pago y agenda" : "Payment & scheduling", desc: language === "es" ? "Confirma tu evaluación presencial y agenda tu visita coordinada." : "Confirm your in-person evaluation and schedule your coordinated visit." },
              { step: "04", title: language === "es" ? "Llegada preparada" : "Prepared arrival", desc: language === "es" ? "Llegas con todo listo. Estadía estimada: 3-5 días según complejidad." : "Arrive with everything ready. Estimated stay: 3-5 days depending on complexity." },
            ].map((item) => (
              <div key={item.step} className="space-y-4">
                <span className="text-gold-muted text-4xl font-serif">{item.step}</span>
                <h3 className="body-small text-foreground font-medium">{item.title}</h3>
                <p className="body-small text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-section px-6 lg:px-12 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 max-w-3xl">
            <div className="p-8 border border-border space-y-4">
              <p className="caption text-gold-muted tracking-widest">ONLINE</p>
              <p className="display-small text-foreground">$35.000 CLP</p>
              <p className="body-small text-muted-foreground">
                {language === "es" ? "Pre-evaluación + informe IA + coordinación de viaje" : "Pre-evaluation + AI report + travel coordination"}
              </p>
            </div>
            <div className="p-8 border border-gold-muted/30 bg-gold-muted/5 space-y-4">
              <p className="caption text-gold-muted tracking-widest">PRESENCIAL</p>
              <p className="display-small text-foreground">$49.000 CLP</p>
              <p className="body-small text-muted-foreground">
                {language === "es" ? "Evaluación presencial premium 90 min + plan de tratamiento" : "Premium in-person evaluation 90 min + treatment plan"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="display-medium text-foreground mb-8">
            {language === "es" ? "Comienza tu proceso" : "Start your process"}
          </h2>
          <button
            onClick={() => setShowWizard(true)}
            className="inline-flex items-center justify-center h-14 px-12 bg-gold hover:bg-gold/90 text-background font-medium text-lg rounded-md transition-colors"
          >
            {language === "es" ? "Iniciar pre-evaluación" : "Start pre-evaluation"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 lg:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <Link to="/" className="editorial-link">
                <LogoMiro className="h-10 w-auto" />
              </Link>
              <p className="body-large text-muted-foreground">{t("footer.tagline")}</p>
            </div>
            <div className="text-right space-y-2">
              <p className="caption text-gold-muted">{t("location")}</p>
              <p className="caption text-muted-foreground">© 2025</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Regional;
