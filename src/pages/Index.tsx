import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowRight } from "lucide-react";
import MenuOverlay from "@/components/MenuOverlay";
import AudioToggleButton from "@/components/AudioToggleButton";
import PathTransition from "@/components/PathTransition";
import { useAutoplayAudio } from "@/hooks/useAutoplayAudio";
import logoMiro from "@/assets/logo-definitivo.svg";
import logoHero from "@/assets/logo-definitivo.svg";
import audioMainSrc from "@/assets/audio_main.mp3";

// ─── Types ────────────────────────────────────────────────────────────────────
type PathKey = "segunda-opinion" | "nuevo" | "regional" | "portal";

interface PathOption {
  key: PathKey;
  via: string;
  title: string;
  desc: string;
  route: string;
  lines: [string, string, string];
}

// ─── Shared fade-up animation helper ─────────────────────────────────────────
const fadeUpProps = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

// ─── Audio Hint ───────────────────────────────────────────────────────────────
const AudioHint = ({ language }: { language: string }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const label = language === "es" ? "Escucha la experiencia" : "Listen to the experience";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-8 left-[4.5rem] z-50 flex items-center gap-2 pointer-events-none"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ delay: 1.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Arrow pointing left toward the button */}
          <motion.div
            className="w-4 h-px bg-gold/60"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2, duration: 0.4 }}
            style={{ transformOrigin: "right" }}
          />
          <motion.span
            className="text-[10px] tracking-[0.25em] text-gold/80 font-mono uppercase whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.7] }}
            transition={{ delay: 2.1, duration: 2.5, times: [0, 0.2, 0.7, 1] }}
          >
            {label}
          </motion.span>
          {/* Pulsing dot */}
          <motion.span
            className="w-1 h-1 rounded-full bg-gold/70"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── ScanLine decoration ──────────────────────────────────────────────────────
