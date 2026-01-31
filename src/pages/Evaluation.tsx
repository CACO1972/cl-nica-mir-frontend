import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import PreEvaluationWizard from "@/components/PreEvaluationWizard";
import MenuOverlay from "@/components/MenuOverlay";

const Evaluation = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [showWizard, setShowWizard] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // If wizard is active, show it full screen
  if (showWizard) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
        {/* Minimal Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex items-center justify-between h-20">
              <button 
                onClick={() => setShowWizard(false)}
                className="font-serif text-xl tracking-tight editorial-link"
              >
                Clínica Miró
              </button>
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
      {/* Menu Overlay */}
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="font-serif text-xl tracking-tight editorial-link">
              Clínica Miró
            </Link>
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

      {/* Hero Section */}
      <section className="min-h-[60vh] flex flex-col justify-center px-6 lg:px-12 pt-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <p className="caption text-muted-foreground">
              {t("eval.caption")}
            </p>
            <h1 className="display-huge text-foreground max-w-5xl">
              {t("eval.headline")}
            </h1>
            <p className="body-large text-muted-foreground max-w-xl pt-8">
              {t("eval.subline")}
            </p>
          </div>
        </div>
      </section>

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

      {/* How to Begin - 4 Equal Options */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24">
            <p className="caption text-muted-foreground mb-6">
              {t("eval.begin.caption")}
            </p>
            <h2 className="display-large text-foreground">
              {t("eval.begin.headline")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            {/* Pre-Evaluación Predictiva */}
            <div className="space-y-6">
              <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-default">
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
            <div className="space-y-6">
              <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-default">
                {t("eval.begin.portal.title")}
              </h3>
              <p className="body-large text-muted-foreground">
                {t("eval.begin.portal.desc")}
              </p>
              <button className="editorial-link caption text-muted-foreground hover:text-gold transition-colors tracking-widest">
                {t("eval.begin.portal.cta")}
              </button>
            </div>

            {/* Segunda Opinión */}
            <div className="space-y-6">
              <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-default">
                {t("eval.begin.opinion.title")}
              </h3>
              <p className="body-large text-muted-foreground">
                {t("eval.begin.opinion.desc")}
              </p>
              <button className="editorial-link caption text-muted-foreground hover:text-gold transition-colors tracking-widest">
                {t("eval.begin.opinion.cta")}
              </button>
            </div>

            {/* Pacientes Internacionales */}
            <div className="space-y-6">
              <h3 className="text-sm font-medium tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground transition-colors duration-300 cursor-default">
                {t("eval.begin.international.title")}
              </h3>
              <p className="body-large text-muted-foreground">
                {t("eval.begin.international.desc")}
              </p>
              <button className="editorial-link caption text-muted-foreground hover:text-gold transition-colors tracking-widest">
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
              <Link to="/" className="font-serif text-lg editorial-link">
                Clínica Miró
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
