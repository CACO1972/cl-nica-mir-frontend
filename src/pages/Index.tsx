import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

const Index = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <span className="font-serif text-xl tracking-tight">
              Clínica Miró
            </span>
            <div className="flex items-center gap-6">
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
              <span className="caption text-muted-foreground hidden sm:block">
                {t("location")}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-[100svh] flex flex-col justify-center items-center px-6 lg:px-12 bg-background dark:bg-[hsl(0,0%,6%)]">
        <div className="max-w-7xl mx-auto w-full text-center">
          <div className="animate-slide-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
            <h1 className="display-massive text-foreground dark:text-[hsl(30,10%,96%)]">
              Odontología Predictiva
            </h1>
          </div>
          <div className="mt-16 lg:mt-24 animate-slide-up" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
            <p className="text-sm font-normal text-muted-foreground dark:text-[hsl(0,0%,50%)] tracking-[0.2em] uppercase">
              Clarity before treatment
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="caption text-muted-foreground mb-6">
                {t("philosophy.caption")}
              </p>
              <h2 className="display-large text-foreground">
                {t("philosophy.headline")}
              </h2>
            </div>
            <div className="space-y-12 lg:pt-24">
              <p className="body-large text-muted-foreground">
                {t("philosophy.p1")}
              </p>
              <p className="body-large text-muted-foreground">
                {t("philosophy.p2")}
              </p>
              <p className="body-large text-foreground">
                {t("philosophy.p3")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Break */}
      <section className="py-section-sm px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-border" />
        </div>
      </section>

      {/* Approach Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="caption text-muted-foreground mb-6">
              {t("approach.caption")}
            </p>
            <h2 className="display-medium text-foreground mb-16">
              {t("approach.headline")}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 pt-8">
            <div className="space-y-4">
              <p className="body-small text-foreground">01</p>
              <p className="body-large text-muted-foreground">
                {t("approach.step1")}
              </p>
            </div>
            <div className="space-y-4">
              <p className="body-small text-foreground">02</p>
              <p className="body-large text-muted-foreground">
                {t("approach.step2")}
              </p>
            </div>
            <div className="space-y-4">
              <p className="body-small text-foreground">03</p>
              <p className="body-large text-muted-foreground">
                {t("approach.step3")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-section px-6 lg:px-12 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="display-large text-foreground">
              {t("vision.headline")}
            </h2>
            <p className="body-large text-muted-foreground max-w-2xl mx-auto">
              {t("vision.subline")}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-12">
            <h2 className="display-large text-foreground">
              {t("cta.headline")}
            </h2>
            <Link 
              to="/evaluation"
              className="inline-block editorial-link body-small text-foreground tracking-widest"
            >
              {t("cta.button")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 lg:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <p className="font-serif text-lg">Clínica Miró</p>
              <p className="body-large text-muted-foreground">
                {t("footer.tagline")}
              </p>
            </div>
            <div className="text-right space-y-2">
              <p className="caption text-muted-foreground">{t("location")}</p>
              <p className="caption text-muted-foreground">© 2025</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