const ScanLine = () => (
  <motion.div
    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent pointer-events-none"
    initial={{ top: "10%", opacity: 0 }}
    animate={{ top: ["10%", "90%", "10%"], opacity: [0, 0.8, 0] }}
    transition={{ duration: 9, repeat: Infinity, ease: "linear", delay: 2.5 }}
  />
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Index = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [transition, setTransition] = useState<{ active: boolean; path: PathOption | null }>({
    active: false,
    path: null,
  });

  const heroAudio = useAutoplayAudio({
    src: audioMainSrc,
    autoplay: true,
    fadeInMs: 2000,
    volume: 0.6,
  });

  const pathsRef = useRef<HTMLElement>(null);

  const scrollToPaths = () => {
    pathsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const paths: PathOption[] = [
    {
      key: "segunda-opinion",
      via: "01",
      title: language === "es" ? "Segunda Opinión" : "Second Opinion",
      desc: language === "es"
        ? "Valida tu diagnóstico actual con nuestra IA clínica."
        : "Validate your current diagnosis with our clinical AI.",
      route: "/segunda-opinion",
      lines: language === "es"
        ? [
            "¿Te dieron diagnósticos distintos y no sabes cuál es el correcto?",
            "Antes de tratarte, entiende tu caso con claridad clínica y visual.",
            "Reparar, sonreír, revivir.",
          ]
        : [
            "Were you given conflicting diagnoses and don't know which is right?",
            "Before treatment, understand your case with clinical and visual clarity.",
            "Repair, smile, revive.",
          ],
    },
    {
      key: "nuevo",
      via: "02",
      title: language === "es" ? "Paciente Nuevo" : "New Patient",
      desc: language === "es"
        ? "Evaluación integral bajo protocolo predictivo 3.0."
        : "Comprehensive evaluation under predictive protocol 3.0.",
      route: "/evaluation",
      lines: language === "es"
        ? [
            "¿Llevas tiempo postergando ir al dentista por no saber qué esperar?",
            "Tu evaluación empieza aquí: sin presión, con total claridad.",
            "Saber es el primer paso.",
          ]
        : [
            "Have you been putting off going to the dentist, unsure of what to expect?",
            "Your evaluation starts here: no pressure, total clarity.",
            "Knowing is the first step.",
          ],
    },
    {
      key: "regional",
      via: "03",
      title: language === "es" ? "Región / Exterior" : "Region / International",
      desc: language === "es"
        ? "Tele-odontología y pre-análisis para pacientes remotos."
        : "Tele-dentistry and pre-analysis for remote patients.",
      route: "/regional",
      lines: language === "es"
        ? [
            "¿Estás lejos de Santiago pero necesitas un diagnóstico real?",
            "La distancia no define tu acceso a una atención de calidad.",
            "Dondequiera que estés.",
          ]
        : [
            "Are you far from Santiago but need a real diagnosis?",
            "Distance doesn't define your access to quality care.",
            "Wherever you are.",
          ],
    },
    {
      key: "portal",
      via: "04",
      title: language === "es" ? "Ya soy Paciente" : "I'm a Patient",
      desc: language === "es"
        ? "Acceso directo a tu historial, citas y evolución."
        : "Direct access to your records, appointments and progress.",
      route: "/portal",
      lines: language === "es"
        ? [
            "Bienvenido de vuelta.",
            "Tu historial, tus citas y tu evolución, en un solo lugar.",
            "Tu salud, siempre contigo.",
          ]
        : [
            "Welcome back.",
            "Your records, appointments, and progress — all in one place.",
            "Your health, always with you.",
          ],
    },
  ];

  const handlePathClick = useCallback((path: PathOption) => {
    setTransition({ active: true, path });
  }, []);

  const handleTransitionComplete = useCallback(() => {
    if (transition.path) {
      navigate(transition.path.route);
    }
  }, [transition.path, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Transition overlay */}
      {transition.path && (
        <PathTransition
          isVisible={transition.active}
          lines={transition.path.lines}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-18 sm:h-20">
            <Link to="/">
              <img src={logoMiro} alt="Clínica Miró" className="h-14 sm:h-16 w-auto" />
            </Link>
            <div className="flex items-center gap-5 sm:gap-7">
              <button
                onClick={() => setLanguage(language === "es" ? "en" : "es")}
                className="text-xs tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {language === "es" ? "EN" : "ES"}
              </button>
              <button
                onClick={toggleTheme}
                className="text-xs tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {theme === "light" ? "Night" : "Day"}
              </button>
              <button
                onClick={() => setMenuOpen(true)}
                className="text-xs tracking-[0.2em] text-foreground hover:text-gold transition-colors font-medium"
              >
                {t("menu.open")}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Audio hint tooltip */}
      <AudioHint language={language} />

      <AudioToggleButton
        isPlaying={heroAudio.isPlaying}
        blocked={heroAudio.blocked}
        onToggle={heroAudio.toggle}
        onUnblock={heroAudio.play}
        position="bottom-left"
      />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="min-h-[100svh] flex flex-col justify-center items-center px-5 sm:px-8 lg:px-12 relative overflow-hidden bg-background">
        <ScanLine />

        <motion.div
          className="absolute top-24 left-5 sm:left-12 w-7 h-7 border-t border-l border-gold/20"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />
        <motion.div
          className="absolute bottom-24 right-5 sm:right-12 w-7 h-7 border-b border-r border-gold/20"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />

        <div className="max-w-4xl mx-auto w-full text-center flex flex-col items-center">

          {/* Status pill */}
          <motion.div className="flex items-center gap-2 mb-8" {...fadeUpProps(0.1)}>
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[10px] sm:text-xs tracking-[0.35em] text-gold font-mono uppercase opacity-80">
              Humana.AI · Santiago, Chile
            </span>
          </motion.div>

          {/* Logo hero */}
          <motion.div {...fadeUpProps(0.2)} className="mb-8 sm:mb-10">
            <img
              src={logoHero}
              alt="Clínica Miró"
              className="h-40 sm:h-56 md:h-72 lg:h-96 w-auto mx-auto"
            />
          </motion.div>

          {/* Separator */}
          <motion.div
            className="w-32 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-8 sm:mb-10"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          />

          {/* Headline */}
          <motion.h1
            className="text-foreground leading-[0.9] tracking-[-0.02em] mb-8"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(3rem, 10vw, 8rem)",
              fontWeight: 300,
            }}
            {...fadeUpProps(0.75)}
          >
            {language === "es" ? (
              <>No son dientes.<br /><em>Es dignidad.</em></>
            ) : (
              <>Not teeth.<br /><em>Dignity.</em></>
            )}
          </motion.h1>

          {/* Sub */}
          <motion.p
            className="text-foreground/70 text-base sm:text-lg max-w-lg mx-auto mb-12 sm:mb-16 leading-relaxed font-light"
            {...fadeUpProps(0.95)}
          >
            {language === "es"
              ? "30 años de experiencia clínica, potenciados con IA, para diagnósticos más precisos, tratamientos más seguros y resultados más predecibles."
              : "30 years of clinical expertise, enhanced with AI, for more precise diagnoses, safer treatments and more predictable results."}
          </motion.p>

          {/* Primary CTA */}
          <motion.button
            onClick={scrollToPaths}
            className="group flex items-center gap-3 px-10 py-4 border border-gold/60 text-gold hover:bg-gold hover:text-background transition-all duration-500 text-xs tracking-[0.35em] uppercase font-medium"
            {...fadeUpProps(1.1)}
          >
            {language === "es" ? "Comenzar" : "Begin"}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4 VÍAS — Selector directo al flujo
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={pathsRef}
        className="py-24 sm:py-32 px-5 sm:px-8 lg:px-12 relative overflow-hidden bg-secondary"
      >
        {/* Subtle background text */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          <span
            className="text-foreground/[0.015] font-mono tracking-widest whitespace-nowrap"
            style={{ fontSize: "clamp(4rem, 18vw, 18rem)", fontWeight: 700 }}
          >
            HUMANA.AI
          </span>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="mb-14 sm:mb-18"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-xs tracking-[0.35em] text-muted-foreground font-mono uppercase mb-4">
              {language === "es" ? "¿Cómo puedo ayudarte hoy?" : "How can I help you today?"}
            </p>
            <h2
              className="text-foreground"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              {language === "es"
                ? <>Elige tu camino.<br /><em>Te guiamos desde aquí.</em></>
                : <>Choose your path.<br /><em>We guide you from here.</em></>}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {paths.map((path, i) => (
              <motion.button
                key={path.key}
                onClick={() => handlePathClick(path)}
                className="group relative text-left p-7 sm:p-8 border border-border/60 hover:border-gold/60 hover:bg-gold/[0.04] transition-all duration-400"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Via number */}
                <span className="block text-[10px] tracking-[0.4em] text-gold/70 font-mono mb-4 font-medium">
                  VÍA {path.via}
                </span>

                {/* Title */}
                <h3 className="text-foreground text-base sm:text-lg font-medium mb-3 group-hover:text-gold transition-colors duration-300 leading-snug">
                  {path.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {path.desc}
                </p>

                {/* Arrow CTA */}
                <span className="flex items-center gap-2 text-xs tracking-[0.25em] text-gold/80 group-hover:text-gold transition-colors duration-300 uppercase font-medium">
                  <span>{language === "es" ? "Entrar" : "Enter"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>

                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold/0 group-hover:bg-gold/50 transition-all duration-400" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="py-10 sm:py-14 px-5 sm:px-8 lg:px-12 border-t border-border/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <img src={logoMiro} alt="Clínica Miró" className="h-12 w-auto opacity-80" />
            <p className="text-xs tracking-[0.2em] text-muted-foreground font-mono uppercase">
              {language === "es" ? "Odontología Predictiva · Humana.AI" : "Predictive Dentistry · Humana.AI"}
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs tracking-[0.25em] text-gold/70 font-mono uppercase">{t("location")}</p>
            <p className="text-xs tracking-[0.2em] text-muted-foreground/60 font-mono">© 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

