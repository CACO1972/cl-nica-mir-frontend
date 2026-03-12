import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Loader2, FileText, Video, CheckCircle, AlertTriangle, Shield, Upload, Camera, Clock } from "lucide-react";
import { createSecondOpinion, requestIAReport, createSpecialistCheckout, type IAReport } from "@/services/secondOpinionApi";
import { useToast } from "@/hooks/use-toast";

type FlowType = 'ia_only' | 'ia_plus_specialist';

interface FormData {
  name: string;
  email: string;
  phone: string;
  reason: string;
  current_diagnosis: string;
  external_budget_amount: string;
  external_clinic_name: string;
  flow_type: FlowType;
  imageFile: File | null;
}

const ANALYSIS_ESTIMATED_SECONDS = 45;

const SecondOpinionWizard = () => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [secondOpinionId, setSecondOpinionId] = useState<string | null>(null);
  const [iaReport, setIaReport] = useState<IAReport | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(ANALYSIS_ESTIMATED_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    reason: "",
    current_diagnosis: "",
    external_budget_amount: "",
    external_clinic_name: "",
    flow_type: "ia_only",
    imageFile: null,
  });

  const updateField = useCallback((field: keyof FormData, value: string | FlowType | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "imageFile" && value instanceof File) {
      const url = URL.createObjectURL(value);
      setImagePreviewUrl(url);
    } else if (field === "imageFile" && value === null) {
      setImagePreviewUrl(null);
    }
  }, []);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  // Countdown timer for step 5
  useEffect(() => {
    if (step === 5) {
      setCountdown(ANALYSIS_ESTIMATED_SECONDS);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [step]);

  const validateStep1 = () => {
    return formData.name.trim() && formData.email.includes("@") && formData.phone.trim();
  };

  const validateStep2 = () => {
    return formData.reason.trim().length >= 10;
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCreateSecondOpinion = async () => {
    setIsLoading(true);
    try {
      let imageData: string | undefined;
      if (formData.imageFile) {
        imageData = await fileToBase64(formData.imageFile);
      }

      const response = await createSecondOpinion({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        reason: formData.reason,
        current_diagnosis: formData.current_diagnosis || undefined,
        external_budget_amount: formData.external_budget_amount ? parseFloat(formData.external_budget_amount) : undefined,
        external_clinic_name: formData.external_clinic_name || undefined,
        flow_type: formData.flow_type,
        image_data: imageData,
        image_name: formData.imageFile?.name,
        image_mime: formData.imageFile?.type,
      });

      if (response.success && response.data) {
        setSecondOpinionId(response.data.id);
        setStep(5);
        await handleRequestIAReport(response.data.id);
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo crear la solicitud",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestIAReport = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await requestIAReport(id);
      if (response.success && response.data) {
        setIaReport(response.data.ia_report);
        setStep(6);
      } else {
        toast({
          title: "Error",
          description: response.error || "No se pudo generar el informe",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar el análisis",
        variant: "destructive",
      });
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
        toast({
          title: "Error",
          description: response.error || "No se pudo crear el pago",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar el pago",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) {
      toast({ title: t("wizard.errors.required"), variant: "destructive" });
      return;
    }
    if (step === 2 && !validateStep2()) {
      toast({ title: t("wizard.errors.required"), variant: "destructive" });
      return;
    }
    if (step === 4) {
      handleCreateSecondOpinion();
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step > 1 && step < 5) setStep(s => s - 1);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-destructive';
      case 'moderate': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return t("wizard.step5.riskHigh");
      case 'moderate': return t("wizard.step5.riskModerate");
      default: return t("wizard.step5.riskLow");
    }
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col justify-center px-6 lg:px-12 py-16">
      <div className="max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* Step 1: Personal Data */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div>
                <p className="caption text-muted-foreground mb-4">
                  {t("opinion.step1.caption")}
                </p>
                <h2 className="display-medium text-foreground">
                  {t("opinion.step1.headline")}
                </h2>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="body-small text-foreground">
                    {t("wizard.step1.name")} *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder={language === "es" ? "Ej: María González" : "E.g.: María González"}
                    className="bg-secondary border-border focus:border-gold-muted h-14 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="body-small text-foreground">
                    {t("wizard.step1.email")} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder={language === "es" ? "Ej: maria@correo.cl" : "E.g.: maria@email.com"}
                    className="bg-secondary border-border focus:border-gold-muted h-14 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="body-small text-foreground">
                    {t("wizard.step1.phone")} *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder={language === "es" ? "Ej: +56 9 1234 5678" : "E.g.: +56 9 1234 5678"}
                    className="bg-secondary border-border focus:border-gold-muted h-14 text-lg"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Reason & Diagnosis */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div>
                <p className="caption text-muted-foreground mb-4">
                  {t("opinion.step2.caption")}
                </p>
                <h2 className="display-medium text-foreground">
                  {t("opinion.step2.headline")}
                </h2>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <Label htmlFor="reason" className="body-small text-foreground">
                    {t("opinion.step2.reason")} *
                  </Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => updateField("reason", e.target.value)}
                    placeholder={language === "es" 
                      ? "Ej: Me dijeron que necesito 3 coronas pero quiero confirmar si realmente es necesario" 
                      : "E.g.: I was told I need 3 crowns but want to confirm if it's really necessary"}
                    className="bg-secondary border-border focus:border-gold-muted min-h-[120px] text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="current_diagnosis" className="body-small text-foreground">
                    {t("opinion.step2.diagnosis")}
                  </Label>
                  <Textarea
                    id="current_diagnosis"
                    value={formData.current_diagnosis}
                    onChange={(e) => updateField("current_diagnosis", e.target.value)}
                    placeholder={language === "es" 
                      ? "Ej: Caries profunda en molares superiores, posible tratamiento de conducto" 
                      : "E.g.: Deep cavities in upper molars, possible root canal treatment"}
                    className="bg-secondary border-border focus:border-gold-muted min-h-[100px] text-lg"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="external_clinic_name" className="body-small text-foreground">
                      {t("opinion.step2.clinicName")}
                    </Label>
                    <Input
                      id="external_clinic_name"
                      value={formData.external_clinic_name}
                      onChange={(e) => updateField("external_clinic_name", e.target.value)}
                      placeholder={language === "es" ? "Ej: Clínica Dental Sur" : "E.g.: South Dental Clinic"}
                      className="bg-secondary border-border focus:border-gold-muted h-14 text-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="external_budget_amount" className="body-small text-foreground">
                      {t("opinion.step2.budgetAmount")}
                    </Label>
                    <Input
                      id="external_budget_amount"
                      type="number"
                      value={formData.external_budget_amount}
                      onChange={(e) => updateField("external_budget_amount", e.target.value)}
                      placeholder={language === "es" ? "Ej: 850000" : "E.g.: 850000"}
                      className="bg-secondary border-border focus:border-gold-muted h-14 text-lg"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Image Upload */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div>
                <p className="caption text-muted-foreground mb-4">
                  Paso 3 de 4
                </p>
                <h2 className="display-medium text-foreground">
                  Imagen de la zona afectada
                </h2>
              </div>

              <p className="body-large text-muted-foreground">
                Si tienes una radiografía o foto de la zona que te preocupa, súbela aquí para un análisis más preciso. Es opcional pero mejora significativamente el informe.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <label className="flex-1 flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed border-border hover:border-gold-muted/50 transition-colors cursor-pointer group rounded-xl">
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1} />
                  <span className="body-small text-muted-foreground group-hover:text-foreground transition-colors text-center">
                    Subir imagen o radiografía
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => updateField("imageFile", e.target.files?.[0] || null)}
                  />
                </label>
                <label className="flex-1 flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed border-border hover:border-gold-muted/50 transition-colors cursor-pointer group rounded-xl">
                  <Camera className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1} />
                  <span className="body-small text-muted-foreground group-hover:text-foreground transition-colors text-center">
                    Tomar foto
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => updateField("imageFile", e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {formData.imageFile && (
                <div className="flex items-center gap-3 p-4 bg-gold-muted/10 rounded-lg border border-gold-muted/30">
                  <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                  <span className="body-small text-foreground">{formData.imageFile.name}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Choose Flow Type */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div>
                <p className="caption text-muted-foreground mb-4">
                  {t("opinion.step3.caption")}
                </p>
                <h2 className="display-medium text-foreground">
                  {t("opinion.step3.headline")}
                </h2>
              </div>

              <div className="space-y-6">
                <button
                  onClick={() => updateField("flow_type", "ia_only")}
                  className={`w-full p-8 rounded-xl border-2 transition-all duration-300 text-left ${
                    formData.flow_type === "ia_only"
                      ? "border-gold-muted bg-gold-muted/5"
                      : "border-border hover:border-gold-muted/50 bg-secondary/50"
                  }`}
                >
                  <div className="flex items-start gap-6">
                    <div className={`p-3 rounded-lg ${
                      formData.flow_type === "ia_only" ? "bg-gold-muted/20" : "bg-secondary"
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        formData.flow_type === "ia_only" ? "text-gold" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {t("opinion.step3.iaOnly.title")}
                      </h3>
                      <p className="body-large text-muted-foreground mb-4">
                        {t("opinion.step3.iaOnly.desc")}
                      </p>
                      <p className="text-gold font-medium">
                        {t("opinion.step3.iaOnly.price")}
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => updateField("flow_type", "ia_plus_specialist")}
                  className={`w-full p-8 rounded-xl border-2 transition-all duration-300 text-left ${
                    formData.flow_type === "ia_plus_specialist"
                      ? "border-gold-muted bg-gold-muted/5"
                      : "border-border hover:border-gold-muted/50 bg-secondary/50"
                  }`}
                >
                  <div className="flex items-start gap-6">
                    <div className={`p-3 rounded-lg ${
                      formData.flow_type === "ia_plus_specialist" ? "bg-gold-muted/20" : "bg-secondary"
                    }`}>
                      <Video className={`w-6 h-6 ${
                        formData.flow_type === "ia_plus_specialist" ? "text-gold" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {t("opinion.step3.specialist.title")}
                      </h3>
                      <p className="body-large text-muted-foreground mb-4">
                        {t("opinion.step3.specialist.desc")}
                      </p>
                      <p className="text-gold font-medium">
                        {t("opinion.step3.specialist.price")}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Processing with Scanner Effect */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 py-12"
            >
              {/* Image with scanner effect */}
              {imagePreviewUrl ? (
                <div className="relative w-full max-w-md mx-auto rounded-xl overflow-hidden border border-border">
                  <img
                    src={imagePreviewUrl}
                    alt="Imagen subida"
                    className="w-full h-auto object-cover"
                  />
                  {/* Scanner overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Scan line */}
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_20px_hsl(var(--gold))]"
                      initial={{ top: "0%" }}
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(200,170,110,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(200,170,110,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                    {/* Corner markers */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-gold/60" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-gold/60" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-gold/60" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-gold/60" />
                    {/* Pulsing overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gold/5"
                      animate={{ opacity: [0, 0.15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  {/* Status label */}
                  <motion.div
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gold-muted/30"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="caption text-gold font-medium tracking-wider">
                      ANALIZANDO
                    </span>
                  </motion.div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Loader2 className="w-16 h-16 text-gold-muted animate-spin" />
                </div>
              )}

              {/* Countdown timer */}
              <div className="text-center space-y-4">
                <h2 className="display-medium text-foreground">
                  {t("opinion.step4.headline")}
                </h2>
                <p className="body-large text-muted-foreground">
                  {formData.imageFile 
                    ? (language === "es" 
                      ? "Analizando tu imagen y datos clínicos con IA..." 
                      : "Analyzing your image and clinical data with AI...")
                    : t("opinion.step4.message")
                  }
                </p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  <Clock className="w-5 h-5 text-gold-muted" />
                  <span className="text-2xl font-mono text-gold tracking-wider">
                    {formatCountdown(countdown)}
                  </span>
                </div>
                <p className="caption text-muted-foreground/50">
                  {language === "es" ? "Tiempo estimado restante" : "Estimated time remaining"}
                </p>
              </div>

              {/* Processing steps */}
              <div className="max-w-xs mx-auto space-y-3 mt-8">
                {[
                  language === "es" ? "Validando datos clínicos" : "Validating clinical data",
                  language === "es" ? "Procesando imagen" : "Processing image",
                  language === "es" ? "Generando informe IA" : "Generating AI report",
                ].map((label, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: countdown < ANALYSIS_ESTIMATED_SECONDS - (i * 10) ? 1 : 0.3 }}
                    transition={{ duration: 0.5 }}
                  >
                    {countdown < ANALYSIS_ESTIMATED_SECONDS - ((i + 1) * 10) ? (
                      <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                    ) : countdown < ANALYSIS_ESTIMATED_SECONDS - (i * 10) ? (
                      <Loader2 className="w-4 h-4 text-gold-muted animate-spin flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
                    )}
                    <span className="caption text-muted-foreground">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 6: IA Report Results */}
          {step === 6 && iaReport && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div>
                <p className="caption text-muted-foreground mb-4">
                  {t("opinion.step5.caption")}
                </p>
                <h2 className="display-medium text-foreground">
                  {t("opinion.step5.headline")}
                </h2>
              </div>

              {/* Urgency Badge */}
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${getUrgencyColor(iaReport.urgency)}`} />
                <span className={`font-medium ${getUrgencyColor(iaReport.urgency)}`}>
                  {t("wizard.step5.riskLevel")}: {getUrgencyLabel(iaReport.urgency)}
                </span>
              </div>

              {/* Assessment */}
              <div className="p-6 bg-secondary/50 rounded-xl">
                <p className="body-large text-foreground">{iaReport.assessment}</p>
              </div>

              {/* Key Findings */}
              <div className="space-y-4">
                <h3 className="body-small text-foreground font-medium">
                  {t("opinion.step5.findings")}
                </h3>
                <ul className="space-y-3">
                  {iaReport.key_findings.map((finding, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-gold-muted mt-0.5 flex-shrink-0" />
                      <span className="body-large text-muted-foreground">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h3 className="body-small text-foreground font-medium">
                  {t("opinion.step5.recommendations")}
                </h3>
                <ul className="space-y-3">
                  {iaReport.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-gold-muted mt-0.5 flex-shrink-0" />
                      <span className="body-large text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Estimated Savings */}
              {iaReport.estimated_savings && (
                <div className="p-6 bg-gold-muted/10 rounded-xl">
                  <p className="body-large text-foreground">
                    <span className="font-medium">{t("opinion.step5.savings")}:</span>{" "}
                    ${iaReport.estimated_savings.toLocaleString('es-CL')} CLP
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              <p className="caption text-muted-foreground/60 italic">
                {iaReport.disclaimer}
              </p>

              {/* CTAs */}
              <div className="space-y-4 pt-8">
                {formData.flow_type === "ia_plus_specialist" && (
                  <Button
                    onClick={handleSpecialistCheckout}
                    disabled={isLoading}
                    className="w-full h-14 bg-gold hover:bg-gold/90 text-background font-medium text-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {t("wizard.nav.processing")}
                      </>
                    ) : (
                      t("opinion.step5.ctaSpecialist")
                    )}
                  </Button>
                )}

                {iaReport.cta_evaluation_premium && (
                  <a
                    href="/evaluation"
                    className="block w-full h-14 flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground font-medium text-lg rounded-md transition-colors"
                  >
                    {t("opinion.step5.ctaPremium")}
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {step <= 4 && (
          <div className="flex justify-between items-center mt-16 pt-8 border-t border-border">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`flex items-center gap-2 caption transition-colors ${
                step === 1 
                  ? "text-muted-foreground/30 cursor-not-allowed" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              {t("wizard.nav.back")}
            </button>

            <Button
              onClick={nextStep}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-background h-12 px-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("wizard.nav.processing")}
                </>
              ) : (
                <>
                  {step === 3 ? "Omitir o continuar" : t("wizard.nav.continue")}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecondOpinionWizard;
