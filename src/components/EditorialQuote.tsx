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
    <section className={`px-4 sm:px-6 lg:px-12 ${variant === "large" ? "py-20 sm:py-32 lg:py-48" : "py-16 sm:py-24 lg:py-36"}`}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="relative">
          {/* Subtle gold accent line - top */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-gold-muted/40 to-transparent" />
          
          <div className={`${variant === "large" ? "py-12 sm:py-20 space-y-4 sm:space-y-6" : "py-10 sm:py-16 space-y-3 sm:space-y-4"}`}>
            {lines.map((line, index) => (
              <p 
                key={index}
                className={`text-gold ${
                  variant === "large" 
                    ? "text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-[1.35] sm:leading-[1.4]" 
                    : "text-lg sm:text-xl md:text-2xl lg:text-3xl leading-[1.4] sm:leading-[1.5]"
                }`}
                style={{
                  fontFamily: "'Lora', serif",
                  fontWeight: 400,
                  fontStyle: 'italic',
                  animation: 'slideUp 1s ease-out forwards',
                  animationDelay: `${index * 200}ms`,
                  opacity: 0
                }}
              >
                {renderLine(line, index)}
              </p>
            ))}
          </div>
          
          {/* Subtle gold accent line - bottom */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-gold-muted/40 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default EditorialQuote;
