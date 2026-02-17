import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronDown } from "lucide-react";
import MenuOverlay from "@/components/MenuOverlay";
import ServicesBento from "@/components/ServicesBento";
import AIEcosystem from "@/components/AIEcosystem";
import PainPoints from "@/components/PainPoints";
import AudioToggleButton from "@/components/AudioToggleButton";
import { useAutoplayAudio } from "@/hooks/useAutoplayAudio";
import logoClinicaMiro from "@/assets/logo-clinica-miro.png";
import logoHero from "@/assets/logo-clinica-miro-hero.svg";
import logoMDark from "@/assets/logo-m-dark.jpg";
import audioMainSrc from "@/assets/audio_main.mp3";


const Index = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Audio: teaser 3D — autoplay with fade-in on landing
  const heroAudio = useAutoplayAudio({
    src: audioMainSrc,
    autoplay: true,
    fadeInMs: 2000,
    volume: 0.7,
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
      {/* Menu Overlay */}
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center">
              <img
                src={logoMDark}
                alt="Clínica Miró"
                className={`h-10 w-10 rounded-full object-cover object-center transition-all duration-300 ${theme === 'light' ? '[mix-blend-mode:multiply]' : ''}`}
              />
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

      {/* Audio toggle */}
      <AudioToggleButton
        isPlaying={heroAudio.isPlaying}
        blocked={heroAudio.blocked}
        onToggle={heroAudio.toggle}
        onUnblock={heroAudio.play}
        position="bottom-left"
      />

      {/* Hero Section - Institutional Declaration */}
      <section className="min-h-[100svh] md:min-h-[110svh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-12 relative overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto w-full text-center px-2 relative z-10">
          {/* Logo */}
          <div className="animate-slide-up mb-8" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <img src={logoHero} alt="Clínica Miró" className="h-32 sm:h-44 md:h-56 lg:h-64 w-auto mx-auto" />
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
            <h1 className="display-institutional text-foreground dark:text-[hsl(30,10%,96%)] relative inline-block leading-[0.95] text-shadow-subtle">
              No son dientes.
              <br />
              Es dignidad.
              <span 
                className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-gold-muted/50 to-transparent"
                style={{ animation: 'fadeIn 1.5s ease-out 1s forwards', opacity: 0 }}
              />
            </h1>
          </div>
          
          {/* Action triad */}
          <div className="mt-10 sm:mt-14 animate-slide-up" style={{ animationDelay: "0.7s", animationFillMode: "both" }}>
            <p className="text-lg sm:text-2xl md:text-3xl text-gold tracking-[0.15em] text-center" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, letterSpacing: '0.2em' }}>
              Repara · Recupera · Revive
            </p>
          </div>

          {/* Institutional tagline */}
          <div className="mt-12 sm:mt-20 lg:mt-28 animate-slide-up" style={{ animationDelay: "1s", animationFillMode: "both" }}>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground tracking-[0.02em] text-center max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "'Lora', serif", fontWeight: 400, fontStyle: 'italic' }}>
              Miró — La odontología del futuro, hoy.
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
              <h2 className="display-large text-foreground text-shadow-subtle">
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

      {/* Pain Points - Problem → Solution */}
      <PainPoints />

      {/* Editorial Break */}
      <section className="py-section-sm px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-gold-muted/40" />
        </div>
      </section>




      {/* AI Ecosystem Visualization */}
      <AIEcosystem />

      {/* Services Bento Grid */}
      <ServicesBento />

      {/* Vision Section */}
      <section className="py-section px-6 lg:px-12 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="display-large text-foreground text-shadow-subtle">
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
            <h2 className="display-large text-foreground text-shadow-subtle">
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
