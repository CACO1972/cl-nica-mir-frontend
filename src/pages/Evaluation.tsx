import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import PreEvaluationWizard from "@/components/PreEvaluationWizard";
import MenuOverlay from "@/components/MenuOverlay";
import EditorialQuote from "@/components/EditorialQuote";
import EvaluationSplash from "@/components/EvaluationSplash";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import logoClinicaMiro from "@/assets/logo-clinica-miro.png";

const SPLASH_SEEN_KEY = "evaluation_splash_seen";

const Evaluation = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Check if splash was already seen this session
  const splashAlreadySeen = sessionStorage.getItem(SPLASH_SEEN_KEY) === "true";
  const [showSplash, setShowSplash] = useState(!splashAlreadySeen);
  const [contentVisible, setContentVisible] = useState(splashAlreadySeen);
  
  // Reveal animation for entry points
  const entryPointsRef = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15, delay: 150 });

  // Hidden keyboard shortcut to reset splash (Ctrl+Shift+R)
  const handleResetSplash = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === "R") {
      e.preventDefault();
      sessionStorage.removeItem(SPLASH_SEEN_KEY);
      setShowSplash(true);
      setContentVisible(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleResetSplash);
    return () => window.removeEventListener("keydown", handleResetSplash);
  }, [handleResetSplash]);

  // Handle splash completion
  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_SEEN_KEY, "true");
    setShowSplash(false);
    // Trigger content entrance animation
    setTimeout(() => setContentVisible(true), 100);
  };

  // If wizard is active, show it full screen
  if (showWizard) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
        {/* Minimal Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowWizard(false)} className="text-muted-foreground hover:text-gold transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setShowWizard(false)} className="editorial-link">
                  <img src={logoClinicaMiro} alt="Clínica Miró" className="h-12 md:h-14 w-auto" />
                </button>
              </div>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setLanguage(language === "es" ? "en" : "es")}
                  className="caption text-muted-foreground hover:text-foreground transition-colors"
                >
                  {language === "es" ? "EN" : "ES"}
                </button>
                <button
                  onClick={toggleTheme}
                  className="caption text-muted-foreground hover:text-foreground transition-colors"
                >
                  {theme === "light" ? "Night" : "Day"}
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="pt-20">
          <PreEvaluationWizard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
      {/* Splash Screen */}
      {showSplash && <EvaluationSplash onComplete={handleSplashComplete} />}

      {/* Menu Overlay */}
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Minimal Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm transition-all duration-1000 ease-out ${
          contentVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-gold transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Link to="/" className="editorial-link">
                <img src={logoClinicaMiro} alt="Clínica Miró" className="h-12 md:h-14 w-auto" />
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setLanguage(language === "es" ? "en" : "es")}
                className="caption text-muted-foreground hover:text-foreground transition-colors"
              >
                {language === "es" ? "EN" : "ES"}
              </button>
              <button
                onClick={toggleTheme}
                className="caption text-muted-foreground hover:text-foreground transition-colors"
              >
                {theme === "light" ? "Night" : "Day"}
              </button>
              <button
                onClick={() => setMenuOpen(true)}
                className="caption text-muted-foreground hover:text-gold transition-colors duration-300"
              >
                {t("menu.open")}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Institutional Declaration */}
      <section 
        className={`min-h-[75vh] flex flex-col justify-center px-6 lg:px-12 pt-24 pb-16 transition-all duration-1000 ease-out delay-200 ${
          contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full">
          {/* Caption - minimal context */}
          <div 
            className={`transition-all duration-700 ease-out ${
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: contentVisible ? "400ms" : "0ms" }}
          >
            <p className="caption text-muted-foreground/60 mb-12">
              {t("eval.caption")}
            </p>
          </div>
          
          {/* Headline - dominant, institutional */}
          <div 
            className={`transition-all duration-700 ease-out ${
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: contentVisible ? "600ms" : "0ms" }}
          >
            <h1 className="display-huge text-foreground max-w-5xl relative">
              {t("eval.headline")}
              {/* Subtle gold editorial line */}
              <span 
                className={`absolute -bottom-6 left-0 w-16 h-px bg-gold-muted/40 transition-all duration-1000 ease-out ${
                  contentVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                }`}
                style={{ transformOrigin: "left", transitionDelay: contentVisible ? "1000ms" : "0ms" }}
              />
            </h1>
          </div>
          
          {/* Subheadline - separated, deliberate */}
          <div 
            className={`mt-20 lg:mt-28 transition-all duration-700 ease-out ${
              contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: contentVisible ? "900ms" : "0ms" }}
          >
            <p className="body-large text-muted-foreground/80 max-w-xl leading-relaxed">
              {t("eval.subline")}
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Quote 1 - After Hero */}
      <EditorialQuote 
        lines={[
          language === "es" ? "Reparar, sonreír, revivir." : "Repair, smile, revive.",
          language === "es" ? "La sonrisa no es la meta. Es el inicio." : "The smile is not the goal. It's the beginning."
        ]}
        goldWord={language === "es" ? "inicio" : "beginning"}
        variant="large"
      />

      {/* What It Is Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="caption text-muted-foreground mb-6">
                {t("eval.what.caption")}
              </p>
              <h2 className="display-large text-foreground">
                {t("eval.what.headline")}
              </h2>
            </div>
            <div className="space-y-12 lg:pt-24">
              <p className="body-large text-muted-foreground">
                {t("eval.what.p1")}
              </p>
              <p className="body-large text-muted-foreground">
                {t("eval.what.p2")}
              </p>
              <p className="body-large text-foreground">
                {t("eval.what.p3")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Break */}
      <section className="py-section-sm px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-gold-muted/40" />
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div>
              <p className="caption text-muted-foreground mb-6">
                {t("eval.why.caption")}
              </p>
              <h2 className="display-medium text-foreground mb-16">
                {t("eval.why.headline")}
              </h2>
            </div>
            <div className="space-y-12 lg:pt-16">
              <p className="body-large text-muted-foreground">
                {t("eval.why.p1")}
              </p>
              <p className="body-large text-muted-foreground">
                {t("eval.why.p2")}
              </p>
              <p className="body-large text-foreground">
                {t("eval.why.p3")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-section px-6 lg:px-12 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <p className="caption text-muted-foreground mb-6">
              {t("eval.includes.caption")}
            </p>
            <h2 className="display-large text-foreground">
              {t("eval.includes.headline")}
            </h2>
          </div>
          
          <div className="space-y-24 max-w-4xl">
            <div className="space-y-6">
              <p className="body-small text-foreground">{t("eval.includes.imaging.title")}</p>
              <p className="body-large text-muted-foreground">
                {t("eval.includes.imaging.desc")}
              </p>
            </div>

            <div className="space-y-6">
              <p className="body-small text-foreground">{t("eval.includes.analysis.title")}</p>
              <p className="body-large text-muted-foreground">
                {t("eval.includes.analysis.desc")}
              </p>
            </div>

            <div className="space-y-6">
              <p className="body-small text-foreground">{t("eval.includes.protocol.title")}</p>
              <p className="body-large text-muted-foreground">
                {t("eval.includes.protocol.desc")}
              </p>
            </div>

            <div className="space-y-6">
              <p className="body-small text-foreground">{t("eval.includes.dialogue.title")}</p>
              <p className="body-large text-muted-foreground">
                {t("eval.includes.dialogue.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Quote 2 - Before How to Begin */}
      <EditorialQuote 
        lines={[
          language === "es" ? "La inteligencia artificial no decide por ti." : "Artificial intelligence doesn't decide for you.",
          language === "es" ? "Ni por nosotros." : "Nor for us.",
          language === "es" ? "Nos permite tener la seguridad de que estamos tomando la mejor decisión posible." : "It allows us the certainty that we're making the best possible decision."
        ]}
        goldWord={language === "es" ? "seguridad" : "certainty"}
        variant="medium"
      />

      {/* Transition pause - from reflection to decision */}
      <section className="py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Editorial Quote 3 - Reflective pause before decision */}
          <div className="mb-32 lg:mb-44 text-center max-w-3xl mx-auto">
            <div className="relative py-16 lg:py-24">
              <div className="absolute left-1/2 -translate-x-1/2 top-0 w-20 h-px bg-gradient-to-r from-transparent via-gold-muted/35 to-transparent" />
              <p 
                className="font-serif font-light text-foreground/85 text-2xl md:text-3xl lg:text-[2.5rem] leading-[1.4]"
              >
                {language === "es" ? (
                  <>Tu sonrisa merece <span className="text-gold-muted/80">atención inteligente</span>.</>
                ) : (
                  <>Your smile deserves <span className="text-gold-muted/80">intelligent care</span>.</>
                )}
              </p>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-20 h-px bg-gradient-to-r from-transparent via-gold-muted/35 to-transparent" />
            </div>
          </div>

          {/* Section header - Decision point */}
          <div className="mb-20 lg:mb-32">
            <p className="caption text-muted-foreground/60 mb-8">
              {t("eval.begin.caption")}
            </p>
            <h2 className="display-large text-foreground">
              {t("eval.begin.headline")}
            </h2>
          </div>

          <div ref={entryPointsRef} className="grid md:grid-cols-2 gap-16 lg:gap-24">
            {/* Pre-Evaluación Predictiva */}
            <div className="space-y-6 reveal-element">
              <h3 className="text-base md:text-lg font-medium tracking-[0.2em] uppercase text-gold-muted hover:text-gold transition-colors duration-500 cursor-default">
                {t("eval.begin.preevaluation.title")}
              </h3>
              <p className="body-large text-muted-foreground">
                {t("eval.begin.preevaluation.desc")}
              </p>
              <button 
                onClick={() => setShowWizard(true)}
                className="editorial-link caption text-muted-foreground hover:text-gold transition-colors tracking-widest"
              >
                {t("eval.begin.preevaluation.cta")}
              </button>
            </div>

            {/* Portal Paciente */}
            <div className="space-y-6 reveal-element">
              <h3 className="text-base md:text-lg font-medium tracking-[0.2em] uppercase text-gold-muted hover:text-gold transition-colors duration-500 cursor-default">
                {t("eval.begin.portal.title")}
              </h3>
              <p className="body-large text-muted-foreground">
                {t("eval.begin.portal.desc")}
              </p>
              <button 
                onClick={() => navigate("/portal")}
                className="editorial-link caption text-muted-foreground hover:text-gold transition-colors tracking-widest"
              >
                {t("eval.begin.portal.cta")}
              </button>
            </div>

            {/* Segunda Opinión */}
            <div className="space-y-6 reveal-element">
              <h3 className="text-base md:text-lg font-medium tracking-[0.2em] uppercase text-gold-muted hover:text-gold transition-colors duration-500 cursor-default">
                {t("eval.begin.opinion.title")}
              </h3>
              <p className="body-large text-muted-foreground">
                {t("eval.begin.opinion.desc")}
              </p>
              <button 
                onClick={() => navigate("/segunda-opinion")}
                className="editorial-link caption text-muted-foreground hover:text-gold transition-colors tracking-widest"
              >
                {t("eval.begin.opinion.cta")}
              </button>
            </div>

            {/* Pacientes Internacionales */}
            <div className="space-y-6 reveal-element">
              <h3 className="text-base md:text-lg font-medium tracking-[0.2em] uppercase text-gold-muted hover:text-gold transition-colors duration-500 cursor-default">
                {t("eval.begin.international.title")}
              </h3>
              <p className="body-large text-muted-foreground">
                {t("eval.begin.international.desc")}
              </p>
              <button 
                onClick={() => navigate("/regional")}
                className="editorial-link caption text-muted-foreground hover:text-gold transition-colors tracking-widest"
              >
                {t("eval.begin.international.cta")}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 lg:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <Link to="/" className="editorial-link">
                <img src={logoClinicaMiro} alt="Clínica Miró" className="h-10 w-auto" />
              </Link>
              <p className="body-large text-muted-foreground">
                {t("footer.tagline")}
              </p>
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

export default Evaluation;
