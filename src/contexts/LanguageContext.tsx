import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Header
    "location": "Santiago, Chile",
    
    // Philosophy Section
    "philosophy.caption": "Nuestra Filosofía",
    "philosophy.headline": "Prevenir es precisión.",
    "philosophy.p1": "La odontología tradicional espera los problemas. Nosotros elegimos un camino diferente. A través de imágenes avanzadas e inteligencia artificial, leemos las señales que tu sonrisa envía antes de que aparezcan los síntomas.",
    "philosophy.p2": "Cada examen se convierte en una conversación entre tecnología y experiencia humana. Cada diagnóstico, una ventana hacia tu futuro dental.",
    "philosophy.p3": "Esto no es innovación por sí misma. Es cuidado, redefinido.",
    
    // Approach Section
    "approach.caption": "El Enfoque",
    "approach.headline": "Vemos lo que permanece invisible para la práctica convencional. Nuestra tecnología mapea trayectorias, no solo condiciones.",
    "approach.step1": "Imágenes tridimensionales que capturan la arquitectura completa de tu salud oral.",
    "approach.step2": "Algoritmos predictivos que analizan patrones invisibles al ojo humano.",
    "approach.step3": "Protocolos personalizados que abordan las preocupaciones de mañana, hoy.",
    
    // Vision Section
    "vision.headline": "El futuro de la salud dental comienza con previsión.",
    "vision.subline": "En un mundo que se mueve rápido, nos tomamos el tiempo de mirar hacia adelante. Tu sonrisa no merece menos que certeza.",
    
    // CTA Section
    "cta.headline": "¿Listo para comenzar?",
    "cta.button": "Comenzar Evaluación",
    
    // Footer
    "footer.tagline": "Odontología Predictiva",
    
    // Evaluation Page
    "eval.caption": "Evaluación Predictiva",
    "eval.headline": "Diagnóstico avanzado antes de cualquier decisión.",
    "eval.subline": "Una evaluación integral que revela lo que los exámenes convencionales no pueden.",
    
    "eval.what.caption": "Qué Es",
    "eval.what.headline": "El fundamento de la previsión.",
    "eval.what.p1": "La Evaluación Predictiva no es un chequeo rutinario. Es una exploración exhaustiva de tu salud oral, diseñada para descubrir patrones y potenciales que los exámenes estándar simplemente no pueden detectar.",
    "eval.what.p2": "A través de imágenes tridimensionales avanzadas y análisis predictivo, construimos un mapa completo de tu arquitectura dental—identificando no solo condiciones actuales sino las trayectorias que pueden seguir.",
    "eval.what.p3": "Aquí es donde comienza la prevención. Aquí es donde vive la certeza.",
    
    "eval.why.caption": "Para Quién Es",
    "eval.why.headline": "Pacientes que buscan claridad antes de actuar.",
    "eval.why.p1": "Para quienes han postergado su salud dental y desean un punto de partida honesto. Para quienes consideran tratamientos complejos y necesitan certeza antes de decidir.",
    "eval.why.p2": "Para profesionales exigentes que valoran su tiempo y esperan un nivel de atención acorde. Para quienes viajan a Chile y buscan optimizar su visita con un diagnóstico completo.",
    "eval.why.p3": "Si buscas respuestas claras antes de cualquier intervención, esta evaluación es para ti.",
    
    "eval.includes.caption": "Qué Obtienes",
    "eval.includes.headline": "Precisión. Claridad. Escenarios.",
    "eval.includes.imaging.title": "Imágenes Dimensionales",
    "eval.includes.imaging.desc": "Tu evaluación comienza con un escaneo tridimensional integral—una reconstrucción digital precisa de toda tu arquitectura oral. Cada superficie, cada ángulo, cada espacio oculto se vuelve visible y medible.",
    "eval.includes.analysis.title": "Análisis Predictivo",
    "eval.includes.analysis.desc": "Nuestros sistemas de inteligencia artificial analizan tus datos de imagen contra patrones extraídos de miles de casos. El resultado es un mapa de probabilidades—una visión clara de desarrollos potenciales.",
    "eval.includes.protocol.title": "Protocolo Personal",
    "eval.includes.protocol.desc": "Te vas con más que información. Recibes un protocolo de cuidado personalizado—recomendaciones específicas adaptadas a tu perfil dental único.",
    "eval.includes.dialogue.title": "Diálogo Clínico",
    "eval.includes.dialogue.desc": "Una conversación honesta sobre tus opciones. Sin presión. Sin promesas exageradas. Solo claridad sobre el camino que mejor se adapta a tu situación.",
    
    "eval.cta.headline": "Solicita tu evaluación.",
    "eval.cta.subline": "Una sesión. Claridad completa.",
    "eval.cta.button": "Solicitar Evaluación",

    // Otros Accesos
    "eval.access.caption": "Otros Accesos",
    "eval.access.headline": "Más formas de conectar.",
    "eval.access.portal.title": "Portal Paciente",
    "eval.access.portal.desc": "Acceso privado a tus evaluaciones, informes detallados y seguimiento continuo de tu plan de cuidado. Tu historial clínico, siempre disponible.",
    "eval.access.portal.cta": "Acceder al portal",
    "eval.access.opinion.title": "Segunda Opinión",
    "eval.access.opinion.desc": "Si ya tienes estudios o diagnósticos previos, podemos analizarlos con nuestra perspectiva predictiva. Una mirada fresca antes de decidir.",
    "eval.access.opinion.cta": "Solicitar segunda opinión",
    "eval.access.international.title": "Pacientes Internacionales",
    "eval.access.international.desc": "Evaluaciones optimizadas para quienes viajan o residen fuera de Chile. Maximizamos cada visita con un proceso diseñado para tu tiempo.",
    "eval.access.international.cta": "Ver modalidad internacional",

    // Wizard Step 1
    "wizard.step1.caption": "Paso 1 de 8",
    "wizard.step1.headline": "Datos Personales",
    "wizard.step1.name": "Nombre completo",
    "wizard.step1.email": "Correo electrónico",
    "wizard.step1.phone": "Teléfono",
    "wizard.step1.country": "País",
    "wizard.step1.city": "Ciudad",

    // Wizard Step 2
    "wizard.step2.caption": "Paso 2 de 8",
    "wizard.step2.headline": "Antecedentes y Hábitos",
    "wizard.step2.conditions": "Enfermedades relevantes",
    "wizard.step2.conditions.placeholder": "Diabetes, hipertensión, etc.",
    "wizard.step2.medications": "Medicación actual",
    "wizard.step2.medications.placeholder": "Lista de medicamentos que tomas regularmente",
    "wizard.step2.tobacco": "Tabaco",
    "wizard.step2.tobacco.placeholder": "Sí / No",
    "wizard.step2.bruxism": "Bruxismo",
    "wizard.step2.bruxism.placeholder": "Sí / No",

    // Wizard Step 3
    "wizard.step3.caption": "Paso 3 de 8",
    "wizard.step3.headline": "Tu Historial Dental",
    "wizard.step3.intro": "Sé sincero: ¿Cuándo fue tu último control o tratamiento dental?",
    "wizard.step3.year": "Año aproximado",
    "wizard.step3.treatment": "Describe brevemente el tratamiento",
    "wizard.step3.treatment.placeholder": "Limpieza, extracción, implante, etc.",

    // Wizard Step 4
    "wizard.step4.caption": "Paso 4 de 8",
    "wizard.step4.headline": "Imagen de Referencia",
    "wizard.step4.intro": "Una fotografía de tu sonrisa nos ayuda a preparar tu evaluación. Puedes subir una imagen o tomar una selfie.",
    "wizard.step4.upload": "Subir imagen",
    "wizard.step4.camera": "Tomar selfie",
    "wizard.step4.selected": "Archivo seleccionado",

    // Wizard Step 5
    "wizard.step5.caption": "Paso 5 de 8",
    "wizard.step5.headline": "Pre-Análisis",
    "wizard.step5.analyzing": "Analizando tu información...",
    "wizard.step5.message": "Nuestro sistema está procesando los datos proporcionados para orientar tu evaluación hacia el módulo más adecuado.",
    "wizard.step5.result": "Basado en tu perfil, tu caso podría beneficiarse del protocolo de evaluación integral. Confirmaremos los detalles durante tu visita presencial.",

    // Wizard Step 6
    "wizard.step6.caption": "Paso 6 de 8",
    "wizard.step6.headline": "Evaluación Presencial Premium",
    "wizard.step6.p1": "El pre-análisis digital es solo el primer paso. La evaluación completa ocurre en persona, donde la tecnología y la experiencia clínica se encuentran.",
    "wizard.step6.p2": "Durante tu visita, realizaremos imágenes tridimensionales completas, análisis predictivo detallado, y una conversación profunda sobre tus opciones.",
    "wizard.step6.p3": "Esta es la base sobre la cual construimos tu plan de cuidado personalizado.",

    // Wizard Step 7
    "wizard.step7.caption": "Paso 7 de 8",
    "wizard.step7.headline": "Confirma tu Evaluación",
    "wizard.step7.intro": "Para reservar tu evaluación presencial, procede con el pago de la consulta. Este valor se aplica posteriormente a cualquier tratamiento que decidas realizar.",
    "wizard.step7.button": "Proceder al Pago",

    // Wizard Step 8
    "wizard.step8.caption": "Paso 8 de 8",
    "wizard.step8.headline": "Agenda tu Visita",
    "wizard.step8.intro": "Pago confirmado. Ahora puedes agendar tu evaluación presencial en el horario que mejor te convenga.",
    "wizard.step8.schedule": "Agendar Online",
    "wizard.step8.whatsapp": "Agendar por WhatsApp",

    // Wizard Navigation
    "wizard.nav.back": "Volver",
    "wizard.nav.continue": "Continuar",
  },
  en: {
    // Header
    "location": "Santiago, Chile",
    
    // Philosophy Section
    "philosophy.caption": "Our Philosophy",
    "philosophy.headline": "Prevention is precision.",
    "philosophy.p1": "Traditional dentistry waits for problems. We chose a different path. Through advanced imaging and artificial intelligence, we read the signals your smile sends before symptoms appear.",
    "philosophy.p2": "Every examination becomes a conversation between technology and human expertise. Every diagnosis, a window into your dental future.",
    "philosophy.p3": "This is not innovation for its own sake. This is care, redefined.",
    
    // Approach Section
    "approach.caption": "The Approach",
    "approach.headline": "We see what remains invisible to conventional practice. Our technology maps trajectories, not just conditions.",
    "approach.step1": "Three-dimensional imaging captures the complete architecture of your oral health.",
    "approach.step2": "Predictive algorithms analyze patterns invisible to the human eye alone.",
    "approach.step3": "Personalized protocols address tomorrow's concerns today.",
    
    // Vision Section
    "vision.headline": "The future of dental health begins with foresight.",
    "vision.subline": "In a world that moves fast, we take the time to look ahead. Your smile deserves nothing less than certainty.",
    
    // CTA Section
    "cta.headline": "Ready to begin?",
    "cta.button": "Begin Evaluation",
    
    // Footer
    "footer.tagline": "Predictive Dentistry",
    
    // Evaluation Page
    "eval.caption": "Predictive Evaluation",
    "eval.headline": "Advanced diagnosis before any decision.",
    "eval.subline": "A comprehensive assessment that reveals what conventional examinations cannot.",
    
    "eval.what.caption": "What It Is",
    "eval.what.headline": "The foundation of foresight.",
    "eval.what.p1": "The Predictive Evaluation is not a routine check-up. It is a comprehensive exploration of your oral health, designed to uncover patterns and potentials that standard examinations simply cannot detect.",
    "eval.what.p2": "Through advanced three-dimensional imaging and predictive analysis, we construct a complete map of your dental architecture—identifying not only current conditions but the trajectories they may follow.",
    "eval.what.p3": "This is where prevention begins. This is where certainty lives.",
    
    "eval.why.caption": "Who It's For",
    "eval.why.headline": "Patients seeking clarity before action.",
    "eval.why.p1": "For those who have postponed their dental health and want an honest starting point. For those considering complex treatments who need certainty before deciding.",
    "eval.why.p2": "For demanding professionals who value their time and expect a level of care to match. For those traveling to Chile who want to optimize their visit with a complete diagnosis.",
    "eval.why.p3": "If you seek clear answers before any intervention, this evaluation is for you.",
    
    "eval.includes.caption": "What You Get",
    "eval.includes.headline": "Precision. Clarity. Scenarios.",
    "eval.includes.imaging.title": "Dimensional Imaging",
    "eval.includes.imaging.desc": "Your evaluation begins with comprehensive three-dimensional scanning—a precise digital reconstruction of your entire oral architecture. Every surface, every angle, every hidden space becomes visible and measurable.",
    "eval.includes.analysis.title": "Predictive Analysis",
    "eval.includes.analysis.desc": "Our artificial intelligence systems analyze your imaging data against patterns drawn from thousands of cases. The result is a probability map—a clear view of potential developments.",
    "eval.includes.protocol.title": "Personal Protocol",
    "eval.includes.protocol.desc": "You leave with more than information. You receive a personalized care protocol—specific recommendations tailored to your unique dental profile.",
    "eval.includes.dialogue.title": "Clinical Dialogue",
    "eval.includes.dialogue.desc": "An honest conversation about your options. No pressure. No exaggerated promises. Just clarity about the path that best suits your situation.",
    
    "eval.cta.headline": "Request your evaluation.",
    "eval.cta.subline": "One session. Complete clarity.",
    "eval.cta.button": "Request Evaluation",

    // Other Access
    "eval.access.caption": "Other Access",
    "eval.access.headline": "More ways to connect.",
    "eval.access.portal.title": "Patient Portal",
    "eval.access.portal.desc": "Private access to your evaluations, detailed reports, and continuous follow-up of your care plan. Your clinical history, always available.",
    "eval.access.portal.cta": "Access portal",
    "eval.access.opinion.title": "Second Opinion",
    "eval.access.opinion.desc": "If you already have studies or previous diagnoses, we can analyze them with our predictive perspective. A fresh look before deciding.",
    "eval.access.opinion.cta": "Request second opinion",
    "eval.access.international.title": "International Patients",
    "eval.access.international.desc": "Optimized evaluations for those traveling or living outside Chile. We maximize every visit with a process designed for your time.",
    "eval.access.international.cta": "View international options",

    // Wizard Step 1
    "wizard.step1.caption": "Step 1 of 8",
    "wizard.step1.headline": "Personal Information",
    "wizard.step1.name": "Full name",
    "wizard.step1.email": "Email address",
    "wizard.step1.phone": "Phone number",
    "wizard.step1.country": "Country",
    "wizard.step1.city": "City",

    // Wizard Step 2
    "wizard.step2.caption": "Step 2 of 8",
    "wizard.step2.headline": "Medical History & Habits",
    "wizard.step2.conditions": "Relevant conditions",
    "wizard.step2.conditions.placeholder": "Diabetes, hypertension, etc.",
    "wizard.step2.medications": "Current medications",
    "wizard.step2.medications.placeholder": "List of medications you take regularly",
    "wizard.step2.tobacco": "Tobacco use",
    "wizard.step2.tobacco.placeholder": "Yes / No",
    "wizard.step2.bruxism": "Bruxism",
    "wizard.step2.bruxism.placeholder": "Yes / No",

    // Wizard Step 3
    "wizard.step3.caption": "Step 3 of 8",
    "wizard.step3.headline": "Your Dental History",
    "wizard.step3.intro": "Be honest: When was your last dental check-up or treatment?",
    "wizard.step3.year": "Approximate year",
    "wizard.step3.treatment": "Briefly describe the treatment",
    "wizard.step3.treatment.placeholder": "Cleaning, extraction, implant, etc.",

    // Wizard Step 4
    "wizard.step4.caption": "Step 4 of 8",
    "wizard.step4.headline": "Reference Image",
    "wizard.step4.intro": "A photograph of your smile helps us prepare your evaluation. You can upload an image or take a selfie.",
    "wizard.step4.upload": "Upload image",
    "wizard.step4.camera": "Take selfie",
    "wizard.step4.selected": "Selected file",

    // Wizard Step 5
    "wizard.step5.caption": "Step 5 of 8",
    "wizard.step5.headline": "Pre-Analysis",
    "wizard.step5.analyzing": "Analyzing your information...",
    "wizard.step5.message": "Our system is processing the provided data to guide your evaluation toward the most appropriate module.",
    "wizard.step5.result": "Based on your profile, your case could benefit from the comprehensive evaluation protocol. We will confirm the details during your in-person visit.",

    // Wizard Step 6
    "wizard.step6.caption": "Step 6 of 8",
    "wizard.step6.headline": "Premium In-Person Evaluation",
    "wizard.step6.p1": "The digital pre-analysis is just the first step. The complete evaluation happens in person, where technology and clinical expertise meet.",
    "wizard.step6.p2": "During your visit, we will perform complete three-dimensional imaging, detailed predictive analysis, and a deep conversation about your options.",
    "wizard.step6.p3": "This is the foundation upon which we build your personalized care plan.",

    // Wizard Step 7
    "wizard.step7.caption": "Step 7 of 8",
    "wizard.step7.headline": "Confirm Your Evaluation",
    "wizard.step7.intro": "To reserve your in-person evaluation, proceed with the consultation payment. This amount applies to any treatment you decide to pursue.",
    "wizard.step7.button": "Proceed to Payment",

    // Wizard Step 8
    "wizard.step8.caption": "Step 8 of 8",
    "wizard.step8.headline": "Schedule Your Visit",
    "wizard.step8.intro": "Payment confirmed. You can now schedule your in-person evaluation at the time that suits you best.",
    "wizard.step8.schedule": "Schedule Online",
    "wizard.step8.whatsapp": "Schedule via WhatsApp",

    // Wizard Navigation
    "wizard.nav.back": "Back",
    "wizard.nav.continue": "Continue",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    return (stored as Language) || "es";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
