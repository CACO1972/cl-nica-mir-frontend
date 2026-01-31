import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Upload, Camera } from "lucide-react";

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface FormData {
  // Step 1 - Personal Data
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  // Step 2 - Medical History
  conditions: string;
  medications: string;
  tobacco: string;
  bruxism: string;
  // Step 3 - Key Question
  lastVisitYear: string;
  lastTreatment: string;
  // Step 4 - Image
  imageFile: File | null;
}

const PreEvaluationWizard = () => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    conditions: "",
    medications: "",
    tobacco: "",
    bruxism: "",
    lastVisitYear: "",
    lastTreatment: "",
    imageFile: null,
  });

  const updateFormData = (field: keyof FormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 8) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
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
                ? "bg-foreground w-6"
                : step < currentStep
                ? "bg-foreground/40"
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
      <div className="space-y-8 max-w-lg">
        <div className="space-y-3">
          <label className="caption text-muted-foreground">{t("wizard.step2.conditions")}</label>
          <Textarea
            value={formData.conditions}
            onChange={(e) => updateFormData("conditions", e.target.value)}
            placeholder={t("wizard.step2.conditions.placeholder")}
            className="bg-transparent border-border focus:border-foreground transition-colors min-h-[100px]"
          />
        </div>
        <div className="space-y-3">
          <label className="caption text-muted-foreground">{t("wizard.step2.medications")}</label>
          <Textarea
            value={formData.medications}
            onChange={(e) => updateFormData("medications", e.target.value)}
            placeholder={t("wizard.step2.medications.placeholder")}
            className="bg-transparent border-border focus:border-foreground transition-colors min-h-[80px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="caption text-muted-foreground">{t("wizard.step2.tobacco")}</label>
            <Input
              value={formData.tobacco}
              onChange={(e) => updateFormData("tobacco", e.target.value)}
              placeholder={t("wizard.step2.tobacco.placeholder")}
              className="bg-transparent border-border focus:border-foreground transition-colors"
            />
          </div>
          <div className="space-y-3">
            <label className="caption text-muted-foreground">{t("wizard.step2.bruxism")}</label>
            <Input
              value={formData.bruxism}
              onChange={(e) => updateFormData("bruxism", e.target.value)}
              placeholder={t("wizard.step2.bruxism.placeholder")}
              className="bg-transparent border-border focus:border-foreground transition-colors"
            />
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
            <div className="w-3 h-3 rounded-full bg-muted-foreground animate-pulse" />
            <span className="body-small text-muted-foreground">{t("wizard.step5.analyzing")}</span>
          </div>
          <p className="body-large text-muted-foreground">
            {t("wizard.step5.message")}
          </p>
        </div>
        <p className="body-large text-foreground">
          {t("wizard.step5.result")}
        </p>
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
      <div className="space-y-4">
        <p className="caption text-muted-foreground">{t("wizard.step7.caption")}</p>
        <h2 className="display-medium text-foreground">{t("wizard.step7.headline")}</h2>
      </div>
      <div className="max-w-lg space-y-8">
        <p className="body-large text-muted-foreground">
          {t("wizard.step7.intro")}
        </p>
        <button className="editorial-link body-small text-foreground tracking-widest">
          {t("wizard.step7.button")}
        </button>
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="space-y-12 animate-fade-in">
      <div className="space-y-4">
        <p className="caption text-muted-foreground">{t("wizard.step8.caption")}</p>
        <h2 className="display-medium text-foreground">{t("wizard.step8.headline")}</h2>
      </div>
      <div className="max-w-lg space-y-8">
        <p className="body-large text-muted-foreground">
          {t("wizard.step8.intro")}
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <button className="editorial-link body-small text-foreground tracking-widest">
            {t("wizard.step8.schedule")}
          </button>
          <button className="editorial-link body-small text-foreground tracking-widest">
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
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-border">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 caption transition-colors ${
              currentStep === 1
                ? "text-muted-foreground/30 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1} />
            {t("wizard.nav.back")}
          </button>
          
          {currentStep < 8 && (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 caption text-foreground hover:text-muted-foreground transition-colors"
            >
              {t("wizard.nav.continue")}
              <ChevronRight className="w-4 h-4" strokeWidth={1} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PreEvaluationWizard;
