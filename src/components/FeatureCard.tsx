import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon, title, description, delay = 0 }: FeatureCardProps) => {
  return (
    <div
      className="group p-6 bg-card rounded-2xl border border-border card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-1"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 rounded-xl bg-hero-gradient flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
        <div className="text-primary-foreground">{icon}</div>
      </div>
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
