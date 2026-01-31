import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  CheckCircle2, 
  Shield, 
  CreditCard, 
  Clock, 
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Ingresa un email válido").max(255),
  telefono: z.string().min(8, "Ingresa un teléfono válido").max(20),
  motivo: z.string().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

// Simulated Supabase config - replace with actual values
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const EvaluacionPremium = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      email: "",
      telefono: "",
      motivo: "",
    },
  });

  const handlePayment = async (data: FormData) => {
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // If Supabase is configured, call the backend endpoint
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        try {
          const response = await fetch(
            `${SUPABASE_URL}/functions/v1/crear-paciente-dentalink`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                nombre: data.nombre,
                email: data.email,
                telefono: data.telefono,
                motivo: data.motivo || "Evaluación Premium",
                monto: 89990,
                fecha_pago: new Date().toISOString(),
              }),
            }
          );

          if (!response.ok) {
            console.warn("Backend call failed, but continuing with flow");
          }
        } catch (error) {
          console.warn("Could not reach backend:", error);
        }
      }

      // Store booking data in sessionStorage for confirmation page
      sessionStorage.setItem(
        "booking",
        JSON.stringify({
          ...data,
          transactionId: `TXN-${Date.now()}`,
          fecha: new Date().toISOString(),
        })
      );

      toast.success("¡Pago procesado exitosamente!");
      navigate("/confirmacion");
    } catch (error) {
      toast.error("Error al procesar el pago. Intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 lg:pt-24">
        {/* Hero */}
        <section className="py-12 lg:py-16 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Evaluación Premium</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Reserva tu Evaluación Premium
              </h1>
              <p className="text-muted-foreground text-lg">
                Completa tus datos y realiza el pago para agendar tu evaluación 
                dental completa con tecnología predictiva.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-6xl mx-auto">
              {/* Form */}
              <div className="lg:col-span-3">
                <div className="bg-card rounded-2xl p-6 lg:p-8 card-shadow border border-border">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                    Datos del Paciente
                  </h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre completo</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ej: María González Pérez" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid sm:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Correo electrónico</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="tu@email.com" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="telefono"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Teléfono</FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel"
                                  placeholder="+56 9 1234 5678" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="motivo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Motivo de consulta (opcional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Cuéntanos brevemente qué te gustaría evaluar o si tienes alguna molestia específica..."
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center gap-3 mb-4">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Pago seguro con tarjeta de crédito o débito
                          </span>
                        </div>

                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full text-base"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Procesando pago...
                            </>
                          ) : (
                            <>
                              Pagar $89.990 CLP
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center mt-4">
                          Al continuar, aceptas nuestros términos de servicio y política de privacidad.
                        </p>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>

              {/* Summary */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl p-6 lg:p-8 card-shadow border border-border sticky top-28">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-6">
                    Resumen de tu reserva
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">Evaluación Premium</p>
                        <p className="text-sm text-muted-foreground">Diagnóstico completo con IA</p>
                      </div>
                      <p className="font-semibold text-foreground">$89.990</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-foreground">Total a pagar</p>
                      <p className="font-display text-2xl font-bold text-foreground">$89.990</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">CLP · Impuestos incluidos</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Incluye:</h4>
                    {[
                      "Escaneo intraoral 3D",
                      "Radiografías digitales",
                      "Análisis predictivo con IA",
                      "Plan de tratamiento",
                      "Consulta de seguimiento",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Pago 100% seguro</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Agendamiento en 24-48 hrs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EvaluacionPremium;
