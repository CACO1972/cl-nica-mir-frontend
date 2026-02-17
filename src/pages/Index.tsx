import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronDown } from "lucide-react";
import MenuOverlay from "@/components/MenuOverlay";
import ServicesBento from "@/components/ServicesBento";
import AIEcosystem from "@/components/AIEcosystem";
import PainPoints from "@/components/PainPoints";
import FutureVarianceBlock from "@/components/FutureVarianceBlock";
import AudioToggleButton from "@/components/AudioToggleButton";
import { useAutoplayAudio } from "@/hooks/useAutoplayAudio";
import logoClinicaMiro from "@/assets/logo-clinica-miro.png";
import logoHero from "@/assets/logo-clinica-miro-hero.svg";
import logoMiroHeader from "@/assets/logo-miro-header.svg";
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
                src={logoMiroHeader}
                alt="Clínica Miró"
                className="h-14 w-auto object-contain"
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

      {/* Hero Section — Futuristic Clinical Interface */}
      <section className="min-h-[100svh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-12 relative overflow-hidden bg-background">

        {/* Background grid — scanline aesthetic */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {/* Horizontal scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent"
            initial={{ top: "20%", opacity: 0 }}
            animate={{ top: ["20%", "80%", "20%"], opacity: [0, 0.6, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 2 }}
          />
          {/* Corner brackets TL */}
          <motion.div
            className="absolute top-24 left-6 sm:left-12 w-8 h-8 border-t border-l border-gold/20"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Corner brackets BR */}
          <motion.div
            className="absolute bottom-24 right-6 sm:right-12 w-8 h-8 border-b border-r border-gold/20"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Coordinate labels */}
          <motion.span
            className="absolute top-[6.5rem] left-6 sm:left-12 text-[9px] tracking-[0.3em] text-gold/30 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            CL · MR · 2025
          </motion.span>
          <motion.span
            className="absolute bottom-[6rem] right-6 sm:right-12 text-[9px] tracking-[0.3em] text-gold/30 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            AI · v2.0
          </motion.span>
        </div>

        {/* Main content — strict vertical rhythm */}
        <div className="max-w-5xl mx-auto w-full text-center relative z-10 flex flex-col items-center gap-0">

          {/* Status tag — clinical precision */}
          <motion.div
            className="flex items-center gap-2 mb-10"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] tracking-[0.4em] text-gold-muted font-mono uppercase">
              Sistema Activo · Santiago, Chile
            </span>
          </motion.div>

          {/* Logo — centered, breathing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-12"
          >
            <img
              src={logoHero}
              alt="Clínica Miró"
              className="h-28 sm:h-40 md:h-52 lg:h-60 w-auto mx-auto"
            />
          </motion.div>

          {/* Horizontal rule — precise separator */}
          <motion.div
            className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-10"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Headline — absolute declaration */}
          <motion.h1
            className="display-institutional text-foreground leading-[0.92] text-shadow-subtle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            No son dientes.
            <br />
            <span className="italic">Es dignidad.</span>
          </motion.h1>

          {/* Triad — calibrated crescendo */}
          <motion.div
            className="flex items-baseline justify-center gap-3 sm:gap-5 mt-10 sm:mt-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            {[
              { word: "Repara",   size: "text-sm sm:text-base md:text-lg", weight: 300, opacity: 0.5 },
              { word: "Recupera", size: "text-base sm:text-xl md:text-2xl", weight: 400, opacity: 0.75 },
              { word: "Revive",   size: "text-xl sm:text-3xl md:text-4xl", weight: 600, opacity: 1 },
            ].map((item, i) => (
              <motion.span
                key={item.word}
                className={`${item.size} text-gold tracking-[0.2em]`}
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: item.weight, opacity: item.opacity }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: item.opacity, y: 0 }}
                transition={{ delay: 1.35 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {item.word}
                {i < 2 && (
                  <span className="ml-3 sm:ml-5 text-gold/25 font-light">·</span>
                )}
              </motion.span>
            ))}
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="mt-10 text-sm sm:text-base text-muted-foreground tracking-wide max-w-sm mx-auto"
            style={{ fontFamily: "'Lora', serif", fontStyle: "italic" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.8 }}
          >
            La odontología del futuro, hoy.
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.8 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground/30 animate-gentle-bounce" strokeWidth={1} />
        </motion.div>
      </section>

      {/* Bloque 2 — El Problema */}
      <section id="como-trabajamos" className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="caption text-muted-foreground mb-6">El Problema</p>
              <h2 className="display-large text-foreground text-shadow-subtle" style={{ fontFamily: "'Lora', serif" }}>
                Cuando hay duda,<br />hay abandono.
              </h2>
            </div>
            <div className="space-y-8 lg:pt-24">
              <p className="body-large text-muted-foreground">
                Una proporción significativa de tratamientos dentales nunca se completa.
              </p>
              <p className="body-large text-muted-foreground">
                La literatura documenta variabilidad diagnóstica entre profesionales.
              </p>
              <p className="body-large text-muted-foreground">
                América Latina presenta una de las mayores cargas de enfermedad oral del mundo.
              </p>
              <p className="body-large text-foreground font-medium" style={{ fontFamily: "'Lora', serif" }}>
                El problema no es el precio.<br />Es la incertidumbre.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bloque 3 — La Solución */}
      <section className="py-section px-6 lg:px-12 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="caption text-muted-foreground mb-6">La Solución</p>
              <h2 className="display-large text-foreground text-shadow-subtle" style={{ fontFamily: "'Lora', serif" }}>
                Claridad antes de tratarte.
              </h2>
            </div>
            <div className="space-y-8 lg:pt-24">
              <p className="body-large text-muted-foreground">
                En Clínica Miró integramos inteligencia clínica avanzada para:
              </p>
              <ul className="space-y-3">
                {["Estandarizar diagnósticos", "Visualizar tu caso con precisión", "Comparar escenarios de tratamiento", "Reducir variabilidad extrema", "Aumentar transparencia"].map((item) => (
                  <li key={item} className="flex items-center gap-3 body-large text-muted-foreground">
                    <span className="w-1 h-1 rounded-full bg-gold shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="body-large text-foreground font-medium" style={{ fontFamily: "'Lora', serif" }}>
                No reemplazamos al dentista.<br />Lo potenciamos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points — Evidencia */}
      <PainPoints />

      {/* Future Variance Block */}
      <FutureVarianceBlock />

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

      {/* Vision + CTA Section */}
      <section className="py-section px-6 lg:px-12 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="display-large text-foreground text-shadow-subtle" style={{ fontFamily: "'Lora', serif" }}>
              Tu sonrisa merece decisiones informadas.
            </h2>
            <p className="body-large text-muted-foreground max-w-2xl mx-auto">
              No te vendemos un tratamiento.<br />Te ayudamos a entender tu caso.
            </p>
            <Link
              to="/evaluation"
              className="inline-block px-10 py-4 bg-gold text-background text-sm tracking-widest caption hover:bg-gold-muted transition-colors duration-300"
            >
              Empezar evaluación guiada
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
