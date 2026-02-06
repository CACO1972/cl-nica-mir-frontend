import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import SecondOpinionWizard from "@/components/SecondOpinionWizard";
import MenuOverlay from "@/components/MenuOverlay";
import EditorialQuote from "@/components/EditorialQuote";
import logoClinicaMiro from "@/assets/logo-clinica-miro.png";

const SecondOpinion = () => {
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
                className="editorial-link"
              >
                <img src={logoClinicaMiro} alt="Clínica Miró" className="h-12 md:h-14 w-auto" />
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
          <SecondOpinionWizard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
      {/* Menu Overlay */}
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="editorial-link">
              <img src={logoClinicaMiro} alt="Clínica Miró" className="h-12 md:h-14 w-auto" />
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
      <section className="min-h-[70vh] flex flex-col justify-center px-6 lg:px-12 pt-24 pb-16">
        <div className="max-w-7xl mx-auto w-full">
          <p className="caption text-muted-foreground/60 mb-12">
            {t("opinion.hero.caption")}
          </p>
          <h1 className="display-huge text-foreground max-w-5xl">
            {t("opinion.hero.headline")}
          </h1>
          <p className="mt-16 body-large text-muted-foreground/80 max-w-xl">
            {t("opinion.hero.subline")}
          </p>
        </div>
      </section>

      {/* Editorial Quote */}
      <EditorialQuote 
        lines={[
          language === "es" ? "Tu tranquilidad no debería costar una fortuna." : "Your peace of mind shouldn't cost a fortune.",
          language === "es" ? "Debería costar una segunda mirada." : "It should cost a second look."
        ]}
        goldWord={language === "es" ? "segunda" : "second"}
        variant="medium"
      />

      {/* What It Is Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="caption text-muted-foreground mb-6">
                {t("opinion.what.caption")}
              </p>
              <h2 className="display-large text-foreground">
                {t("opinion.what.headline")}
              </h2>
            </div>
            <div className="space-y-12 lg:pt-24">
              <p className="body-large text-muted-foreground">
                {t("opinion.what.p1")}
              </p>
              <p className="body-large text-muted-foreground">
                {t("opinion.what.p2")}
              </p>
              <p className="body-large text-foreground">
                {t("opinion.what.p3")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Options Section */}
      <section className="py-section px-6 lg:px-12 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <p className="caption text-muted-foreground mb-6">
              {t("opinion.options.caption")}
            </p>
            <h2 className="display-large text-foreground">
              {t("opinion.options.headline")}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl">
            {/* Option 1: IA Only */}
            <div className="space-y-6 p-8 bg-background/50 rounded-xl">
              <h3 className="text-xl font-medium text-foreground">
                {t("opinion.options.ia.title")}
              </h3>
              <p className="body-large text-muted-foreground">
                {t("opinion.options.ia.desc")}
              </p>
              <p className="text-gold text-2xl font-medium">
                {t("opinion.options.ia.price")}
              </p>
            </div>

            {/* Option 2: IA + Specialist */}
            <div className="space-y-6 p-8 bg-background/50 rounded-xl border-2 border-gold-muted/30">
              <h3 className="text-xl font-medium text-foreground">
                {t("opinion.options.specialist.title")}
              </h3>
              <p className="body-large text-muted-foreground">
                {t("opinion.options.specialist.desc")}
              </p>
              <p className="text-gold text-2xl font-medium">
                {t("opinion.options.specialist.price")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="display-medium text-foreground mb-8">
            {t("opinion.cta.headline")}
          </h2>
          <p className="body-large text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t("opinion.cta.subline")}
          </p>
          <button
            onClick={() => setShowWizard(true)}
            className="inline-flex items-center justify-center h-14 px-12 bg-gold hover:bg-gold/90 text-background font-medium text-lg rounded-md transition-colors"
          >
            {t("opinion.cta.button")}
          </button>
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

export default SecondOpinion;
