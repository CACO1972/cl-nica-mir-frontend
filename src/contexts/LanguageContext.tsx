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
    "eval.caption": "Evaluación Premium",
    "eval.headline": "Ver Más Lejos",
    "eval.subline": "Una evaluación integral que revela lo que los exámenes convencionales no pueden.",
    
    "eval.what.caption": "Qué Es",
    "eval.what.headline": "El fundamento de la previsión.",
    "eval.what.p1": "La Evaluación Premium no es un chequeo rutinario. Es una exploración exhaustiva de tu salud oral, diseñada para descubrir patrones y potenciales que los exámenes estándar simplemente no pueden detectar.",
    "eval.what.p2": "A través de imágenes tridimensionales avanzadas y análisis predictivo, construimos un mapa completo de tu arquitectura dental—identificando no solo condiciones actuales sino las trayectorias que pueden seguir.",
    "eval.what.p3": "Aquí es donde comienza la prevención. Aquí es donde vive la certeza.",
    
    "eval.why.caption": "Por Qué Es Diferente",
    "eval.why.headline": "La mayoría de las visitas dentales reaccionan a síntomas. Nosotros respondemos a señales.",
    "eval.why.p1": "La odontología tradicional opera en tiempo presente. Aparece una caries, se rellena. Duele un diente, recibe tratamiento. El patrón es siempre el mismo: esperar el problema, luego abordarlo.",
    "eval.why.p2": "Nuestro enfoque invierte esta lógica por completo. Al combinar tecnología de escaneo de alta resolución con inteligencia artificial, identificamos los indicadores sutiles de futuras complicaciones—meses o incluso años antes de que se manifiesten como problemas que requieren intervención.",
    "eval.why.p3": "La diferencia no es meramente tecnológica. Es filosófica. Creemos en actuar antes de que la acción se vuelva urgente.",
    
    "eval.includes.caption": "Qué Incluye",
    "eval.includes.headline": "Comprensión completa.",
    "eval.includes.imaging.title": "Imágenes Dimensionales",
    "eval.includes.imaging.desc": "Tu evaluación comienza con un escaneo tridimensional integral—una reconstrucción digital precisa de toda tu arquitectura oral. Cada superficie, cada ángulo, cada espacio oculto se vuelve visible y medible. Esto no es fotografía; es cartografía del tipo más íntimo.",
    "eval.includes.analysis.title": "Análisis Predictivo",
    "eval.includes.analysis.desc": "Nuestros sistemas de inteligencia artificial analizan tus datos de imagen contra patrones extraídos de miles de casos. El resultado es un mapa de probabilidades—una visión clara de desarrollos potenciales y la línea temporal en la que podrían desenvolverse.",
    "eval.includes.protocol.title": "Protocolo Personal",
    "eval.includes.protocol.desc": "Te vas con más que información. Recibes un protocolo de cuidado personalizado—recomendaciones específicas adaptadas a tu perfil dental único, diseñadas para abordar preocupaciones antes de que se conviertan en complicaciones.",
    "eval.includes.dialogue.title": "Diálogo Continuo",
    "eval.includes.dialogue.desc": "La evaluación marca el comienzo de una relación, no una transacción. Las consultas de seguimiento aseguran que tu protocolo evolucione según tus necesidades. Permanecemos invertidos en tu trayectoria.",
    
    "eval.cta.headline": "Comienza la conversación.",
    "eval.cta.subline": "Tu evaluación te espera. Una sesión. Claridad completa.",
    "eval.cta.button": "Solicitar Evaluación",
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
    "eval.caption": "Premium Evaluation",
    "eval.headline": "See Further",
    "eval.subline": "A comprehensive assessment that reveals what conventional examinations cannot.",
    
    "eval.what.caption": "What It Is",
    "eval.what.headline": "The foundation of foresight.",
    "eval.what.p1": "The Premium Evaluation is not a routine check-up. It is a comprehensive exploration of your oral health, designed to uncover patterns and potentials that standard examinations simply cannot detect.",
    "eval.what.p2": "Through advanced three-dimensional imaging and predictive analysis, we construct a complete map of your dental architecture—identifying not only current conditions but the trajectories they may follow.",
    "eval.what.p3": "This is where prevention begins. This is where certainty lives.",
    
    "eval.why.caption": "Why It's Different",
    "eval.why.headline": "Most dental visits react to symptoms. We respond to signals.",
    "eval.why.p1": "Traditional dentistry operates in the present tense. A cavity appears, it gets filled. A tooth aches, it receives treatment. The pattern is always the same: wait for the problem, then address it.",
    "eval.why.p2": "Our approach inverts this logic entirely. By combining high-resolution scanning technology with artificial intelligence, we identify the subtle indicators of future complications—months or even years before they manifest as issues requiring intervention.",
    "eval.why.p3": "The difference is not merely technological. It is philosophical. We believe in acting before action becomes urgent.",
    
    "eval.includes.caption": "What's Included",
    "eval.includes.headline": "Complete understanding.",
    "eval.includes.imaging.title": "Dimensional Imaging",
    "eval.includes.imaging.desc": "Your evaluation begins with comprehensive three-dimensional scanning—a precise digital reconstruction of your entire oral architecture. Every surface, every angle, every hidden space becomes visible and measurable. This is not photography; this is cartography of the most intimate kind.",
    "eval.includes.analysis.title": "Predictive Analysis",
    "eval.includes.analysis.desc": "Our artificial intelligence systems analyze your imaging data against patterns drawn from thousands of cases. The result is a probability map—a clear view of potential developments and the timeline along which they might unfold.",
    "eval.includes.protocol.title": "Personal Protocol",
    "eval.includes.protocol.desc": "You leave with more than information. You receive a personalized care protocol—specific recommendations tailored to your unique dental profile, designed to address concerns before they become complications.",
    "eval.includes.dialogue.title": "Continued Dialogue",
    "eval.includes.dialogue.desc": "The evaluation marks the beginning of a relationship, not a transaction. Follow-up consultations ensure your protocol evolves as your needs do. We remain invested in your trajectory.",
    
    "eval.cta.headline": "Begin the conversation.",
    "eval.cta.subline": "Your evaluation awaits. One session. Complete clarity.",
    "eval.cta.button": "Request Evaluation",
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
