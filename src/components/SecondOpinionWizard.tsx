import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft, ChevronRight, Loader2, FileText, Video, CheckCircle,
  AlertTriangle, Shield, Upload, Camera, Receipt, Sparkles, Clock,
  XCircle, Info,
} from "lucide-react";
import {
  createSecondOpinion,
  requestIAReport,
  createSpecialistCheckout,
  requestBudgetComparison,
  type FlowType,
  type IAReport,
  type BudgetComparisonReport,
} from "@/services/secondOpinionApi";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MedicalData {
  lastVisit: string;        // "less_1y" | "1_3y" | "more_3y" | "never"
  conditions: string[];     // diabetes, hypertension, anticoagulants, none
  currentTreatment: string; // ongoing treatment description
}

interface FormData {
  // Step 1: Personal
  name: string;
  email: string;
  phone: string;
  rut: string;
  // Step 2: Medical
  medical: MedicalData;
  // Step 3: Diagnosis & Doubt
  diagnosis: string;       // what they were told
  doubt: string;           // their specific question/doubt (REQUIRED)
  // Step 4: RX (required)
  rxFile: File | null;
  // Step 5: Flow selection
  flow_type: FlowType;
  // Step 6 (budget only): Budget document
  budgetFile: File | null;
}

const CONDITION_OPTIONS = [
  { value: "diabetes", label: "Diabetes" },
  { value: "hypertension", label: "Hipertensión" },
  { value: "anticoagulants", label: "Anticoagulantes" },
  { value: "bisphosphonates", label: "Bifosfonatos (osteoporosis)" },
  { value: "none", label: "Ninguna" },
];

const LAST_VISIT_OPTIONS = [
  { value: "less_1y", label: "Menos de 1 año" },
  { value: "1_3y", label: "Entre 1 y 3 años" },
  { value: "more_3y", label: "Más de 3 años" },
  { value: "never", label: "Nunca o no recuerdo" },
];

