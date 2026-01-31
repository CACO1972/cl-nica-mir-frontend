import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <span className="font-serif text-xl tracking-tight">
              Clínica Miró
            </span>
            <span className="caption text-muted-foreground hidden sm:block">
              Santiago, Chile
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 pt-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <p className="caption text-muted-foreground">
              Predictive Dentistry
            </p>
            <h1 className="display-huge text-foreground max-w-5xl">
              Beyond<br />
              Treatment
            </h1>
            <p className="body-large text-muted-foreground max-w-xl pt-8">
              We anticipate what others can only react to.
            </p>
          </div>
        </div>
        
        <div className="absolute bottom-12 left-6 lg:left-12">
          <p className="caption text-muted-foreground animate-fade-in" style={{ animationDelay: "1.5s", animationFillMode: "both" }}>
            Scroll
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="caption text-muted-foreground mb-6">
                Our Philosophy
              </p>
              <h2 className="display-large text-foreground">
                Prevention is precision.
              </h2>
            </div>
            <div className="space-y-12 lg:pt-24">
              <p className="body-large text-muted-foreground">
                Traditional dentistry waits for problems. We chose a different path. 
                Through advanced imaging and artificial intelligence, we read the 
                signals your smile sends before symptoms appear.
              </p>
              <p className="body-large text-muted-foreground">
                Every examination becomes a conversation between technology and 
                human expertise. Every diagnosis, a window into your dental future.
              </p>
              <p className="body-large text-foreground">
                This is not innovation for its own sake. This is care, redefined.
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
              The Approach
            </p>
            <h2 className="display-medium text-foreground mb-16">
              We see what remains invisible to conventional practice. 
              Our technology maps trajectories, not just conditions.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 pt-8">
            <div className="space-y-4">
              <p className="body-small text-foreground">01</p>
              <p className="body-large text-muted-foreground">
                Three-dimensional imaging captures the complete architecture 
                of your oral health.
              </p>
            </div>
            <div className="space-y-4">
              <p className="body-small text-foreground">02</p>
              <p className="body-large text-muted-foreground">
                Predictive algorithms analyze patterns invisible to the 
                human eye alone.
              </p>
            </div>
            <div className="space-y-4">
              <p className="body-small text-foreground">03</p>
              <p className="body-large text-muted-foreground">
                Personalized protocols address tomorrow's concerns today.
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
              The future of dental health<br />
              begins with foresight.
            </h2>
            <p className="body-large text-muted-foreground max-w-2xl mx-auto">
              In a world that moves fast, we take the time to look ahead. 
              Your smile deserves nothing less than certainty.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-12">
            <h2 className="display-large text-foreground">
              Ready to begin?
            </h2>
            <Link 
              to="/evaluacion-premium"
              className="inline-block editorial-link body-small text-foreground tracking-widest"
            >
              Begin Evaluation
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
                Predictive Dentistry
              </p>
            </div>
            <div className="text-right space-y-2">
              <p className="caption text-muted-foreground">Santiago, Chile</p>
              <p className="caption text-muted-foreground">© 2025</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
