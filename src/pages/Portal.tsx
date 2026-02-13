import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, LogOut, Calendar, CreditCard, FileText, User, Shield } from "lucide-react";
import logoClinicaMiro from "@/assets/logo-clinica-miro.png";
import { supabase } from "@/integrations/supabase/client";
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

type PortalStep = "login" | "otp" | "dashboard";

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
  const [step, setStep] = useState<PortalStep>("login");
  const [rut, setRut] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  // Check existing session on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

  async function handleRutSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValidRUT(rut)) {
      setError("RUT inválido. Verifica el formato.");
      return;
    }

    setLoading(true);
    try {
      const formattedRut = formatRutInput(rut);
      const res = await supabase.functions.invoke("auth-login", {
        body: { identifier: formattedRut, method: "otp" },
      });

      if (res.data?.error) {
        setError(res.data.error);
      } else if (res.data?.success) {
        setEmail(res.data.data.email_masked);
        setStep("otp");
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }

    setLoading(true);
    try {
      // We need the actual email to verify OTP - get it from the RUT lookup
      const formattedRut = formatRutInput(rut);
      
      // First get the real email by calling auth-login again (or we stored it)
      // Actually we need to verify OTP with Supabase Auth directly
      // The auth-login sent OTP to the email associated with the RUT
      // We need to get the actual email from profiles to verify
      const { data: profileData } = await supabase.functions.invoke("auth-login", {
        body: { identifier: formattedRut, method: "otp" },
      });

      // For OTP verification, we use supabase.auth.verifyOtp
      // But we need the real email. Let's use a different approach:
      // Call a helper that returns the email for the RUT
      // Actually the auth-login response includes email_masked but not the full email
      // We need to verify using the service role - let's create a verify endpoint
      
      // For now, use the Supabase auth verifyOtp which needs the real email
      // The workaround: we'll ask the user for their email too, or use magic link instead
      
      // Better approach: use signInWithOtp verification
      // We need the real email - let's get it from the profile via service role
      const verifyRes = await supabase.functions.invoke("auth-verify-otp", {
        body: { rut: formattedRut, otp_code: otp },
      });

      if (verifyRes.data?.error) {
        setError(verifyRes.data.error);
      } else if (verifyRes.data?.success) {
        const { access_token, refresh_token } = verifyRes.data.data;
        await supabase.auth.setSession({ access_token, refresh_token });
        await fetchPatientData(access_token);
      }
    } catch {
      setError("Código inválido o expirado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setStep("login");
    setPatientData(null);
    setRut("");
    setOtp("");
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
      {/* Header */}
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
            <LoginStep
              key="login"
              rut={rut}
              setRut={setRut}
              error={error}
              loading={loading}
              onSubmit={handleRutSubmit}
            />
          )}
          {step === "otp" && (
            <OtpStep
              key="otp"
              otp={otp}
              setOtp={setOtp}
              email={email}
              error={error}
              loading={loading}
              onSubmit={handleOtpSubmit}
              onBack={() => { setStep("login"); setError(""); setOtp(""); }}
            />
          )}
          {step === "dashboard" && patientData && (
            <DashboardStep key="dashboard" data={patientData} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/* ─── Login Step ─── */
function LoginStep({
  rut, setRut, error, loading, onSubmit,
}: {
  rut: string;
  setRut: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  function handleRutChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9kK]/g, "");
    if (raw.length <= 9) setRut(raw);
  }

  return (
    <motion.div
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
          Ingresa tu RUT para acceder a tu ficha clínica
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2 tracking-wide uppercase">
            RUT
          </label>
          <Input
            type="text"
            value={formatRutInput(rut)}
            onChange={handleRutChange}
            placeholder="12345678-9"
            className="h-12 text-lg tracking-wider text-center font-mono bg-muted/30 border-border/50 focus:border-primary"
            autoFocus
          />
          <p className="text-xs text-muted-foreground mt-2">Sin puntos, con guión</p>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-destructive text-sm text-center"
          >
            {error}
          </motion.p>
        )}

        <Button
          type="submit"
          disabled={loading || rut.length < 8}
          className="w-full h-12 tracking-widest uppercase text-sm"
        >
          {loading ? "Verificando..." : "Acceder"}
        </Button>
      </form>
    </motion.div>
  );
}

/* ─── OTP Step ─── */
function OtpStep({
  otp, setOtp, email, error, loading, onSubmit, onBack,
}: {
  otp: string;
  setOtp: (v: string) => void;
  email: string;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-10">
        <h1 className="display-medium text-foreground mb-3">Código de verificación</h1>
        <p className="body-large text-muted-foreground">
          Enviamos un código de 6 dígitos a <span className="text-foreground font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="h-14 text-2xl tracking-[0.5em] text-center font-mono bg-muted/30 border-border/50 focus:border-primary"
          autoFocus
        />

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-destructive text-sm text-center"
          >
            {error}
          </motion.p>
        )}

        <Button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full h-12 tracking-widest uppercase text-sm"
        >
          {loading ? "Verificando..." : "Confirmar"}
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver
        </button>
      </form>
    </motion.div>
  );
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
      {/* Patient Header */}
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
        {/* Appointments */}
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
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    apt.status === "scheduled" ? "bg-primary/10 text-primary" :
                    apt.status === "completed" ? "bg-green-500/10 text-green-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {apt.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Payments */}
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
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    pay.status === "approved" ? "bg-green-500/10 text-green-600" :
                    pay.status === "pending" ? "bg-yellow-500/10 text-yellow-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {pay.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Funnel History */}
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
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {f.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Dentalink Data */}
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
