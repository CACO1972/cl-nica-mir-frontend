import { Link } from "react-router-dom";

const Evaluation = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="font-serif text-xl tracking-tight editorial-link">
              Clínica Miró
            </Link>
            <span className="caption text-muted-foreground hidden sm:block">
              Evaluation
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-[70vh] flex flex-col justify-center px-6 lg:px-12 pt-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            <p className="caption text-muted-foreground">
              Premium Evaluation
            </p>
            <h1 className="display-huge text-foreground max-w-5xl">
              See<br />
              Further
            </h1>
            <p className="body-large text-muted-foreground max-w-xl pt-8">
              A comprehensive assessment that reveals what conventional 
              examinations cannot.
            </p>
          </div>
        </div>
      </section>

      {/* What It Is Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="caption text-muted-foreground mb-6">
                What It Is
              </p>
              <h2 className="display-large text-foreground">
                The foundation of foresight.
              </h2>
            </div>
            <div className="space-y-12 lg:pt-24">
              <p className="body-large text-muted-foreground">
                The Premium Evaluation is not a routine check-up. It is a 
                comprehensive exploration of your oral health, designed to 
                uncover patterns and potentials that standard examinations 
                simply cannot detect.
              </p>
              <p className="body-large text-muted-foreground">
                Through advanced three-dimensional imaging and predictive 
                analysis, we construct a complete map of your dental 
                architecture—identifying not only current conditions but 
                the trajectories they may follow.
              </p>
              <p className="body-large text-foreground">
                This is where prevention begins. This is where certainty lives.
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

      {/* Why Different Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div>
              <p className="caption text-muted-foreground mb-6">
                Why It's Different
              </p>
              <h2 className="display-medium text-foreground mb-16">
                Most dental visits react to symptoms.<br />
                We respond to signals.
              </h2>
            </div>
            <div className="space-y-12 lg:pt-16">
              <p className="body-large text-muted-foreground">
                Traditional dentistry operates in the present tense. A cavity 
                appears, it gets filled. A tooth aches, it receives treatment. 
                The pattern is always the same: wait for the problem, then 
                address it.
              </p>
              <p className="body-large text-muted-foreground">
                Our approach inverts this logic entirely. By combining 
                high-resolution scanning technology with artificial intelligence, 
                we identify the subtle indicators of future complications—months 
                or even years before they manifest as issues requiring intervention.
              </p>
              <p className="body-large text-foreground">
                The difference is not merely technological. It is philosophical. 
                We believe in acting before action becomes urgent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-section px-6 lg:px-12 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <p className="caption text-muted-foreground mb-6">
              What's Included
            </p>
            <h2 className="display-large text-foreground">
              Complete understanding.
            </h2>
          </div>
          
          <div className="space-y-24 max-w-4xl">
            <div className="space-y-6">
              <p className="body-small text-foreground">Dimensional Imaging</p>
              <p className="body-large text-muted-foreground">
                Your evaluation begins with comprehensive three-dimensional 
                scanning—a precise digital reconstruction of your entire oral 
                architecture. Every surface, every angle, every hidden space 
                becomes visible and measurable. This is not photography; this 
                is cartography of the most intimate kind.
              </p>
            </div>

            <div className="space-y-6">
              <p className="body-small text-foreground">Predictive Analysis</p>
              <p className="body-large text-muted-foreground">
                Our artificial intelligence systems analyze your imaging data 
                against patterns drawn from thousands of cases. The result is 
                a probability map—a clear view of potential developments and 
                the timeline along which they might unfold. Knowledge, in this 
                context, becomes the most powerful form of prevention.
              </p>
            </div>

            <div className="space-y-6">
              <p className="body-small text-foreground">Personal Protocol</p>
              <p className="body-large text-muted-foreground">
                You leave with more than information. You receive a 
                personalized care protocol—specific recommendations tailored 
                to your unique dental profile, designed to address concerns 
                before they become complications. This document becomes your 
                roadmap to sustained oral health.
              </p>
            </div>

            <div className="space-y-6">
              <p className="body-small text-foreground">Continued Dialogue</p>
              <p className="body-large text-muted-foreground">
                The evaluation marks the beginning of a relationship, not a 
                transaction. Follow-up consultations ensure your protocol 
                evolves as your needs do. We remain invested in your trajectory, 
                adjusting recommendations as new data emerges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-12">
            <h2 className="display-large text-foreground">
              Begin the conversation.
            </h2>
            <p className="body-large text-muted-foreground max-w-xl mx-auto">
              Your evaluation awaits. One session. Complete clarity.
            </p>
            <button 
              className="inline-block editorial-link body-small text-foreground tracking-widest cursor-pointer bg-transparent border-none"
              onClick={() => window.location.href = 'mailto:contacto@clinicamiro.cl?subject=Request Evaluation'}
            >
              Request Evaluation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 lg:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <Link to="/" className="font-serif text-lg editorial-link">
                Clínica Miró
              </Link>
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

export default Evaluation;
