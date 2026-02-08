import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ChevronLeft, Upload, Camera, Check, AlertCircle, Loader2 } from "lucide-react";
import { createLead, uploadFile, triggerIAScan, createCheckout, IAScanResponse } from "@/services/funnelApi";
import { toast } from "sonner";
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Medical condition options for checkboxes
const MEDICAL_CONDITIONS = [
  { id: 'diabetes', labelKey: 'wizard.step2.conditions.diabetes' },
  { id: 'hypertension', labelKey: 'wizard.step2.conditions.hypertension' },
  { id: 'heart', labelKey: 'wizard.step2.conditions.heart' },
  { id: 'allergies', labelKey: 'wizard.step2.conditions.allergies' },
  { id: 'respiratory', labelKey: 'wizard.step2.conditions.respiratory' },
  { id: 'bleeding', labelKey: 'wizard.step2.conditions.bleeding' },
  { id: 'none', labelKey: 'wizard.step2.conditions.none' },
] as const;

const HABIT_OPTIONS = [
  { id: 'tobacco', labelKey: 'wizard.step2.habits.tobacco' },
  { id: 'bruxism', labelKey: 'wizard.step2.habits.bruxism' },
  { id: 'alcohol', labelKey: 'wizard.step2.habits.alcohol' },
  { id: 'none', labelKey: 'wizard.step2.habits.none' },
] as const;

interface FormData {
  // Step 1 - Personal Data
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  // Step 2 - Medical History
  conditions: string[];
  medications: string;
  habits: string[];
  // Step 3 - Key Question
  lastVisitYear: string;
  lastTreatment: string;
  // Step 4 - Image
  imageFile: File | null;
}

