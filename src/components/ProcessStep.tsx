interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  isLast?: boolean;
}

const ProcessStep = ({ number, title, description, isLast = false }: ProcessStepProps) => {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-hero-gradient flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
          {number}
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-gradient-to-b from-primary to-transparent mt-2" />
        )}
      </div>
      <div className="pb-8">
        <h4 className="font-display font-semibold text-foreground mb-1">
          {title}
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ProcessStep;
