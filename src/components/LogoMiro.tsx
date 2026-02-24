import { useTheme } from "@/contexts/ThemeContext";
import logoLight from "@/assets/logomiro-light.png";
import logoDark from "@/assets/logomiro-dark.png";

interface LogoMiroProps {
  className?: string;
  alt?: string;
}

const LogoMiro = ({ className = "h-12 md:h-14 w-auto", alt = "Clínica Miró" }: LogoMiroProps) => {
  const { theme } = useTheme();
  return (
    <img
      src={theme === "dark" ? logoDark : logoLight}
      alt={alt}
      className={className}
    />
  );
};

export default LogoMiro;
