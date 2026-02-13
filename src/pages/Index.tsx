import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronDown } from "lucide-react";
import MenuOverlay from "@/components/MenuOverlay";
import ServicesBento from "@/components/ServicesBento";
import logoClinicaMiro from "@/assets/logo-clinica-miro.png";

const Index = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
      {/* Menu Overlay */}
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="caption text-foreground tracking-widest font-medium">
              CLÍNICA MIRÓ
            </Link>
            <div className="flex items-center gap-6">
              <Link
                to="/portal"
                className="caption text-gold-muted hover:text-gold transition-colors duration-300 tracking-widest"
              >
                Portal Paciente
              </Link>
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
      <section className="min-h-[100svh] md:min-h-[110svh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-12 bg-background dark:bg-[hsl(0,0%,6%)] relative">
        <div className="max-w-7xl mx-auto w-full text-center px-2">
          {/* Primary headline - maximum visual authority */}
          <div className="animate-slide-up" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
            <h1 className="display-institutional text-foreground dark:text-[hsl(30,10%,96%)] relative inline-block leading-[0.95]">
              La odontología del futuro, hoy.
              {/* Subtle gold underline accent */}
              <span 
                className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-gold-muted/50 to-transparent"
                style={{ animation: 'fadeIn 1.5s ease-out 1s forwards', opacity: 0 }}
              />
            </h1>
          </div>
          
          {/* Subheadline - clearly separated, deliberate reading */}
          <div className="mt-12 sm:mt-16 lg:mt-32 animate-slide-up" style={{ animationDelay: "0.8s", animationFillMode: "both" }}>
            <p className="text-sm sm:text-base md:text-lg font-light text-muted-foreground dark:text-[hsl(0,0%,70%)] tracking-[0.05em] sm:tracking-[0.08em] max-w-2xl mx-auto leading-relaxed text-center">
              Aplicamos IA para diagnósticos y tratamientos más precisos, seguros y previsibles. Entiende tu salud dental como nunca antes y llévate un informe detallado de 5 páginas para decidir en familia.
            </p>
            <p className="mt-8 sm:mt-12 text-xl sm:text-2xl md:text-3xl font-serif font-light text-gold tracking-[0.05em] sm:tracking-[0.08em] italic text-center leading-relaxed max-w-2xl mx-auto">
              En Miró te entendemos: sabemos lo que necesitas para recuperar tu sonrisa.
            </p>
          </div>
        </div>
        
        {/* Minimal scroll indicator */}
        <div className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: "1.5s", animationFillMode: "both" }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground/30 animate-gentle-bounce" strokeWidth={1} />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="caption text-muted-foreground mb-6">
                {t("philosophy.caption")}
              </p>
              <h2 className="display-large text-foreground">
                {t("philosophy.headline")}
              </h2>
            </div>
            <div className="space-y-12 lg:pt-24">
              <p className="body-large text-muted-foreground">
                {t("philosophy.p1")}
              </p>
              <p className="body-large text-muted-foreground">
                {t("philosophy.p2")}
              </p>
              <p className="body-large text-foreground">
                {t("philosophy.p3")}
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

      {/* Approach Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="caption text-muted-foreground mb-6">
              {t("approach.caption")}
            </p>
            <h2 className="display-medium text-foreground mb-16">
              {t("approach.headline")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 pt-8">
            <div className="space-y-4">
              <p className="body-small text-foreground">01</p>
              <p className="body-large text-muted-foreground">
                {t("approach.step1")}
              </p>
            </div>
            <div className="space-y-4">
              <p className="body-small text-foreground">02</p>
              <p className="body-large text-muted-foreground">
                {t("approach.step2")}
              </p>
            </div>
            <div className="space-y-4">
              <p className="body-small text-foreground">03</p>
              <p className="body-large text-muted-foreground">
                {t("approach.step3")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Bento Grid */}
      <ServicesBento />

      {/* Vision Section */}
      <section className="py-section px-6 lg:px-12 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="display-large text-foreground">
              {t("vision.headline")}
            </h2>
            <p className="body-large text-muted-foreground max-w-2xl mx-auto">
              {t("vision.subline")}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-12">
            <h2 className="display-large text-foreground">
              {t("cta.headline")}
            </h2>
            <Link 
              to="/evaluation"
              className="inline-block editorial-link body-small text-foreground hover:text-gold tracking-widest transition-colors"
            >
              {t("cta.button")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 lg:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <img src={logoClinicaMiro} alt="Clínica Miró" className="h-16 md:h-20 w-auto" />
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

export default Index;
