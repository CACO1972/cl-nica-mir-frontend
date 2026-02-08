import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import teaserVideo from "@/assets/teaser-evaluation.mp4";

interface EvaluationSplashProps {
  onComplete: () => void;
}

const EvaluationSplash = ({ onComplete }: EvaluationSplashProps) => {
  const { language } = useLanguage();
  const [isExiting, setIsExiting] = useState(false);
  const [showText, setShowText] = useState(false);
  const [textPhase, setTextPhase] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Text content for each phase
  const textContent = {
    es: [
      "¿Te ha pasado que vas a tres dentistas…",
      "…y sales con tres diagnósticos distintos?",
      "Antes de tratarte, entiende tu caso con claridad."
    ],
    en: [
      "Have you ever visited three dentists…",
      "…and left with three different diagnoses?",
      "Before treatment, understand your case with clarity."
    ]
  };

  const texts = textContent[language as "es" | "en"] || textContent.es;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Show first text after 1 second
    const textTimer1 = setTimeout(() => {
      setShowText(true);
      setTextPhase(0);
    }, 1000);

    // Transition through text phases
    const textTimer2 = setTimeout(() => setTextPhase(1), 3500);
    const textTimer3 = setTimeout(() => setTextPhase(2), 6000);

    const handleEnded = () => {
      setIsExiting(true);
      setTimeout(() => {
        onComplete();
      }, 1200);
    };

    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("ended", handleEnded);
      clearTimeout(textTimer1);
      clearTimeout(textTimer2);
      clearTimeout(textTimer3);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background flex items-center justify-center transition-all duration-1000 ease-out ${
        isExiting ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Video container */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          isExiting ? "blur-sm" : ""
        }`}
      >
        <video
          ref={videoRef}
          src={teaserVideo}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain md:object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-background/40" />
      </div>

      {/* Text overlay - centered messaging */}
      <div 
        className={`relative z-10 max-w-4xl mx-auto px-8 text-center transition-all duration-700 ${
          showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {texts.map((text, index) => (
          <p
            key={index}
            className={`font-serif font-light text-foreground text-2xl md:text-4xl lg:text-5xl leading-relaxed mb-6 transition-all duration-700 ${
              textPhase >= index 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-4"
            } ${
              index === 2 ? "text-gold-muted mt-12" : ""
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            {text}
          </p>
        ))}
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className={`absolute bottom-8 right-8 caption text-muted-foreground/60 hover:text-foreground transition-all duration-500 tracking-widest uppercase z-20 ${
          isExiting ? "opacity-0 translate-y-4" : "opacity-100"
        }`}
      >
        {language === "es" ? "Saltar" : "Skip"}
      </button>

      {/* Subtle progress indicator at bottom */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-muted/30 to-transparent transition-opacity duration-500 z-20 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
};

export default EvaluationSplash;
