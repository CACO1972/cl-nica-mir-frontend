import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Loader2, FileText, Video, CheckCircle, AlertTriangle, Shield } from "lucide-react";
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
}

const SecondOpinionWizard = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [secondOpinionId, setSecondOpinionId] = useState<string | null>(null);
  const [iaReport, setIaReport] = useState<IAReport | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    reason: "",
    current_diagnosis: "",
    external_budget_amount: "",
    external_clinic_name: "",
    flow_type: "ia_only",
  });

  const updateField = useCallback((field: keyof FormData, value: string | FlowType) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateStep1 = () => {
    return formData.name.trim() && formData.email.includes("@") && formData.phone.trim();
  };

  const validateStep2 = () => {
    return formData.reason.trim().length >= 10;
  };

  const handleCreateSecondOpinion = async () => {
    setIsLoading(true);
    try {
      const response = await createSecondOpinion({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        reason: formData.reason,
        current_diagnosis: formData.current_diagnosis || undefined,
        external_budget_amount: formData.external_budget_amount ? parseFloat(formData.external_budget_amount) : undefined,
        external_clinic_name: formData.external_clinic_name || undefined,
        flow_type: formData.flow_type,
      });

      if (response.success && response.data) {
        setSecondOpinionId(response.data.id);
        setStep(4); // Go to IA analysis
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
        setStep(5); // Show results
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
        // Redirect to payment
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
      toast({
        title: t("wizard.errors.required"),
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !validateStep2()) {
      toast({
        title: t("wizard.errors.required"),
        variant: "destructive",
      });
      return;
    }
    if (step === 3) {
      handleCreateSecondOpinion();
      return;
    }
    setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step > 1 && step < 4) setStep(s => s - 1);
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
                    placeholder={t("opinion.step2.reasonPlaceholder")}
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
                    placeholder={t("opinion.step2.diagnosisPlaceholder")}
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
                      placeholder="$"
                      className="bg-secondary border-border focus:border-gold-muted h-14 text-lg"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Choose Flow Type */}
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
                  {t("opinion.step3.caption")}
                </p>
                <h2 className="display-medium text-foreground">
                  {t("opinion.step3.headline")}
                </h2>
              </div>

              <div className="space-y-6">
                {/* IA Only Option */}
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

                {/* IA + Specialist Option */}
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

          {/* Step 4: Processing */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12 text-center py-20"
            >
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-gold-muted animate-spin" />
              </div>
              <div>
                <h2 className="display-medium text-foreground mb-4">
                  {t("opinion.step4.headline")}
                </h2>
                <p className="body-large text-muted-foreground">
                  {t("opinion.step4.message")}
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 5: IA Report Results */}
          {step === 5 && iaReport && (
            <motion.div
              key="step5"
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
        {step <= 3 && (
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
                  {t("wizard.nav.continue")}
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