const PreEvaluationWizard = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [iaResult, setIaResult] = useState<IAScanResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    conditions: [],
    medications: "",
    habits: [],
    lastVisitYear: "",
    lastTreatment: "",
    imageFile: null,
  });

  const updateFormData = (field: keyof FormData, value: string | string[] | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const toggleArrayField = (field: 'conditions' | 'habits', id: string) => {
    setFormData((prev) => {
      const currentValues = prev[field];
      const isNoneOption = id === 'none';
      
      if (isNoneOption) {
        // If selecting "none", clear all others
        return { ...prev, [field]: currentValues.includes('none') ? [] : ['none'] };
      }
      
      // If selecting something else, remove "none" if present
      const withoutNone = currentValues.filter((v) => v !== 'none');
      
      if (currentValues.includes(id)) {
        return { ...prev, [field]: withoutNone.filter((v) => v !== id) };
      }
      return { ...prev, [field]: [...withoutNone, id] };
    });
    setError(null);
  };

  // Validate step 1 (required fields)
  const validateStep1 = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError(t("wizard.errors.required"));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t("wizard.errors.invalidEmail"));
      return false;
    }
    return true;
  };

  // Create lead after step 3 (before image upload)
  const handleCreateLead = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await createLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        reason: `${formData.conditions} | ${formData.lastTreatment}`,
        origin: 'pre-evaluation-wizard',
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al crear el lead');
      }

      setLeadId(response.data.id);
      console.log('[Wizard] Lead created:', response.data.id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload image after step 4
  const handleUploadImage = async () => {
    if (!leadId || !formData.imageFile) {
      // Skip if no image - allow to continue
      return true;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await uploadFile({
        lead_id: leadId,
        file_type: 'selfie',
        file: formData.imageFile,
      });

      if (!response.success) {
        throw new Error(response.error || 'Error al subir la imagen');
      }

      console.log('[Wizard] Image uploaded:', response.data?.upload_id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger IA scan on step 5
  const handleIAScan = async () => {
    if (!leadId) return false;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await triggerIAScan(leadId);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error en el análisis IA');
      }

      setIaResult(response.data);
      console.log('[Wizard] IA scan complete:', response.data.ia_result.overall_risk);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Create checkout and redirect to payment
  const handlePayment = async () => {
    if (!leadId) {
      setError('No se encontró el lead');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await createCheckout(leadId);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Error al crear el checkout');
      }

      console.log('[Wizard] Checkout created, redirecting...');
      
      // Redirect to MercadoPago
      window.location.href = response.data.init_point;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(message);
      setIsProcessing(false);
    }
  };

  const nextStep = async () => {
    // Validation and API calls per step
    if (currentStep === 1 && !validateStep1()) {
      return;
    }

    // Create lead after completing personal info + medical history + key question
    if (currentStep === 3) {
      const success = await handleCreateLead();
      if (!success) return;
    }

    // Upload image after step 4 and trigger IA scan
    if (currentStep === 4) {
      if (formData.imageFile) {
        const uploadSuccess = await handleUploadImage();
        if (!uploadSuccess) return;
        
        // Auto-trigger IA scan only if image was uploaded
        setCurrentStep(5);
        const iaScanSuccess = await handleIAScan();
        if (iaScanSuccess) {
          // Auto-advance to results after scan
          setTimeout(() => setCurrentStep(6), 1500);
        }
        return;
      } else {
        // No image - skip IA scan and go directly to evaluation info
        setCurrentStep(6);
        return;
      }
    }

    if (currentStep < 8) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
      setError(null);
    }
  };

  const renderStepIndicator = () => (
    <div className="relative mb-16">
      {/* Minimal back arrow - upper left, editorial style */}
      {currentStep > 1 && (
        <button
          onClick={prevStep}
          className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors duration-300"
          aria-label={t("wizard.nav.back")}
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={1} />
        </button>
      )}
      
      {/* Step dots - centered */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
          <div
            key={step}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              step === currentStep
                ? "bg-gold w-6"
                : step < currentStep
                ? "bg-gold-muted"
                : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="space-y-4">
        <p className="caption text-muted-foreground">{t("wizard.step1.caption")}</p>
        <h2 className="display-medium text-foreground">{t("wizard.step1.headline")}</h2>
      </div>
      <div className="space-y-8 max-w-md">
        <div className="space-y-3">
          <label className="caption text-muted-foreground">{t("wizard.step1.name")}</label>
          <Input
            value={formData.name}
            onChange={(e) => updateFormData("name", e.target.value)}
            className="bg-transparent border-border focus:border-foreground transition-colors"
          />
        </div>
        <div className="space-y-3">
          <label className="caption text-muted-foreground">{t("wizard.step1.email")}</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData("email", e.target.value)}
            className="bg-transparent border-border focus:border-foreground transition-colors"
          />
        </div>
        <div className="space-y-3">
          <label className="caption text-muted-foreground">{t("wizard.step1.phone")}</label>
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData("phone", e.target.value)}
            className="bg-transparent border-border focus:border-foreground transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="caption text-muted-foreground">{t("wizard.step1.country")}</label>
            <Input
              value={formData.country}
              onChange={(e) => updateFormData("country", e.target.value)}
              className="bg-transparent border-border focus:border-foreground transition-colors"
            />
          </div>
          <div className="space-y-3">
            <label className="caption text-muted-foreground">{t("wizard.step1.city")}</label>
            <Input
              value={formData.city}
              onChange={(e) => updateFormData("city", e.target.value)}
              className="bg-transparent border-border focus:border-foreground transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="space-y-4">
        <p className="caption text-muted-foreground">{t("wizard.step2.caption")}</p>
        <h2 className="display-medium text-foreground">{t("wizard.step2.headline")}</h2>
      </div>
      <div className="space-y-10 max-w-lg">
        {/* Medical Conditions - Checkboxes */}
        <div className="space-y-4">
          <label className="caption text-muted-foreground">{t("wizard.step2.conditions")}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MEDICAL_CONDITIONS.map((condition) => (
              <label
                key={condition.id}
                className={`
                  flex items-center gap-3 p-4 border cursor-pointer transition-all duration-300
                  ${formData.conditions.includes(condition.id)
                    ? 'border-gold-muted bg-gold-muted/5'
                    : 'border-border hover:border-foreground/30'
                  }
                `}
              >
                <Checkbox
                  checked={formData.conditions.includes(condition.id)}
                  onCheckedChange={() => toggleArrayField('conditions', condition.id)}
                  className="border-muted-foreground data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                />
                <span className="body-small text-foreground">{t(condition.labelKey)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Medications - Text area */}
        <div className="space-y-3">
          <label className="caption text-muted-foreground">{t("wizard.step2.medications")}</label>
          <Textarea
            value={formData.medications}
            onChange={(e) => updateFormData("medications", e.target.value)}
            placeholder={t("wizard.step2.medications.placeholder")}
            className="bg-transparent border-border focus:border-foreground transition-colors min-h-[80px]"
          />
        </div>

        {/* Habits - Checkboxes */}
        <div className="space-y-4">
          <label className="caption text-muted-foreground">{t("wizard.step2.habits")}</label>
          <div className="grid grid-cols-2 gap-3">
            {HABIT_OPTIONS.map((habit) => (
              <label
                key={habit.id}
                className={`
                  flex items-center gap-3 p-4 border cursor-pointer transition-all duration-300
                  ${formData.habits.includes(habit.id)
                    ? 'border-gold-muted bg-gold-muted/5'
                    : 'border-border hover:border-foreground/30'
                  }
                `}
              >
                <Checkbox
                  checked={formData.habits.includes(habit.id)}
                  onCheckedChange={() => toggleArrayField('habits', habit.id)}
                  className="border-muted-foreground data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                />
                <span className="body-small text-foreground">{t(habit.labelKey)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="space-y-4">
        <p className="caption text-muted-foreground">{t("wizard.step3.caption")}</p>
        <h2 className="display-medium text-foreground">{t("wizard.step3.headline")}</h2>
      </div>
      <p className="body-large text-muted-foreground max-w-lg">
        {t("wizard.step3.intro")}
      </p>
      <div className="space-y-8 max-w-md">
        <div className="space-y-3">
          <label className="caption text-muted-foreground">{t("wizard.step3.year")}</label>
          <Input
            type="number"
            min="1990"
            max={new Date().getFullYear()}
            value={formData.lastVisitYear}
            onChange={(e) => updateFormData("lastVisitYear", e.target.value)}
            placeholder="2023"
            className="bg-transparent border-border focus:border-foreground transition-colors"
          />
        </div>
        <div className="space-y-3">
          <label className="caption text-muted-foreground">{t("wizard.step3.treatment")}</label>
          <Textarea
            value={formData.lastTreatment}
            onChange={(e) => updateFormData("lastTreatment", e.target.value)}
            placeholder={t("wizard.step3.treatment.placeholder")}
            className="bg-transparent border-border focus:border-foreground transition-colors min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="space-y-4">
        <p className="caption text-muted-foreground">{t("wizard.step4.caption")}</p>
        <h2 className="display-medium text-foreground">{t("wizard.step4.headline")}</h2>
      </div>
      <p className="body-large text-muted-foreground max-w-lg">
        {t("wizard.step4.intro")}
      </p>
      <div className="flex flex-col sm:flex-row gap-6 max-w-md">
        <label className="flex-1 flex flex-col items-center justify-center gap-4 p-8 border border-dashed border-border hover:border-foreground/50 transition-colors cursor-pointer group">
          <Upload className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1} />
          <span className="caption text-muted-foreground group-hover:text-foreground transition-colors">
            {t("wizard.step4.upload")}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => updateFormData("imageFile", e.target.files?.[0] || null)}
          />
        </label>
        <button className="flex-1 flex flex-col items-center justify-center gap-4 p-8 border border-dashed border-border hover:border-foreground/50 transition-colors group">
          <Camera className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" strokeWidth={1} />
          <span className="caption text-muted-foreground group-hover:text-foreground transition-colors">
            {t("wizard.step4.camera")}
          </span>
        </button>
      </div>
      {formData.imageFile && (
        <p className="body-small text-foreground">
          {t("wizard.step4.selected")}: {formData.imageFile.name}
        </p>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="space-y-4">
        <p className="caption text-muted-foreground">{t("wizard.step5.caption")}</p>
        <h2 className="display-medium text-foreground">{t("wizard.step5.headline")}</h2>
      </div>
      <div className="max-w-lg space-y-8">
        <div className="p-8 border border-border">
          <div className="flex items-center gap-4 mb-6">
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 text-gold-muted animate-spin" />
                <span className="body-small text-muted-foreground">{t("wizard.step5.analyzing")}</span>
              </>
            ) : iaResult ? (
              <>
                <Check className="w-5 h-5 text-gold" />
                <span className="body-small text-foreground">{t("wizard.step5.complete")}</span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="body-small text-destructive">{error}</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-muted-foreground animate-pulse" />
                <span className="body-small text-muted-foreground">{t("wizard.step5.waiting")}</span>
              </>
            )}
          </div>
          <p className="body-large text-muted-foreground">
            {t("wizard.step5.message")}
          </p>
        </div>
        {iaResult && (
          <div className="space-y-4">
            <p className="body-large text-foreground">
              {t("wizard.step5.result")}
            </p>
            <div className="flex items-center gap-2">
              <span className="caption text-muted-foreground">{t("wizard.step5.riskLevel")}:</span>
              <span className={`caption font-medium ${
                iaResult.ia_result.overall_risk === 'low' ? 'text-green-600' :
                iaResult.ia_result.overall_risk === 'moderate' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {iaResult.ia_result.overall_risk === 'low' ? t("wizard.step5.riskLow") :
                 iaResult.ia_result.overall_risk === 'moderate' ? t("wizard.step5.riskModerate") :
                 t("wizard.step5.riskHigh")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="space-y-4">
        <p className="caption text-muted-foreground">{t("wizard.step6.caption")}</p>
        <h2 className="display-medium text-foreground">{t("wizard.step6.headline")}</h2>
      </div>
      <div className="max-w-lg space-y-8">
        <p className="body-large text-muted-foreground">
          {t("wizard.step6.p1")}
        </p>
        <p className="body-large text-muted-foreground">
          {t("wizard.step6.p2")}
        </p>
        <p className="body-large text-foreground">
          {t("wizard.step6.p3")}
        </p>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-12 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <p className="caption text-muted-foreground">{t("wizard.step7.caption")}</p>
        <h2 className="display-medium text-foreground">{t("wizard.step7.headline")}</h2>
        <p className="body-large text-foreground/80">{t("wizard.step7.subtitle")}</p>
      </div>
      
      <div className="max-w-xl space-y-12">
        {/* Brief intro */}
        <p className="body-large text-muted-foreground leading-relaxed">
          {t("wizard.step7.intro")}
        </p>
        
        {/* What's included - editorial section */}
        <div className="space-y-6">
          <p className="caption text-gold-muted tracking-widest">{t("wizard.step7.includes")}</p>
          <div className="space-y-4">
            {["item1", "item2", "item3"].map((item, index) => (
              <div 
                key={item} 
                className="group relative pl-6 py-4 pr-4 border-l-2 border-gold-muted/30 hover:border-gold-muted bg-background/30 hover:bg-background/50 transition-all duration-500 ease-out"
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  animation: 'slideUp 0.6s ease-out forwards',
                  opacity: 0
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-gold-muted/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-muted/20 transition-colors duration-300">
                    <span className="text-xs text-gold-muted font-light">{index + 1}</span>
                  </div>
                  <p className="body-small text-foreground/80 group-hover:text-foreground leading-relaxed transition-colors duration-300">
                    {t(`wizard.step7.${item}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience section */}
        <div className="space-y-4">
          <p className="caption text-gold-muted tracking-widest">{t("wizard.step7.experience")}</p>
          <p className="body-small text-muted-foreground leading-relaxed pl-1">
            {t("wizard.step7.experienceText")}
          </p>
        </div>

        {/* Price and CTA - editorial card */}
        <div className="border border-border p-8 space-y-6">
          <div className="space-y-3">
            <p className="display-small text-foreground">{t("wizard.step7.price")}</p>
            <p className="body-small text-muted-foreground">{t("wizard.step7.priceNote")}</p>
            <p className="body-small text-gold-muted">{t("wizard.step7.priceNote2")}</p>
          </div>
          <div className="pt-4 border-t border-border">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors duration-300 caption tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("wizard.step7.processing")}
                </>
              ) : (
                t("wizard.step7.button")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="space-y-4">
        <p className="caption text-muted-foreground">{t("wizard.step8.caption")}</p>
        <h2 className="display-medium text-foreground">{t("wizard.step8.headline")}</h2>
      </div>
      <div className="max-w-lg space-y-10">
        {/* Confirmation indicator */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-gold" strokeWidth={1.5} />
          </div>
          <p className="body-large text-muted-foreground">
            {t("wizard.step8.intro")}
          </p>
        </div>
        
        {/* Scheduling options */}
        <div className="flex flex-col sm:flex-row gap-6 pt-4">
          <button className="flex-1 py-4 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors duration-300 caption tracking-widest">
            {t("wizard.step8.schedule")}
          </button>
          <button className="flex-1 py-4 border border-border text-foreground hover:border-foreground transition-colors duration-300 caption tracking-widest">
            {t("wizard.step8.whatsapp")}
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      case 6:
        return renderStep6();
      case 7:
        return renderStep7();
      case 8:
        return renderStep8();
      default:
        return null;
    }
  };

  return (
    <section className="py-section px-6 lg:px-12 bg-secondary">
      <div className="max-w-7xl mx-auto">
        {renderStepIndicator()}
        {renderCurrentStep()}
        
        {/* Error display */}
        {error && currentStep !== 5 && (
          <div className="mt-8 p-4 border border-destructive/30 bg-destructive/5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="body-small text-destructive">{error}</p>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-border">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isProcessing}
            className={`flex items-center gap-2 caption transition-colors ${
              currentStep === 1 || isProcessing
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1} />
            {t("wizard.nav.back")}
          </button>
          
          {currentStep < 7 && currentStep !== 5 && (
            <button
              onClick={nextStep}
              disabled={isProcessing}
              className="flex items-center gap-2 caption text-foreground hover:text-muted-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("wizard.nav.processing")}
                </>
              ) : (
                <>
                  {t("wizard.nav.continue")}
                  <ChevronRight className="w-4 h-4" strokeWidth={1} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PreEvaluationWizard;
