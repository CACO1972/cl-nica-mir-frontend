import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";
import ProcessStep from "@/components/ProcessStep";
import { 
  Scan, 
  Brain, 
  Shield, 
  Clock, 
  Star, 
  ArrowRight, 
  CheckCircle2,
  Stethoscope,
  Sparkles,
  Users
} from "lucide-react";
import heroDental from "@/assets/hero-dental.jpg";
import dentistPortrait from "@/assets/dentist-portrait.jpg";

const Index = () => {
  const features = [
    {
      icon: <Scan className="w-6 h-6" />,
      title: "Diagnóstico Avanzado",
      description: "Tecnología de escaneo 3D y análisis digital para una evaluación precisa de tu salud dental.",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "IA Predictiva",
      description: "Algoritmos que anticipan problemas dentales antes de que ocurran, permitiendo tratamientos preventivos.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Prevención Integral",
      description: "Plan personalizado de cuidado dental basado en tu perfil de riesgo individual.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Ahorro de Tiempo",
      description: "Procesos optimizados que reducen visitas y maximizan resultados en cada consulta.",
    },
  ];

  const steps = [
    {
      title: "Reserva Online",
      description: "Completa el formulario y realiza tu pago de forma segura en menos de 2 minutos.",
    },
    {
      title: "Evaluación Completa",
      description: "Escaneo 3D, radiografías digitales y análisis predictivo con IA en una sola visita.",
    },
    {
      title: "Plan Personalizado",
      description: "Recibe tu informe detallado con recomendaciones y plan de tratamiento preventivo.",
    },
    {
      title: "Seguimiento Continuo",
      description: "Monitoreo de tu salud dental con alertas y recordatorios personalizados.",
    },
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Paciente desde 2023",
      content: "La evaluación predictiva detectó un problema que nunca habría notado. Ahora mi tratamiento fue mucho más simple.",
      rating: 5,
    },
    {
      name: "Carlos Mendoza",
      role: "Paciente desde 2022",
      content: "El proceso de reserva online y el pago fueron súper fáciles. La clínica es de primer nivel.",
      rating: 5,
    },
    {
      name: "Ana Rodríguez",
      role: "Paciente desde 2024",
      content: "Finalmente una clínica que usa tecnología real para prevenir problemas, no solo tratarlos.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-20 lg:pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Odontología Predictiva</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                El futuro de tu{" "}
                <span className="text-gradient">salud dental</span>{" "}
                comienza hoy
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
                En Clínica Miró utilizamos inteligencia artificial y tecnología predictiva 
                para anticipar problemas dentales y ofrecerte tratamientos preventivos personalizados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-base">
                  <Link to="/evaluacion-premium">
                    Reservar Evaluación Premium
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="text-base">
                  <a href="#servicios">Ver Servicios</a>
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-border">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    +500 pacientes satisfechos
                  </p>
                </div>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden card-shadow">
                <img
                  src={heroDental}
                  alt="Interior moderno de Clínica Miró"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-5 card-shadow border border-border animate-float">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground">98% Precisión</p>
                    <p className="text-sm text-muted-foreground">en diagnósticos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-secondary/30" id="servicios">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tecnología al servicio de tu sonrisa
            </h2>
            <p className="text-muted-foreground text-lg">
              Combinamos la experiencia clínica con las herramientas más avanzadas 
              para ofrecerte una atención dental sin precedentes.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Premium Evaluation CTA */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden card-shadow">
                <img
                  src={dentistPortrait}
                  alt="Dra. especialista en odontología predictiva"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -top-6 -right-6 bg-card rounded-2xl p-5 card-shadow border border-border">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-display font-semibold text-foreground">+15 años</p>
                    <p className="text-sm text-muted-foreground">de experiencia</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                <span>Evaluación Premium</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Conoce el estado real de tu salud dental
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Nuestra Evaluación Premium incluye un análisis completo con tecnología 
                de vanguardia, diagnóstico predictivo con IA y un plan de tratamiento 
                personalizado para prevenir problemas futuros.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Escaneo intraoral 3D de alta definición",
                  "Radiografías digitales panorámicas",
                  "Análisis predictivo con inteligencia artificial",
                  "Plan de tratamiento preventivo personalizado",
                  "Consulta de seguimiento incluida",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-end gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground line-through">$120.000</p>
                  <p className="font-display text-4xl font-bold text-foreground">$89.990</p>
                </div>
                <p className="text-sm text-muted-foreground pb-1">CLP / evaluación completa</p>
              </div>
              <Button size="lg" asChild className="text-base">
                <Link to="/evaluacion-premium">
                  Reservar Ahora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Un proceso simple y transparente
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Hemos diseñado cada paso para que tu experiencia sea cómoda, 
                rápida y sin complicaciones.
              </p>
              <div className="space-y-0">
                {steps.map((step, index) => (
                  <ProcessStep
                    key={step.title}
                    number={index + 1}
                    title={step.title}
                    description={step.description}
                    isLast={index === steps.length - 1}
                  />
                ))}
              </div>
            </div>
            <div className="bg-card rounded-3xl p-8 lg:p-10 card-shadow border border-border">
              <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                ¿Por qué elegirnos?
              </h3>
              <div className="space-y-6">
                {[
                  {
                    title: "Tecnología de Vanguardia",
                    desc: "Equipamiento dental de última generación importado de Alemania y Japón.",
                  },
                  {
                    title: "Equipo Especializado",
                    desc: "Profesionales certificados con formación continua en las técnicas más avanzadas.",
                  },
                  {
                    title: "Atención Personalizada",
                    desc: "Cada paciente recibe un plan único basado en su historial y necesidades específicas.",
                  },
                  {
                    title: "Garantía de Satisfacción",
                    desc: "Si no quedas satisfecho con tu evaluación, te devolvemos tu dinero.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Lo que dicen nuestros pacientes
            </h2>
            <p className="text-muted-foreground text-lg">
              Miles de sonrisas transformadas gracias a nuestra tecnología predictiva.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-card rounded-2xl p-6 card-shadow border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="font-semibold text-muted-foreground">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Tu sonrisa perfecta te espera
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Agenda tu Evaluación Premium hoy y descubre cómo la odontología 
            predictiva puede transformar tu salud dental.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-base"
          >
            <Link to="/evaluacion-premium">
              Reservar Evaluación Premium
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
