import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortalHeader, EvaluacionesTab, PagosTab, CitasTab } from "@/components/portal";

/* ─── RUT helpers ─── */
function formatRutInput(value: string): string {
  const cleaned = value.replace(/[^0-9kK]/g, "").toUpperCase();
  if (cleaned.length <= 1) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return `${body}-${dv}`;
}

function isValidRUT(rut: string): boolean {
  const cleaned = rut.replace(/[^0-9kK]/g, "").toUpperCase();
  if (cleaned.length < 8 || cleaned.length > 9) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expected = 11 - (sum % 11);
  const calculated = expected === 11 ? "0" : expected === 10 ? "K" : expected.toString();
  return dv === calculated;
}

/* ─── Data interfaces for me endpoint ─── */
interface PatientData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  rut: string | null;
  dentalink_patient_id: string | null;
  created_at: string;
  appointments: Array<{
    id: string;
    date: string;
    time: string;
    type_name: string;
    status: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  }>;
  funnel_history: Array<{
    id: string;
    status: string;
    created_at: string;
    ia_scan_result?: Record<string, unknown> | null;
  }>;
  dentalink_patient: Record<string, unknown> | null;
  dentalink_treatments: Array<Record<string, unknown>>;
  dentalink_files: Array<Record<string, unknown>>;
}

/* ─── Map me response → tab interfaces ─── */
function mapToEvaluaciones(data: PatientData) {
  return data.funnel_history.map((f) => {
    // Extract clinical route from IA result if available
    const iaResult = f.ia_scan_result as Record<string, unknown> | null;
    let rutaSugerida: string | null = null;
    let resumenIa: string | null = null;
    
    if (iaResult) {
      // Determine route from IA findings
      const boneLoss = iaResult.bone_loss_risk as Record<string, unknown> | undefined;
      const periodontal = iaResult.periodontal_risk as Record<string, unknown> | undefined;
      const caries = iaResult.caries_risk as Record<string, unknown> | undefined;
      const alignment = iaResult.alignment as Record<string, unknown> | undefined;
      
      if (boneLoss?.level === 'high') rutaSugerida = 'implantes';
      else if (periodontal?.level === 'high') rutaSugerida = 'caries';
      else if (caries?.level === 'high') rutaSugerida = 'caries';
      else if (alignment?.level === 'high' || alignment?.level === 'moderate') rutaSugerida = 'ortodoncia';
      else rutaSugerida = 'estetica';

      // Build summary
      const overallRisk = iaResult.overall_risk as string;
      const treatments = iaResult.suggested_treatments as string[] | undefined;
      resumenIa = `Riesgo general: ${overallRisk || 'N/A'}${treatments?.length ? `. Tratamientos sugeridos: ${treatments.join(', ')}` : ''}`;
    }

    return {
      id: f.id,
      nombre: data.full_name,
      email: data.email,
      tipo_ruta: "evaluacion",
      ruta_sugerida: rutaSugerida,
      estado_evaluacion: mapFunnelStatus(f.status),
      resumen_ia: resumenIa,
      payment_status: f.status === "PAID" ? "approved" : f.status === "CHECKOUT_CREATED" ? "pending" : "",
      created_at: f.created_at,
      cita_agendada_at: f.status === "SCHEDULED" ? f.created_at : null,
    };
  });
}

function mapFunnelStatus(status: string): string {
  const map: Record<string, string> = {
    LEAD: "iniciada",
    IA_DONE: "ia_analizada",
    CHECKOUT_CREATED: "pago_pendiente",
    PAID: "pago_completado",
    SCHEDULED: "cita_agendada",
  };
  return map[status] || status;
}

function mapToCitas(data: PatientData) {
  // Combine appointments from Supabase + Dentalink treatments
  const supabaseCitas = data.appointments.map((apt) => ({
    id: apt.id,
    cita_agendada_at: `${apt.date}T${apt.time}`,
    ia_ruta_sugerida: null as string | null,
    stage: apt.status === "scheduled" || apt.status === "confirmed" ? "SCHEDULED" : apt.status === "completed" ? "COMPLETED" : apt.status,
    nombre: apt.type_name,
  }));

  // Also add from funnel_history where status is PAID (pending to schedule)
  const pendientes = data.funnel_history
    .filter(f => f.status === 'PAID')
    .map(f => ({
      id: f.id,
      cita_agendada_at: null as string | null,
      ia_ruta_sugerida: null as string | null,
      stage: 'PAID',
      nombre: 'Evaluación Premium',
    }));

  return [...supabaseCitas, ...pendientes];
}

function mapToPagos(data: PatientData) {
  return data.payments.map((pay) => ({
    id: pay.id,
    payment_status: pay.status,
    monto_pagado: pay.amount,
    paid_at: pay.status === "approved" ? pay.created_at : null,
    checkout_url: null as string | null,
    ia_ruta_sugerida: null as string | null,
    created_at: pay.created_at,
  }));
}

