import { useState, useRef, useEffect } from "react";
import teaserVideo from "@/assets/teaser-evaluation.mp4";

interface EvaluationSplashProps {
  onComplete: () => void;
}

const EvaluationSplash = ({ onComplete }: EvaluationSplashProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setIsExiting(true);
      // Wait for exit animation before calling onComplete
      setTimeout(() => {
        onComplete();
      }, 1200);
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
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
        className={`relative w-full h-full flex items-center justify-center transition-all duration-1000 ${
          isExiting ? "blur-sm" : ""
        }`}
      >
        <video
          ref={videoRef}
          src={teaserVideo}
          autoPlay
          muted
          playsInline
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className={`absolute bottom-8 right-8 caption text-muted-foreground/60 hover:text-foreground transition-all duration-500 tracking-widest uppercase ${
          isExiting ? "opacity-0 translate-y-4" : "opacity-100"
        }`}
      >
        Skip
      </button>

      {/* Subtle progress indicator at bottom */}
      <div 
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-muted/30 to-transparent transition-opacity duration-500 ${
          isExiting ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
};

export default EvaluationSplash;
