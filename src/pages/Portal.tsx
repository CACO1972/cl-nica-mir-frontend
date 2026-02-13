import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut, Calendar, CreditCard, FileText, User, Shield } from "lucide-react";
import logoClinicaMiro from "@/assets/logo-clinica-miro.png";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  }>;
  dentalink_patient: Record<string, unknown> | null;
}

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

const Portal = () => {
  const [step, setStep] = useState<"login" | "dashboard">("login");
  const [rut, setRut] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchPatientData(session.access_token);
      } else {
        setStep("login");
        setPatientData(null);
      }
      setCheckingSession(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchPatientData(session.access_token);
      }
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
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

  async function handleLogout() {
    await supabase.auth.signOut();
    setStep("login");
    setPatientData(null);
    setRut("");
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-muted-foreground body-large"
        >
          Verificando sesión...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/30">
        <div className="max-w-[var(--container-max)] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            <img src={logoClinicaMiro} alt="Clínica Miró" className="h-8 w-auto" />
          </Link>
          {step === "dashboard" && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm tracking-widest uppercase"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          )}
        </div>
      </header>

      <main className="pt-24 pb-16 px-6">
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
                <h1 className="display-medium text-foreground mb-3">Portal Paciente</h1>
                <p className="body-large text-muted-foreground">
                  Accede a tu ficha clínica
                </p>
              </div>

              {/* RUT Login */}
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

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground tracking-widest uppercase">o</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Google Login */}
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
            <DashboardStep key="dashboard" data={patientData} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/* ─── Helpers ─── */
const STATUS_LABELS: Record<string, string> = {
  LEAD: "Ingresado",
  IA_DONE: "Análisis IA listo",
  CHECKOUT_CREATED: "Pago pendiente",
  PAID: "Pagado",
  SCHEDULED: "Agendado",
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  scheduled: "Agendada",
  completed: "Completada",
  confirmed: "Confirmada",
  cancelled_appointment: "Cancelada",
};

function statusLabel(raw: string): string {
  return STATUS_LABELS[raw] || raw;
}

function statusColor(raw: string): string {
  switch (raw) {
    case "PAID": case "approved": case "completed": case "confirmed":
      return "bg-green-500/10 text-green-600";
    case "CHECKOUT_CREATED": case "pending":
      return "bg-yellow-500/10 text-yellow-600";
    case "rejected": case "cancelled": case "cancelled_appointment":
      return "bg-destructive/10 text-destructive";
    case "SCHEDULED": case "scheduled":
      return "bg-blue-500/10 text-blue-600";
    case "IA_DONE":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/* ─── Dashboard Step ─── */
function DashboardStep({ data }: { data: PatientData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{data.full_name}</h1>
            <p className="text-sm text-muted-foreground">
              {data.rut && <span className="font-mono">{data.rut}</span>}
              {data.dentalink_patient_id && (
                <span className="ml-3 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Ficha Dentalink vinculada
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-muted/20 rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground tracking-wide uppercase text-sm">Citas</h2>
          </div>
          {data.appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin citas registradas.</p>
          ) : (
            <ul className="space-y-3">
              {data.appointments.map((apt) => (
                <li key={apt.id} className="flex justify-between items-start text-sm">
                  <div>
                    <p className="text-foreground font-medium">{apt.type_name}</p>
                    <p className="text-muted-foreground">{apt.date} · {apt.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(apt.status)}`}>
                    {statusLabel(apt.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-muted/20 rounded-2xl p-6 border border-border/30">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground tracking-wide uppercase text-sm">Pagos</h2>
          </div>
          {data.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin pagos registrados.</p>
          ) : (
            <ul className="space-y-3">
              {data.payments.map((pay) => (
                <li key={pay.id} className="flex justify-between items-center text-sm">
                  <span className="text-foreground font-medium">
                    ${pay.amount.toLocaleString("es-CL")} {pay.currency}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(pay.status)}`}>
                    {statusLabel(pay.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-muted/20 rounded-2xl p-6 border border-border/30 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground tracking-wide uppercase text-sm">Evaluaciones</h2>
          </div>
          {data.funnel_history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin evaluaciones registradas.</p>
          ) : (
            <ul className="space-y-3">
              {data.funnel_history.map((f) => (
                <li key={f.id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {new Date(f.created_at).toLocaleDateString("es-CL")}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(f.status)}`}>
                    {statusLabel(f.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {data.dentalink_patient && (
          <section className="bg-muted/20 rounded-2xl p-6 border border-border/30 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground tracking-wide uppercase text-sm">Ficha Clínica Dentalink</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {Object.entries(data.dentalink_patient)
                .filter(([key]) => !key.startsWith("id") && key !== "id_paciente")
                .slice(0, 12)
                .map(([key, value]) => (
                  <div key={key}>
                    <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-foreground">{String(value || "—")}</p>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}

export default Portal;