// ─── Component ────────────────────────────────────────────────────────────────
const SecondOpinionWizard = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [secondOpinionId, setSecondOpinionId] = useState<string | null>(null);
  const [iaReport, setIaReport] = useState<IAReport | null>(null);
  const [budgetReport, setBudgetReport] = useState<BudgetComparisonReport | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    rut: "",
    medical: { lastVisit: "", conditions: [], currentTreatment: "" },
    diagnosis: "",
    doubt: "",
    rxFile: null,
    flow_type: "ia_only",
    budgetFile: null,
  });

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateMedical = useCallback((field: keyof MedicalData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      medical: { ...prev.medical, [field]: value },
    }));
  }, []);

  const toggleCondition = useCallback((value: string) => {
    setFormData(prev => {
      const current = prev.medical.conditions;
      if (value === "none") return { ...prev, medical: { ...prev.medical, conditions: ["none"] } };
      const without = current.filter(c => c !== "none");
      return {
        ...prev,
        medical: {
          ...prev.medical,
          conditions: without.includes(value)
            ? without.filter(c => c !== value)
            : [...without, value],
        },
      };
    });
  }, []);

  // ─── Validation ─────────────────────────────────────────────────────────────
  const TOTAL_STEPS = formData.flow_type === "budget_comparison" ? 7 : 6;

  const validateStep = (s: number): boolean => {
    switch (s) {
      case 1:
        return !!formData.name.trim() && formData.email.includes("@") && !!formData.phone.trim();
      case 2:
        return !!formData.medical.lastVisit && formData.medical.conditions.length > 0;
      case 3:
        return formData.diagnosis.trim().length >= 10 && formData.doubt.trim().length >= 10;
      case 4:
        return !!formData.rxFile; // REQUIRED
      case 5:
        return true; // flow_type always has a default
      case 6:
        if (formData.flow_type === "budget_comparison") return !!formData.budgetFile;
        return true;
      default:
        return true;
    }
  };

  // ─── File helpers ────────────────────────────────────────────────────────────
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  // ─── API Calls ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsLoading(true);
    const processingStep = formData.flow_type === "budget_comparison" ? 8 : 7;
    setStep(processingStep);

    try {
      // Convert RX to base64
      let rxData: string | undefined;
      if (formData.rxFile) {
        rxData = await fileToBase64(formData.rxFile);
      }

      // Convert budget doc to base64 (if budget flow)
      let budgetData: string | undefined;
      if (formData.budgetFile && formData.flow_type === "budget_comparison") {
        budgetData = await fileToBase64(formData.budgetFile);
      }

      const response = await createSecondOpinion({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        rut: formData.rut || undefined,
        medical_history: {
          last_visit: formData.medical.lastVisit,
          conditions: formData.medical.conditions,
          current_treatment: formData.medical.currentTreatment || undefined,
        },
        diagnosis: formData.diagnosis,
        doubt: formData.doubt,
        flow_type: formData.flow_type,
        rx_data: rxData,
        rx_name: formData.rxFile?.name,
        rx_mime: formData.rxFile?.type,
        budget_data: budgetData,
        budget_name: formData.budgetFile?.name,
        budget_mime: formData.budgetFile?.type,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || "Error al crear la solicitud");
      }

      const opinionId = response.data.id;
      setSecondOpinionId(opinionId);

      if (formData.flow_type === "budget_comparison") {
        // Budget comparison flow → OCR + compare
        const compResult = await requestBudgetComparison(opinionId);
        if (compResult.success && compResult.data) {
          setBudgetReport(compResult.data.budget_report);
          setStep(9); // budget results
        } else {
          throw new Error(compResult.error || "Error al comparar presupuesto");
        }
      } else {
        // IA analysis flow
        const iaResult = await requestIAReport(opinionId);
        if (iaResult.success && iaResult.data) {
          setIaReport(iaResult.data.ia_report);
          setStep(formData.flow_type === "ia_plus_specialist" ? 10 : 8); // results
        } else {
          throw new Error(iaResult.error || "Error al generar el informe");
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error de conexión";
      toast({ title: "Error", description: msg, variant: "destructive" });
      // Go back to flow selection
      setStep(formData.flow_type === "budget_comparison" ? 6 : 5);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecialistCheckout = async () => {
    if (!secondOpinionId) return;
    setIsLoading(true);
    try {
      const response = await createSpecialistCheckout(secondOpinionId);
      if (response.success && response.data) {
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error(response.error || "No se pudo crear el pago");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error al procesar el pago";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const nextStep = () => {
    if (!validateStep(step)) {
      const msgs: Record<number, string> = {
        1: "Completa nombre, email y teléfono",
        2: "Indica tu última visita y condiciones médicas",
        3: "Describe el diagnóstico recibido y tu duda específica (mínimo 10 caracteres cada uno)",
        4: "La radiografía es obligatoria para continuar",
        6: "Adjunta el presupuesto para comparar",
      };
      toast({ title: "Campo requerido", description: msgs[step] || "Completa los campos requeridos", variant: "destructive" });
      return;
    }
    // Step 5 → step 6 only if budget comparison, else submit
    if (step === 5) {
      if (formData.flow_type === "budget_comparison") {
        setStep(6);
      } else {
        handleSubmit();
      }
      return;
    }
    if (step === 6 && formData.flow_type === "budget_comparison") {
      handleSubmit();
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step > 1 && step <= 6) setStep(s => s - 1);
  };

  // ─── Urgency helpers ─────────────────────────────────────────────────────────
  const urgencyColor = (u: string) =>
    u === "high" ? "text-destructive" : u === "moderate" ? "text-yellow-500" : "text-green-500";
  const urgencyLabel = (u: string) =>
    u === "high" ? "Urgente" : u === "moderate" ? "Requiere atención" : "Sin urgencia inmediata";

  // ─── Progress indicator ───────────────────────────────────────────────────────
  const progressStep = Math.min(step, 6);
  const progress = (progressStep / 6) * 100;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col justify-center px-6 lg:px-12 py-16">
      <div className="max-w-2xl mx-auto w-full">

        {/* Progress bar — only show for input steps */}
        {step <= 6 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="caption text-muted-foreground">Paso {step} de {TOTAL_STEPS}</span>
              <span className="caption text-muted-foreground">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="h-0.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gold"
                initial={{ width: 0 }}
                animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ─ STEP 1: Datos personales ──────────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div>
                <p className="caption text-muted-foreground mb-3">Paso 1 · Datos personales</p>
                <h2 className="display-medium text-foreground">¿Quién eres?</h2>
                <p className="mt-4 body-large text-muted-foreground">
                  Necesitamos tus datos para enviarte el informe y coordinar si es necesario.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground font-medium">Nombre completo *</Label>
                  <Input id="name" value={formData.name} onChange={e => updateField("name", e.target.value)}
                    placeholder="Ana García" className="bg-secondary border-border focus:border-gold-muted h-14 text-base" />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => updateField("email", e.target.value)}
                      placeholder="ana@ejemplo.com" className="bg-secondary border-border focus:border-gold-muted h-14 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground font-medium">Teléfono *</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={e => updateField("phone", e.target.value)}
                      placeholder="+56 9 1234 5678" className="bg-secondary border-border focus:border-gold-muted h-14 text-base" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rut" className="text-foreground font-medium">RUT <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                  <Input id="rut" value={formData.rut} onChange={e => updateField("rut", e.target.value)}
                    placeholder="12.345.678-9" className="bg-secondary border-border focus:border-gold-muted h-14 text-base" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ─ STEP 2: Datos médicos ─────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div>
                <p className="caption text-muted-foreground mb-3">Paso 2 · Historial dental</p>
                <h2 className="display-medium text-foreground">Cuéntanos sobre tu salud dental</h2>
                <p className="mt-4 body-large text-muted-foreground">
                  Información breve para contextualizar tu análisis.
                </p>
              </div>

              <div className="space-y-8">
                {/* Last visit */}
                <div className="space-y-3">
                  <Label className="text-foreground font-medium">¿Cuándo fue tu última visita al dentista? *</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {LAST_VISIT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateMedical("lastVisit", opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          formData.medical.lastVisit === opt.value
                            ? "border-gold-muted bg-gold-muted/10 text-foreground"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                <div className="space-y-3">
                  <Label className="text-foreground font-medium">¿Tienes alguna de estas condiciones? * <span className="text-muted-foreground font-normal">(selecciona todas las que apliquen)</span></Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {CONDITION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => toggleCondition(opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          formData.medical.conditions.includes(opt.value)
                            ? "border-gold-muted bg-gold-muted/10 text-foreground"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        <span className="text-sm font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current treatment */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">¿Estás en tratamiento dental actualmente? <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                  <Input
                    value={formData.medical.currentTreatment}
                    onChange={e => updateMedical("currentTreatment", e.target.value)}
                    placeholder="Ej: ortodoncia, implante en proceso..."
                    className="bg-secondary border-border focus:border-gold-muted h-14 text-base"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ─ STEP 3: Diagnóstico y duda ────────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div>
                <p className="caption text-muted-foreground mb-3">Paso 3 · Tu diagnóstico y duda</p>
                <h2 className="display-medium text-foreground">¿Qué te dijeron y qué quieres saber?</h2>
                <p className="mt-4 body-large text-muted-foreground">
                  Escribe con tus propias palabras. No necesitas usar términos técnicos.
                </p>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">¿Cuál fue el diagnóstico que te dieron? *</Label>
                  <p className="text-sm text-muted-foreground">Describe lo que te explicó el dentista o especialista externo.</p>
                  <Textarea
                    value={formData.diagnosis}
                    onChange={e => updateField("diagnosis", e.target.value)}
                    placeholder="Ej: Me dijeron que necesito 3 implantes en la parte de arriba, que tengo pérdida ósea y que hay que hacer una elevación de seno..."
                    className="bg-secondary border-border focus:border-gold-muted min-h-[120px] text-base resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{formData.diagnosis.length} caracteres</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <Label className="text-foreground font-medium">¿Cuál es tu duda específica? *</Label>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    Esto es lo más importante. ¿Qué quieres que verifiquemos o que te expliquemos?
                  </p>
                  <Textarea
                    value={formData.doubt}
                    onChange={e => updateField("doubt", e.target.value)}
                    placeholder="Ej: ¿Realmente necesito todos esos implantes o hay alternativas? ¿El precio de $4.000.000 es razonable? ¿La técnica de elevación de seno es la única opción?..."
                    className="bg-secondary border-border focus:border-gold-muted min-h-[130px] text-base resize-none"
                  />
                  <p className="text-xs text-muted-foreground text-right">{formData.doubt.length} caracteres</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─ STEP 4: Radiografía (OBLIGATORIA) ────────────────────────────── */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div>
                <p className="caption text-muted-foreground mb-3">Paso 4 · Radiografía</p>
                <h2 className="display-medium text-foreground">Adjunta tu radiografía</h2>
              </div>

              {/* Required notice */}
              <div className="flex items-start gap-3 p-5 bg-gold-muted/10 border border-gold-muted/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Radiografía obligatoria</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sin radiografía no es posible realizar un análisis clínico válido. Acepta panorámica, periapical o bitewing.
                    Formatos: JPG, PNG, WEBP o PDF.
                  </p>
                </div>
              </div>

              {!formData.rxFile ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed border-border hover:border-gold-muted/60 transition-colors cursor-pointer group rounded-xl">
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors text-center font-medium">
                      Subir radiografía<br /><span className="font-normal text-xs">JPG, PNG, PDF</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={e => updateField("rxFile", e.target.files?.[0] || null)}
                    />
                  </label>
                  <label className="flex-1 flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed border-border hover:border-gold-muted/60 transition-colors cursor-pointer group rounded-xl">
                    <Camera className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors text-center font-medium">
                      Fotografiar con cámara<br /><span className="font-normal text-xs">Para pantallas físicas</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={e => updateField("rxFile", e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              ) : (
                <div className="p-5 bg-secondary rounded-xl border border-border space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{formData.rxFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(formData.rxFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => updateField("rxFile", null)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.rxFile.type.startsWith("image/") && (
                    <img
                      src={URL.createObjectURL(formData.rxFile)}
                      alt="Preview radiografía"
                      className="w-full max-h-48 object-contain rounded-lg bg-black/5"
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ─ STEP 5: Elegir servicio ───────────────────────────────────────── */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div>
                <p className="caption text-muted-foreground mb-3">Paso 5 · ¿Qué necesitas?</p>
                <h2 className="display-medium text-foreground">Elige tu tipo de análisis</h2>
                <p className="mt-4 body-large text-muted-foreground">
                  Selecciona el servicio que mejor responde a tu necesidad.
                </p>
              </div>

              <div className="space-y-5">
                {/* Option A: IA gratis */}
                <button
                  onClick={() => updateField("flow_type", "ia_only")}
                  className={`w-full p-7 rounded-2xl border-2 transition-all duration-200 text-left ${
                    formData.flow_type === "ia_only"
                      ? "border-gold-muted bg-gold-muted/8"
                      : "border-border bg-secondary/40 hover:border-border/70"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${formData.flow_type === "ia_only" ? "bg-gold-muted/20" : "bg-secondary"}`}>
                      <Sparkles className={`w-6 h-6 ${formData.flow_type === "ia_only" ? "text-gold" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">Análisis IA inmediato</h3>
                        <span className="text-xs bg-green-500/15 text-green-600 px-2 py-0.5 rounded-full font-medium">Gratuito</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Nuestro sistema analiza tu radiografía y diagnóstico con IA clínica (Scandente) y te entrega un informe detallado en minutos.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Resultado en ~2 minutos</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Option B: IA + Videollamada */}
                <button
                  onClick={() => updateField("flow_type", "ia_plus_specialist")}
                  className={`w-full p-7 rounded-2xl border-2 transition-all duration-200 text-left ${
                    formData.flow_type === "ia_plus_specialist"
                      ? "border-gold-muted bg-gold-muted/8"
                      : "border-border bg-secondary/40 hover:border-border/70"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${formData.flow_type === "ia_plus_specialist" ? "bg-gold-muted/20" : "bg-secondary"}`}>
                      <Video className={`w-6 h-6 ${formData.flow_type === "ia_plus_specialist" ? "text-gold" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">IA + Videollamada con especialista</h3>
                        <span className="text-xs bg-gold-muted/20 text-gold px-2 py-0.5 rounded-full font-medium">$19.000</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Además del informe IA, agendas una videollamada de 30 min con un especialista Clínica Miró que revisará tu caso en profundidad.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Opinión clínica certificada</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Option C: Comparar presupuesto */}
                <button
                  onClick={() => updateField("flow_type", "budget_comparison")}
                  className={`w-full p-7 rounded-2xl border-2 transition-all duration-200 text-left ${
                    formData.flow_type === "budget_comparison"
                      ? "border-gold-muted bg-gold-muted/8"
                      : "border-border bg-secondary/40 hover:border-border/70"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${formData.flow_type === "budget_comparison" ? "bg-gold-muted/20" : "bg-secondary"}`}>
                      <Receipt className={`w-6 h-6 ${formData.flow_type === "budget_comparison" ? "text-gold" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">Comparar mi presupuesto</h3>
                        <span className="text-xs bg-green-500/15 text-green-600 px-2 py-0.5 rounded-full font-medium">Gratuito</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Adjunta el presupuesto que te entregaron. Aplicamos OCR, comparamos ítem por ítem con los aranceles de Clínica Miró y te damos una alternativa de precio.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Comparación con aranceles Continental Link</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* ─ STEP 6: Adjuntar presupuesto (solo budget_comparison) ──────────── */}
          {step === 6 && formData.flow_type === "budget_comparison" && (
            <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div>
                <p className="caption text-muted-foreground mb-3">Paso 6 · Tu presupuesto externo</p>
                <h2 className="display-medium text-foreground">Adjunta el presupuesto</h2>
              </div>

              <div className="flex items-start gap-3 p-5 bg-secondary rounded-xl border border-border">
                <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>No necesitas indicar el nombre del dentista ni de la clínica.</p>
                  <p>Solo adjunta el documento. Podemos leer <strong className="text-foreground">PDF, foto o imagen</strong> del presupuesto.</p>
                  <p>Comparamos cada ítem con nuestros aranceles y te damos el precio equivalente en Clínica Miró.</p>
                </div>
              </div>

              {!formData.budgetFile ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed border-border hover:border-gold-muted/60 transition-colors cursor-pointer group rounded-xl">
                    <Upload className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors text-center font-medium">
                      Subir presupuesto<br /><span className="font-normal text-xs">PDF, JPG, PNG</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={e => updateField("budgetFile", e.target.files?.[0] || null)}
                    />
                  </label>
                  <label className="flex-1 flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed border-border hover:border-gold-muted/60 transition-colors cursor-pointer group rounded-xl">
                    <Camera className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1.5} />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors text-center font-medium">
                      Fotografiar documento<br /><span className="font-normal text-xs">Con tu cámara</span>
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={e => updateField("budgetFile", e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              ) : (
                <div className="p-5 bg-secondary rounded-xl border border-border flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{formData.budgetFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(formData.budgetFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => updateField("budgetFile", null)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ─ STEP 7 / 8: Processing ────────────────────────────────────────── */}
          {(step === 7 || step === 8) && isLoading && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12 text-center py-16">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-gold-muted/20 animate-pulse" />
                  <Loader2 className="w-8 h-8 text-gold animate-spin absolute inset-0 m-auto" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="display-medium text-foreground">Analizando tu caso</h2>
                <p className="body-large text-muted-foreground max-w-md mx-auto">
                  {formData.flow_type === "budget_comparison"
                    ? "Aplicando OCR al presupuesto y comparando con aranceles de Clínica Miró..."
                    : "Nuestro sistema IA está analizando tu radiografía y diagnóstico..."}
                </p>
                <p className="caption text-muted-foreground">Esto puede tomar hasta 2 minutos</p>
              </div>
            </motion.div>
          )}

          {/* ─ STEP 8: Resultados IA ─────────────────────────────────────────── */}
          {step === 8 && !isLoading && iaReport && (
            <motion.div key="results-ia" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div>
                <p className="caption text-muted-foreground mb-3">Informe IA · Segunda Opinión</p>
                <h2 className="display-medium text-foreground">Tu análisis está listo</h2>
              </div>

              {/* Urgency badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
                iaReport.urgency === "high"
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : iaReport.urgency === "moderate"
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600"
                  : "bg-green-500/10 border-green-500/30 text-green-600"
              }`}>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{urgencyLabel(iaReport.urgency)}</span>
              </div>

              {/* Assessment */}
              <div className="p-6 bg-secondary rounded-xl border border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">Evaluación general</p>
                <p className="text-base text-foreground leading-relaxed">{iaReport.assessment}</p>
              </div>

              {/* Key findings */}
              {iaReport.key_findings?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Hallazgos clave</p>
                  <ul className="space-y-2">
                    {iaReport.key_findings.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {iaReport.recommendations?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Recomendaciones</p>
                  <ul className="space-y-2">
                    {iaReport.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Estimated savings */}
              {iaReport.estimated_savings && (
                <div className="p-5 bg-gold-muted/8 border border-gold-muted/25 rounded-xl">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Ahorro estimado</p>
                  <p className="text-2xl font-semibold text-gold">
                    ${iaReport.estimated_savings.toLocaleString("es-CL")} CLP
                  </p>
                  {iaReport.comparison_notes && (
                    <p className="text-sm text-muted-foreground mt-2">{iaReport.comparison_notes}</p>
                  )}
                </div>
              )}

              {/* CTA specialist */}
              {formData.flow_type === "ia_only" && iaReport.cta_evaluation_premium && (
                <div className="p-6 bg-secondary rounded-xl border border-border space-y-4">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-gold" />
                    <p className="text-base font-semibold text-foreground">¿Quieres confirmar con un especialista?</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Agenda una videollamada de 30 min con uno de nuestros especialistas para revisar tu caso en profundidad.
                  </p>
                  <Button
                    onClick={handleSpecialistCheckout}
                    disabled={isLoading}
                    className="bg-gold hover:bg-gold/90 text-background font-medium h-12 px-8"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Agendar videollamada · $19.000
                  </Button>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground/70 leading-relaxed border-t border-border pt-6">
                {iaReport.disclaimer}
              </p>
            </motion.div>
          )}

          {/* ─ STEP 10: IA + Specialist results ─────────────────────────────── */}
          {step === 10 && !isLoading && iaReport && (
            <motion.div key="results-specialist" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div>
                <p className="caption text-muted-foreground mb-3">Informe IA · Segunda Opinión Premium</p>
                <h2 className="display-medium text-foreground">Tu informe y próximo paso</h2>
              </div>

              {/* Same IA results */}
              <div className="p-6 bg-secondary rounded-xl border border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">Evaluación IA</p>
                <p className="text-base text-foreground leading-relaxed">{iaReport.assessment}</p>
              </div>

              {iaReport.key_findings?.length > 0 && (
                <ul className="space-y-2">
                  {iaReport.key_findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {/* Checkout CTA */}
              <div className="p-6 bg-gold-muted/8 border border-gold-muted/30 rounded-xl space-y-4">
                <div className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-gold" />
                  <div>
                    <p className="text-base font-semibold text-foreground">Videollamada con especialista</p>
                    <p className="text-sm text-muted-foreground">30 minutos · Revisión completa de tu caso</p>
                  </div>
                </div>
                <Button
                  onClick={handleSpecialistCheckout}
                  disabled={isLoading}
                  className="w-full bg-gold hover:bg-gold/90 text-background font-medium h-14 text-base"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Proceder al pago · $19.000 CLP
                </Button>
              </div>

              <p className="text-xs text-muted-foreground/70 leading-relaxed border-t border-border pt-6">
                {iaReport.disclaimer}
              </p>
            </motion.div>
          )}

          {/* ─ STEP 9: Budget comparison results ────────────────────────────── */}
          {step === 9 && !isLoading && budgetReport && (
            <motion.div key="results-budget" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div>
                <p className="caption text-muted-foreground mb-3">Comparación de presupuesto</p>
                <h2 className="display-medium text-foreground">Así quedó tu comparación</h2>
              </div>

              {/* Summary totals */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 bg-secondary rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Total presupuesto externo</p>
                  <p className="text-2xl font-semibold text-foreground">
                    ${budgetReport.external_total.toLocaleString("es-CL")}
                    <span className="text-sm font-normal text-muted-foreground ml-1">CLP</span>
                  </p>
                </div>
                <div className="p-5 bg-gold-muted/8 rounded-xl border border-gold-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Alternativa Clínica Miró</p>
                  <p className="text-2xl font-semibold text-gold">
                    ${budgetReport.miro_total.toLocaleString("es-CL")}
                    <span className="text-sm font-normal text-muted-foreground ml-1">CLP</span>
                  </p>
                </div>
              </div>

              {budgetReport.savings > 0 && (
                <div className="p-5 bg-green-500/8 border border-green-500/20 rounded-xl flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Ahorro estimado: <strong className="text-green-600">${budgetReport.savings.toLocaleString("es-CL")} CLP</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{budgetReport.savings_percent}% menos que el presupuesto externo</p>
                  </div>
                </div>
              )}

              {/* Line items */}
              {budgetReport.items?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Desglose por ítem</p>
                  <div className="space-y-2">
                    {budgetReport.items.map((item, i) => (
                      <div key={i} className="p-4 bg-secondary rounded-xl border border-border">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm font-medium text-foreground flex-1">{item.treatment}</p>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-muted-foreground line-through">${item.external_price.toLocaleString("es-CL")}</p>
                            <p className="text-sm font-semibold text-gold">${item.miro_price.toLocaleString("es-CL")}</p>
                          </div>
                        </div>
                        {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {budgetReport.notes && (
                <div className="p-5 bg-secondary rounded-xl border border-border">
                  <p className="text-sm font-medium text-foreground mb-2">Notas del análisis</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{budgetReport.notes}</p>
                </div>
              )}

              {/* CTA */}
              <div className="p-6 bg-secondary rounded-xl border border-border space-y-3">
                <p className="text-sm font-semibold text-foreground">¿Quieres una evaluación presencial?</p>
                <p className="text-sm text-muted-foreground">
                  En la Evaluación Premium te mostramos el plan de tratamiento definitivo con IA en vivo, sobre tus propias imágenes.
                </p>
                <Button
                  onClick={() => window.location.href = "/evaluacion"}
                  className="bg-gold hover:bg-gold/90 text-background font-medium h-12 px-8"
                >
                  Ir a Evaluación Premium
                </Button>
              </div>

              <p className="text-xs text-muted-foreground/70 leading-relaxed border-t border-border pt-6">
                {budgetReport.disclaimer}
              </p>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ─── Navigation buttons ─────────────────────────────────────────────── */}
        {step <= 6 && !isLoading && (
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
              className="gap-2 text-muted-foreground hover:text-foreground disabled:opacity-0"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>

            <Button
              onClick={nextStep}
              className="gap-2 bg-foreground text-background hover:bg-foreground/90 h-12 px-8 font-medium"
            >
              {step === 5 && formData.flow_type !== "budget_comparison"
                ? "Analizar ahora"
                : step === 6
                ? "Comparar presupuesto"
                : "Continuar"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecondOpinionWizard;
