import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowLeft, ArrowRight } from "lucide-react";
import MenuOverlay from "@/components/MenuOverlay";
import LogoMiro from "@/components/LogoMiro";
import logoFull from "@/assets/logo-clinica-miro-full.png";

import PreEvaluationWizard from "@/components/PreEvaluationWizard";
import HeroSplash, { shouldShowHeroSplash, markHeroSplashSeen } from "@/components/HeroSplash";
import PathAudioButton from "@/components/PathAudioButton";


// ─── Types ────────────────────────────────────────────────────────────────────
type PathKey = "segunda-opinion" | "nuevo" | "regional" | "portal";

interface PathOption {
  key: PathKey;
  via: string;
  title: string;
  desc: string;
  route: string;
}

// ─── Shared fade-up animation helper (inline, avoids Variants typing issues) ──
const fadeUpProps = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

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
  const [selectedPath, setSelectedPath] = useState<PathKey | null>(null);
  const [activeWizard, setActiveWizard] = useState<"nuevo" | "regional" | null>(null);
  const [showSplash, setShowSplash] = useState(shouldShowHeroSplash);




  const pathsRef = useRef<HTMLElement>(null);

  const scrollToPaths = () => {
    pathsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const paths: PathOption[] = [
    {
      key: "segunda-opinion",
      via: "01",
      title: language === "es" ? "Segunda Opinión" : "Second Opinion",
      desc:
        language === "es"
          ? "Valida tu diagnóstico actual con nuestra IA clínica."
          : "Validate your current diagnosis with our clinical AI.",
      route: "/segunda-opinion",
    },
    {
      key: "nuevo",
      via: "02",
      title: language === "es" ? "Paciente Nuevo" : "New Patient",
      desc:
        language === "es"
          ? "Evaluación integral bajo protocolo predictivo 3.0."
          : "Comprehensive evaluation under predictive protocol 3.0.",
      route: "/evaluation",
    },
    {
      key: "regional",
      via: "03",
      title: language === "es" ? "Región / Exterior" : "Region / International",
      desc:
        language === "es"
          ? "Tele-odontología y pre-análisis para pacientes remotos."
          : "Tele-dentistry and pre-analysis for remote patients.",
      route: "/regional",
    },
    {
      key: "portal",
      via: "04",
      title: language === "es" ? "Ya soy Paciente" : "I'm a Patient",
      desc:
        language === "es"
          ? "Acceso directo a tu historial, citas y evolución."
          : "Direct access to your records, appointments and progress.",
      route: "/portal",
    },
  ];

  // Narration texts for ElevenLabs TTS per path
  const pathNarrations: Record<PathKey, string> = {
    "segunda-opinion":
      language === "es"
        ? "Si ya tienes un diagnóstico y quieres validarlo antes de decidir, esta vía es para ti. Nuestra inteligencia artificial analiza tu caso y lo contrasta con protocolos clínicos documentados, para que tomes una decisión informada, con claridad y sin presiones."
        : "If you already have a diagnosis and want to validate it before deciding, this path is for you. Our AI analyzes your case against documented clinical protocols, so you can make an informed decision with clarity.",
    "nuevo":
      language === "es"
        ? "Si es tu primera vez o buscas una evaluación completa, aquí comienza todo. Un protocolo integral que combina treinta años de experiencia clínica con inteligencia artificial, para un diagnóstico preciso y un plan de tratamiento personalizado."
        : "If it's your first time or you're looking for a comprehensive evaluation, this is where it all begins. A protocol combining thirty years of clinical experience with AI for a precise diagnosis and personalized treatment plan.",
    "regional":
      language === "es"
        ? "Si vives fuera de Santiago o en el extranjero, esta vía te permite acceder a una tele-evaluación con pre-análisis de inteligencia artificial. Optimizamos tu viaje para que cuando llegues a la clínica, ya tengamos un diagnóstico preliminar listo."
        : "If you live outside Santiago or abroad, this path gives you access to a tele-evaluation with AI pre-analysis. We optimize your trip so that when you arrive at the clinic, we already have a preliminary diagnosis ready.",
    "portal":
      language === "es"
        ? "Si ya eres paciente de Clínica Miró, accede directamente a tu historial clínico, tus citas, documentos y la evolución de tu tratamiento. Todo en un solo lugar, con total transparencia."
        : "If you're already a Clínica Miró patient, access your clinical history, appointments, documents, and treatment progress directly. Everything in one place, with full transparency.",
  };

  const pillars = [
    {
      num: "01",
      title: language === "es" ? "Cero Incertidumbre" : "Zero Uncertainty",
      desc:
        language === "es"
          ? "Nuestra IA contrasta tu caso contra miles de protocolos documentados. El diagnóstico deja de ser opinión."
          : "Our AI cross-references your case against thousands of documented protocols. Diagnosis stops being an opinion.",
    },
    {
      num: "02",
      title: language === "es" ? "Comprensión Visual" : "Visual Understanding",
      desc:
        language === "es"
          ? "Ves lo mismo que el especialista. Cuando entiendes, confías. Cuando confías, decides."
          : "You see exactly what the specialist sees. When you understand, you trust. When you trust, you decide.",
    },
    {
      num: "03",
      title: language === "es" ? "Resultado Predecible" : "Predictable Result",
      desc:
        language === "es"
          ? "Diseñamos el resultado antes de intervenir. Planificación digital sin sorpresas."
          : "We design the outcome before intervening. Digital planning with no surprises.",
    },
  ];




  // ── Splash screen ──────────────────────────────────────────────────────
  if (showSplash) {
    return (
      <HeroSplash
        onComplete={() => {
          setShowSplash(false);
        }}
      />
    );
  }

  // ── Wizard inline mode ────────────────────────────────────────────────────
  if (activeWizard) {
    const wizardOrigin = activeWizard === "regional" ? "regional-international" : "pre-evaluation-wizard";
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/20">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex items-center justify-between h-18 sm:h-20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveWizard(null)}
                  className="text-muted-foreground hover:text-gold transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button onClick={() => setActiveWizard(null)}>
                  <LogoMiro className="h-12 sm:h-14 w-auto" />
                </button>
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
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
          <PreEvaluationWizard origin={wizardOrigin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden scrollbar-hide">
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-18 sm:h-20">
            <Link to="/">
              <LogoMiro className="h-12 sm:h-14 w-auto" />
            </Link>
             <div className="flex items-center gap-3 sm:gap-6">
               {/* Deep link - desktop only */}
               <Link
                 to="/evaluation"
                 className="hidden lg:block caption text-muted-foreground hover:text-foreground transition-colors tracking-[0.2em] border-b border-transparent hover:border-muted-foreground/30"
               >
                 {language === "es" ? "Filosofía & Ciencia →" : "Philosophy & Science →"}
               </Link>
               {/* Language & theme - hidden on small mobile, visible in menu */}
               <button
                 onClick={() => setLanguage(language === "es" ? "en" : "es")}
                 className="hidden sm:block caption text-muted-foreground hover:text-foreground transition-colors"
               >
                 {language === "es" ? "EN" : "ES"}
               </button>
               <button
                 onClick={toggleTheme}
                 className="hidden sm:block caption text-muted-foreground hover:text-foreground transition-colors"
               >
                 {theme === "light" ? "Night" : "Day"}
               </button>
               <button
                 onClick={() => setMenuOpen(true)}
                 className="caption text-muted-foreground hover:text-gold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
               >
                 {t("menu.open")}
               </button>
             </div>
          </div>
        </div>
      </header>




      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Máximo impacto, mínimo texto
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="min-h-[100svh] flex flex-col justify-center items-center px-5 sm:px-8 lg:px-12 relative overflow-hidden bg-black">
      {/* Ambient video background — sin overlay, sin fade */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            src="/videos/ambient-ai.mp4"
          />
        </div>
        <ScanLine />

        {/* Brackets decoration */}
        <motion.div
          className="absolute top-24 left-5 sm:left-12 w-7 h-7 border-t border-l border-gold/15"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        />
        <motion.div
          className="absolute bottom-24 right-5 sm:right-12 w-7 h-7 border-b border-r border-gold/15"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />

        <div className="max-w-4xl mx-auto w-full text-center flex flex-col items-center">

          {/* Status pill */}
          <motion.div
            className="flex items-center gap-2 mb-8"
            {...fadeUpProps(0.1)}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
             <span className="text-[10px] sm:text-xs tracking-[0.3em] text-white/80 font-mono uppercase">
               Humana.AI · Santiago, Chile
            </span>
          </motion.div>

          {/* Logo */}
          <motion.div
            {...fadeUpProps(0.2)}
            className="mb-8 sm:mb-10"
          >
            <img src={logoFull} alt="Clínica Miró" className="h-48 sm:h-72 md:h-96 lg:h-[28rem] w-auto mx-auto" />
          </motion.div>

          {/* Separator */}
          <motion.div
            className="w-32 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent mb-8 sm:mb-10"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          />

          {/* Headline — bold Overjet-inspired */}
          <motion.h1
            className="text-white leading-[0.95] tracking-[-0.03em] mb-6"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(2.2rem, 8vw, 5.5rem)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 20px rgba(0,0,0,0.6)",
            }}
            {...fadeUpProps(0.75)}
          >
          {language === "es" ? (
              <>No son dientes.<br />Es dignidad.</>
            ) : (
              <>It's not teeth.<br />It's dignity.</>
            )}
          </motion.h1>

          {/* Sub-headline — serif editorial contrast */}
          <motion.p
            className="text-white mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.1rem, 3vw, 1.6rem)",
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.3,
              textShadow: "0 1px 12px rgba(0,0,0,0.5)",
            }}
            {...fadeUpProps(0.9)}
          >
            {language === "es"
              ? "30 años de experiencia clínica, ahora potenciados con IA."
              : "30 years of clinical experience, now powered by AI."}
          </motion.p>

          {/* Sub — one punchy sentence */}
          <motion.p
            className="text-white/90 text-base sm:text-lg max-w-xs sm:max-w-lg mx-auto mb-10 sm:mb-14 leading-relaxed"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.4)" }}
            {...fadeUpProps(1.1)}
          >
            {language === "es"
              ? "Esta evolución nos permite brindar diagnósticos más precisos, tratamientos más seguros y resultados más predecibles."
              : "This evolution allows us to deliver more precise diagnoses, safer treatments, and more predictable outcomes."}
          </motion.p>

          {/* Primary CTA */}
          <motion.button
            onClick={scrollToPaths}
             className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 h-12 border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-500 text-sm sm:text-base tracking-[0.2em] uppercase font-semibold"
             {...fadeUpProps(1.2)}
          >
            {language === "es" ? "Comenzar experiencia" : "Begin experience"}
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Depth link */}
          <motion.div
            className="mt-8"
            {...fadeUpProps(1.5)}
          >
            <Link
              to="/evaluation"
               className="text-xs tracking-[0.2em] text-white/60 hover:text-white/80 transition-colors uppercase border-b border-white/30 hover:border-white/50 pb-0.5"
            >
              {language === "es" ? "Leer sobre nuestra ciencia →" : "Read about our science →"}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3 PILARES — Cómo funciona la IA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-5 sm:px-8 lg:px-12 bg-secondary">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <motion.div
            className="mb-16 sm:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
             <p className="text-xs sm:text-sm tracking-[0.3em] text-muted-foreground font-mono uppercase mb-3">
               {language === "es" ? "Por qué somos diferentes" : "Why we're different"}
            </p>
            <h2
              className="text-foreground"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              {language === "es"
                ? <>Tu salud merece datos,<br /><em>no dudas.</em></>
                : <>Your health deserves data,<br /><em>not doubts.</em></>}
            </h2>
          </motion.div>

          {/* Pillars grid */}
          <div className="grid sm:grid-cols-3 gap-8 lg:gap-12">
            {pillars.map((p, i) => (
              <motion.div
                key={p.num}
                className="relative pl-5 border-l border-gold/25 space-y-3"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                 <span className="text-xs tracking-[0.3em] text-gold font-mono">{p.num}</span>
                 <h3 className="text-foreground text-base sm:text-lg font-medium tracking-wide">{p.title}</h3>
                 <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Video interlude — dashboard AI ──────────────────────────────────── */}
      <section className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          src="/videos/ambient-dashboard.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/30 to-background" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <motion.p
            className="text-xs sm:text-sm tracking-[0.4em] text-gold font-mono uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            {language === "es" ? "Análisis en tiempo real" : "Real-time analysis"}
          </motion.p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4 VÍAS — Selector de perfil de atención
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={pathsRef}
        className="py-24 sm:py-32 px-5 sm:px-8 lg:px-12 relative overflow-hidden"
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
             <p className="text-xs sm:text-sm tracking-[0.3em] text-muted-foreground font-mono uppercase mb-3">
               {language === "es" ? "Selecciona tu perfil" : "Select your profile"}
            </p>
            <h2
              className="text-foreground"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                fontWeight: 400,
                lineHeight: 1.1,
              }}
            >
              {language === "es" ? "¿Cómo podemos ayudarte?" : "How can we help you?"}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
             {paths.map((path, i) => (
               <motion.button
                 key={path.key}
               onClick={() => {
                   if (path.key === "nuevo") {
                     setActiveWizard("nuevo");
                   } else if (path.key === "regional") {
                     setActiveWizard("regional");
                   } else {
                     navigate(path.route);
                   }
                 }}
                 className={`group relative text-left p-5 sm:p-6 border rounded-lg bg-card shadow-brand-sm transition-all duration-400 ${
                   selectedPath === path.key
                     ? "border-gold bg-gold/5 shadow-brand-md"
                     : "border-border hover:border-gold/50 hover:shadow-brand-md"
                 }`}
                 initial={{ opacity: 0, y: 24 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
               >
                 {/* Left brand accent bar */}
                 <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg bg-gold/20 group-hover:bg-gold/60 transition-all duration-400" />

                 {/* Via number + Audio button */}
                 <span className="flex items-center justify-between mb-3">
                   <span className="text-xs tracking-[0.3em] text-gold font-mono font-medium">
                     VÍA {path.via}
                   </span>
                   <PathAudioButton text={pathNarrations[path.key]} />
                 </span>

                 {/* Title */}
                 <h3 className="text-foreground text-lg sm:text-xl font-medium mb-2 group-hover:text-gold transition-colors duration-300" style={{ fontFamily: "'Lora', serif" }}>
                   {path.title}
                 </h3>

                 {/* Description */}
                 <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-5">
                   {path.desc}
                 </p>

                 {/* CTA Button — tactile, full width on mobile */}
                 <span className="flex items-center justify-center gap-2 w-full h-12 border border-gold/40 text-gold text-sm font-semibold rounded group-hover:bg-gold group-hover:text-background transition-all duration-300">
                   <span>{language === "es" ? "Entrar" : "Enter"}</span>
                   <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </span>
               </motion.button>
             ))}
           </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER — Minimal
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="py-10 sm:py-14 px-5 sm:px-8 lg:px-12 border-t border-border/30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1">
            <LogoMiro className="h-10 w-auto opacity-70" />
             <p className="text-xs tracking-[0.2em] text-muted-foreground font-mono uppercase">
               {language === "es" ? "Odontología Predictiva · Humana.AI" : "Predictive Dentistry · Humana.AI"}
             </p>
           </div>
           <div className="text-right space-y-1">
             <p className="text-xs tracking-[0.2em] text-gold font-mono uppercase">{t("location")}</p>
             <p className="text-xs tracking-[0.15em] text-muted-foreground font-mono">© 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