const Portal = () => {
  const [step, setStep] = useState<"login" | "dashboard">("login");
  const [rut, setRut] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setCheckingSession(false), 4000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      clearTimeout(timeout);
      if (session?.user) {
        await fetchPatientData(session.access_token);
      } else {
        setStep("login");
        setPatientData(null);
      }
      setCheckingSession(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout);
      if (session?.user) {
        fetchPatientData(session.access_token);
      }
      setCheckingSession(false);
    }).catch(() => {
      clearTimeout(timeout);
      setCheckingSession(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  async function fetchPatientData(token: string) {
    try {
      const res = await supabase.functions.invoke("me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setPatientData(res.data.data);
        setStep("dashboard");
      }
    } catch (err) {
      console.error("Error fetching patient data:", err);
    }
  }

  async function handleRutLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidRUT(rut)) {
      setError("RUT inválido. Verifica el formato.");
      return;
    }
    setLoading(true);
    try {
      const formattedRut = formatRutInput(rut);
      const res = await supabase.functions.invoke("auth-rut-login", {
        body: { rut: formattedRut },
      });
      if (res.data?.error) {
        setError(res.data.error);
      } else if (res.data?.success) {
        const { access_token, refresh_token } = res.data.data;
        await supabase.auth.setSession({ access_token, refresh_token });
        await fetchPatientData(access_token);
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/portal",
      });
      if (error) {
        setError("Error con Google. Intenta nuevamente.");
        console.error("Google OAuth error:", error);
      }
    } catch {
      setError("Error de conexión con Google.");
    } finally {
      setGoogleLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground text-lg"
        >
          Verificando sesión...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {step === "dashboard" && <PortalHeader />}

      <main className={step === "dashboard" ? "pt-4 pb-16 px-4" : "pt-24 pb-16 px-6"}>
        <AnimatePresence mode="wait">
          {step === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-md mx-auto"
            >
              <div className="text-center mb-10">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-3xl font-serif text-foreground mb-3">Portal Paciente</h1>
                <p className="text-lg text-muted-foreground">
                  Accede a tu ficha clínica
                </p>
              </div>

              <form onSubmit={handleRutLogin} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 tracking-wide uppercase">
                    RUT
                  </label>
                  <Input
                    type="text"
                    value={formatRutInput(rut)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9kK]/g, "");
                      if (raw.length <= 9) setRut(raw);
                    }}
                    placeholder="12345678-9"
                    className="h-12 text-lg tracking-wider text-center font-mono bg-muted/30 border-border/50 focus:border-primary"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">Sin puntos, con guión</p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || rut.length < 8}
                  className="w-full h-12 tracking-widest uppercase text-sm"
                >
                  {loading ? "Ingresando..." : "Ingresar con RUT"}
                </Button>
              </form>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground tracking-widest uppercase">o</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full h-12 text-sm tracking-wide gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {googleLoading ? "Conectando..." : "Continuar con Google"}
              </Button>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-destructive text-sm text-center mt-4"
                >
                  {error}
                </motion.p>
              )}

              <p className="text-xs text-muted-foreground text-center mt-8">
                ¿No tienes cuenta? Completa tu{" "}
                <Link to="/evaluacion" className="text-primary hover:underline">
                  evaluación
                </Link>{" "}
                para crear tu ficha.
              </p>
            </motion.div>
          )}

          {step === "dashboard" && patientData && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="container mx-auto max-w-4xl"
            >
              <div className="mb-6">
                <h1 className="text-2xl font-serif text-foreground">
                  Hola, {patientData.full_name.split(" ")[0]}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {patientData.email}
                  {patientData.rut && <span className="ml-2 font-mono">· {patientData.rut}</span>}
                  {patientData.dentalink_patient_id && (
                    <span className="ml-2 text-gold-muted">· Dentalink vinculado</span>
                  )}
                </p>
              </div>

              {/* Dentalink treatments summary */}
              {patientData.dentalink_treatments.length > 0 && (
                <div className="mb-6 p-4 border border-gold-muted/20 bg-gold-muted/5 rounded-lg">
                  <p className="caption text-gold-muted tracking-widest mb-2">TRATAMIENTOS EN CURSO (DENTALINK)</p>
                  <div className="space-y-2">
                    {patientData.dentalink_treatments.slice(0, 3).map((tto, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">
                          {(tto as Record<string, string>).nombre || (tto as Record<string, string>).name || `Tratamiento ${i + 1}`}
                        </span>
                        <span className="text-muted-foreground">
                          {(tto as Record<string, string>).estado || (tto as Record<string, string>).status || ''}
                        </span>
                      </div>
                    ))}
                    {patientData.dentalink_treatments.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{patientData.dentalink_treatments.length - 3} más
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Dentalink files */}
              {patientData.dentalink_files.length > 0 && (
                <div className="mb-6 p-4 border border-border rounded-lg">
                  <p className="caption text-muted-foreground tracking-widest mb-2">ARCHIVOS CLÍNICOS</p>
                  <div className="flex flex-wrap gap-2">
                    {patientData.dentalink_files.slice(0, 5).map((file, i) => (
                      <span key={i} className="text-xs px-3 py-1 bg-secondary rounded-full text-muted-foreground">
                        {(file as Record<string, string>).nombre || (file as Record<string, string>).name || `Archivo ${i + 1}`}
                      </span>
                    ))}
                    {patientData.dentalink_files.length > 5 && (
                      <span className="text-xs px-3 py-1 bg-secondary rounded-full text-muted-foreground">
                        +{patientData.dentalink_files.length - 5}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <Tabs defaultValue="citas" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="citas">Citas</TabsTrigger>
                  <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
                  <TabsTrigger value="pagos">Pagos</TabsTrigger>
                </TabsList>
                <TabsContent value="citas" className="mt-6">
                  <CitasTab citas={mapToCitas(patientData)} isLoading={false} />
                </TabsContent>
                <TabsContent value="evaluaciones" className="mt-6">
                  <EvaluacionesTab evaluaciones={mapToEvaluaciones(patientData)} isLoading={false} />
                </TabsContent>
                <TabsContent value="pagos" className="mt-6">
                  <PagosTab pagos={mapToPagos(patientData)} isLoading={false} />
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Portal;
