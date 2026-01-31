import { useLanguage } from "@/contexts/LanguageContext";

interface EditorialQuoteProps {
  lines: string[];
  goldWord?: string;
  variant?: "large" | "medium";
}

const EditorialQuote = ({ lines, goldWord, variant = "large" }: EditorialQuoteProps) => {
  const renderLine = (line: string, index: number) => {
    if (goldWord && line.includes(goldWord)) {
      const parts = line.split(goldWord);
      return (
        <span key={index}>
          {parts[0]}
          <span className="text-gold-muted">{goldWord}</span>
          {parts[1]}
        </span>
      );
    }
    return <span key={index}>{line}</span>;
  };

  return (
    <section className="py-section px-6 lg:px-12">
      <div className="max-w-5xl mx-auto text-center">
        <div className="relative">
          {/* Subtle gold accent line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-12 h-px bg-gold-muted/30" />
          
          <div className={`pt-12 pb-8 space-y-2 ${variant === "large" ? "space-y-4" : "space-y-2"}`}>
            {lines.map((line, index) => (
              <p 
                key={index}
                className={`font-serif font-light text-foreground/90 leading-relaxed ${
                  variant === "large" 
                    ? "text-2xl md:text-3xl lg:text-4xl" 
                    : "text-xl md:text-2xl lg:text-3xl"
                }`}
                style={{
                  animation: 'slideUp 0.8s ease-out forwards',
                  animationDelay: `${index * 150}ms`,
                  opacity: 0
                }}
              >
                {renderLine(line, index)}
              </p>
            ))}
          </div>
          
          {/* Subtle gold accent line */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-12 h-px bg-gold-muted/30" />
        </div>
      </div>
    </section>
  );
};

export default EditorialQuote;
