import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  CheckCircle2, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Download,
  Share2
} from "lucide-react";

interface BookingData {
  nombre: string;
  email: string;
  telefono: string;
  motivo?: string;
  transactionId: string;
  fecha: string;
}

const Confirmacion = () => {
  const [booking, setBooking] = useState<BookingData | null>(null);

  useEffect(() => {
    const storedBooking = sessionStorage.getItem("booking");
    if (storedBooking) {
      setBooking(JSON.parse(storedBooking));
    }
  }, []);

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 lg:pt-24">
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              No se encontró información de reserva
            </h1>
            <p className="text-muted-foreground mb-8">
              Parece que no tienes una reserva reciente.
            </p>
            <Button asChild>
              <Link to="/evaluacion-premium">
                Reservar Evaluación Premium
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 lg:pt-24">
        {/* Success Banner */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-success/10 via-transparent to-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 animate-fade-in">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 animate-slide-up">
                ¡Reserva Confirmada!
              </h1>
              <p className="text-muted-foreground text-lg animate-slide-up">
                Gracias por confiar en Clínica Miró, {booking.nombre.split(" ")[0]}.
                Tu pago ha sido procesado exitosamente.
              </p>
            </div>
          </div>
        </section>

        {/* Confirmation Details */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Transaction Summary */}
              <div className="bg-card rounded-2xl p-6 lg:p-8 card-shadow border border-border mb-8">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Número de transacción</p>
                    <p className="font-mono font-semibold text-foreground">{booking.transactionId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Monto pagado</p>
                    <p className="font-display text-2xl font-bold text-foreground">$89.990</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Servicio</p>
                    <p className="font-medium text-foreground">Evaluación Premium</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fecha de pago</p>
                    <p className="font-medium text-foreground">
                      {new Date(booking.fecha).toLocaleDateString("es-CL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nombre</p>
                    <p className="font-medium text-foreground">{booking.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium text-foreground">{booking.email}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar comprobante
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-card rounded-2xl p-6 lg:p-8 card-shadow border border-border mb-8">
                <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                  Próximos pasos
                </h2>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Revisa tu correo</h3>
                      <p className="text-sm text-muted-foreground">
                        Hemos enviado la confirmación y detalles a <strong>{booking.email}</strong>. 
                        Revisa también tu carpeta de spam.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Espera nuestra llamada</h3>
                      <p className="text-sm text-muted-foreground">
                        En las próximas 24-48 horas hábiles te contactaremos para agendar 
                        tu evaluación en el horario que más te acomode.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">¿Tienes preguntas?</h3>
                      <p className="text-sm text-muted-foreground">
                        Puedes contactarnos directamente al{" "}
                        <a href="tel:+56912345678" className="text-primary hover:underline">
                          +56 9 1234 5678
                        </a>{" "}
                        o escribir a{" "}
                        <a href="mailto:contacto@clinicamiro.cl" className="text-primary hover:underline">
                          contacto@clinicamiro.cl
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Info */}
              <div className="bg-card rounded-2xl p-6 lg:p-8 card-shadow border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Ubicación de la clínica</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Av. Providencia 1234, Of. 501, Providencia, Santiago
                    </p>
                    <a 
                      href="https://maps.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Ver en Google Maps
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Back to Home */}
              <div className="text-center mt-10">
                <Button asChild variant="outline" size="lg">
                  <Link to="/">
                    Volver al inicio
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Confirmacion;
