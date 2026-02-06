import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "es" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Header
    "location": "Santiago, Chile",
    
    // Philosophy Section
    "philosophy.caption": "Nuestra Filosofía",
    "philosophy.headline": "Prevenir es precisión.",
    "philosophy.p1": "La odontología tradicional espera los problemas. Nosotros elegimos un camino diferente. A través de imágenes avanzadas e inteligencia artificial, leemos las señales que tu sonrisa envía antes de que aparezcan los síntomas.",
    "philosophy.p2": "Cada examen se convierte en una conversación entre tecnología y experiencia humana. Cada diagnóstico, una ventana hacia tu futuro dental.",
    "philosophy.p3": "Esto no es innovación por sí misma. Es cuidado, redefinido.",
    
    // Approach Section
    "approach.caption": "El Enfoque",
    "approach.headline": "Vemos lo que permanece invisible para la práctica convencional. Nuestra tecnología mapea trayectorias, no solo condiciones.",
    "approach.step1": "Imágenes tridimensionales que capturan la arquitectura completa de tu salud oral.",
    "approach.step2": "Algoritmos predictivos que analizan patrones invisibles al ojo humano.",
    "approach.step3": "Protocolos personalizados que abordan las preocupaciones de mañana, hoy.",
    
    // Vision Section
    "vision.headline": "El futuro de la salud dental comienza con previsión.",
    "vision.subline": "En un mundo que se mueve rápido, nos tomamos el tiempo de mirar hacia adelante. Tu sonrisa no merece menos que certeza.",
    
    // CTA Section
    "cta.headline": "¿Listo para comenzar?",
    "cta.button": "Comenzar Evaluación",
    
    // Footer
    "footer.tagline": "Odontología Predictiva",
    
    // Evaluation Page
    "eval.caption": "Evaluación Predictiva",
    "eval.headline": "Diagnóstico avanzado antes de cualquier decisión.",
    "eval.subline": "Una evaluación integral que revela lo que los exámenes convencionales no pueden.",
    
    "eval.what.caption": "Qué Es",
    "eval.what.headline": "El fundamento de la previsión.",
    "eval.what.p1": "La Evaluación Predictiva no es un chequeo rutinario. Es una exploración exhaustiva de tu salud oral, diseñada para descubrir patrones y potenciales que los exámenes estándar simplemente no pueden detectar.",
    "eval.what.p2": "A través de imágenes tridimensionales avanzadas y análisis predictivo, construimos un mapa completo de tu arquitectura dental—identificando no solo condiciones actuales sino las trayectorias que pueden seguir.",
    "eval.what.p3": "Aquí es donde comienza la prevención. Aquí es donde vive la certeza.",
    
    "eval.why.caption": "Para Quién Es",
    "eval.why.headline": "Pacientes que buscan claridad antes de actuar.",
    "eval.why.p1": "Para quienes han postergado su salud dental y desean un punto de partida honesto. Para quienes consideran tratamientos complejos y necesitan certeza antes de decidir.",
    "eval.why.p2": "Para profesionales exigentes que valoran su tiempo y esperan un nivel de atención acorde. Para quienes viajan a Chile y buscan optimizar su visita con un diagnóstico completo.",
    "eval.why.p3": "Si buscas respuestas claras antes de cualquier intervención, esta evaluación es para ti.",
    
    "eval.includes.caption": "Qué Obtienes",
    "eval.includes.headline": "Precisión. Claridad. Escenarios.",
    "eval.includes.imaging.title": "Imágenes Dimensionales",
    "eval.includes.imaging.desc": "Tu evaluación comienza con un escaneo tridimensional integral—una reconstrucción digital precisa de toda tu arquitectura oral. Cada superficie, cada ángulo, cada espacio oculto se vuelve visible y medible.",
    "eval.includes.analysis.title": "Análisis Predictivo",
    "eval.includes.analysis.desc": "Nuestros sistemas de inteligencia artificial analizan tus datos de imagen contra patrones extraídos de miles de casos. El resultado es un mapa de probabilidades—una visión clara de desarrollos potenciales.",
    "eval.includes.protocol.title": "Protocolo Personal",
    "eval.includes.protocol.desc": "Te vas con más que información. Recibes un protocolo de cuidado personalizado—recomendaciones específicas adaptadas a tu perfil dental único.",
    "eval.includes.dialogue.title": "Diálogo Clínico",
    "eval.includes.dialogue.desc": "Una conversación honesta sobre tus opciones. Sin presión. Sin promesas exageradas. Solo claridad sobre el camino que mejor se adapta a tu situación.",
    
    "eval.cta.headline": "Solicita tu evaluación.",
    "eval.cta.subline": "Una sesión. Claridad completa.",
    "eval.cta.button": "Solicitar Evaluación",

    // How to Begin - 4 Equal Options
    "eval.begin.caption": "Tu Punto de Entrada",
    "eval.begin.headline": "¿Cómo quieres comenzar?",
    "eval.begin.preevaluation.title": "Pre-Evaluación Predictiva",
    "eval.begin.preevaluation.desc": "Completa un breve formulario digital con tu información clínica básica y una imagen de referencia. Nuestro sistema prepara tu caso antes de la visita presencial.",
    "eval.begin.preevaluation.cta": "Iniciar pre-evaluación",
    "eval.begin.portal.title": "Portal Paciente",
    "eval.begin.portal.desc": "Acceso privado a tus evaluaciones, informes detallados y seguimiento continuo de tu plan de cuidado. Tu historial clínico, siempre disponible.",
    "eval.begin.portal.cta": "Acceder al portal",
    "eval.begin.opinion.title": "Segunda Opinión",
    "eval.begin.opinion.desc": "Si ya tienes estudios o diagnósticos previos, podemos analizarlos con nuestra perspectiva predictiva. Una mirada fresca antes de decidir.",
    "eval.begin.opinion.cta": "Solicitar segunda opinión",
    "eval.begin.international.title": "Pacientes Regionales e Internacionales",
    "eval.begin.international.desc": "Evaluaciones optimizadas para quienes viajan o residen fuera de Chile. Maximizamos cada visita con un proceso diseñado para tu tiempo.",
    "eval.begin.international.cta": "Ver modalidad internacional",

    // Wizard Step 1
    "wizard.step1.caption": "Paso 1 de 8",
    "wizard.step1.headline": "Datos Personales",
    "wizard.step1.name": "Nombre completo",
    "wizard.step1.email": "Correo electrónico",
    "wizard.step1.phone": "Teléfono",
    "wizard.step1.country": "País",
    "wizard.step1.city": "Ciudad",

    // Wizard Step 2
    "wizard.step2.caption": "Paso 2 de 8",
    "wizard.step2.headline": "Antecedentes y Hábitos",
    "wizard.step2.conditions": "¿Tienes alguna condición médica?",
    "wizard.step2.conditions.diabetes": "Diabetes",
    "wizard.step2.conditions.hypertension": "Hipertensión",
    "wizard.step2.conditions.heart": "Enfermedad cardíaca",
    "wizard.step2.conditions.allergies": "Alergias medicamentosas",
    "wizard.step2.conditions.respiratory": "Problemas respiratorios",
    "wizard.step2.conditions.bleeding": "Trastornos de coagulación",
    "wizard.step2.conditions.none": "Ninguna de las anteriores",
    "wizard.step2.medications": "Medicación actual",
    "wizard.step2.medications.placeholder": "Lista de medicamentos que tomas regularmente",
    "wizard.step2.habits": "Hábitos relevantes",
    "wizard.step2.habits.tobacco": "Consumo de tabaco",
    "wizard.step2.habits.bruxism": "Bruxismo (rechinar dientes)",
    "wizard.step2.habits.alcohol": "Consumo frecuente de alcohol",
    "wizard.step2.habits.none": "Ninguno",

    // Wizard Step 3
    "wizard.step3.caption": "Paso 3 de 8",
    "wizard.step3.headline": "Tu Historial Dental",
    "wizard.step3.intro": "Sé sincero: ¿Cuándo fue tu último control o tratamiento dental?",
    "wizard.step3.year": "Año aproximado",
    "wizard.step3.treatment": "Describe brevemente el tratamiento",
    "wizard.step3.treatment.placeholder": "Limpieza, extracción, implante, etc.",

    // Wizard Step 4
    "wizard.step4.caption": "Paso 4 de 8",
    "wizard.step4.headline": "Imagen de Referencia",
    "wizard.step4.intro": "Una fotografía de la zona que te preocupa nos ayuda a preparar tu evaluación. Puedes subir una imagen o tomar una selfie.",
    "wizard.step4.upload": "Subir imagen",
    "wizard.step4.camera": "Tomar selfie",
    "wizard.step4.selected": "Archivo seleccionado",

    // Wizard Step 5
    "wizard.step5.caption": "Paso 5 de 8",
    "wizard.step5.headline": "Pre-Análisis",
    "wizard.step5.analyzing": "Analizando tu información...",
    "wizard.step5.waiting": "Preparando análisis...",
    "wizard.step5.complete": "Análisis completado",
    "wizard.step5.message": "Nuestro sistema está procesando los datos proporcionados para orientar tu evaluación hacia el módulo más adecuado.",
    "wizard.step5.result": "Basado en tu perfil, tu caso podría beneficiarse del protocolo de evaluación integral. Confirmaremos los detalles durante tu visita presencial.",
    "wizard.step5.riskLevel": "Nivel de riesgo",
    "wizard.step5.riskLow": "Bajo",
    "wizard.step5.riskModerate": "Moderado",
    "wizard.step5.riskHigh": "Alto",

    // Wizard Step 6
    "wizard.step6.caption": "Paso 6 de 8",
    "wizard.step6.headline": "Evaluación Presencial Premium",
    "wizard.step6.p1": "El pre-análisis digital es solo el primer paso. La evaluación completa ocurre en persona, donde la tecnología y la experiencia clínica se encuentran.",
    "wizard.step6.p2": "Durante tu visita, realizaremos imágenes tridimensionales completas, análisis predictivo detallado, y una conversación profunda sobre tus opciones.",
    "wizard.step6.p3": "Esta es la base sobre la cual construimos tu plan de cuidado personalizado.",

    // Wizard Step 7 - Payment
    "wizard.step7.caption": "Paso 7",
    "wizard.step7.headline": "Evaluación Presencial Premium",
    "wizard.step7.subtitle": "Una primera visita clínica avanzada, altamente guiada y visual.",
    "wizard.step7.intro": "Incluye un set diagnóstico completo con imágenes, análisis con IA en vivo, planificación visual y un documento claro para decidir con información real.",
    "wizard.step7.includes": "Qué incluye",
    "wizard.step7.item1": "Visualiza en vivo tu diagnóstico con inteligencia artificial. Ves lo mismo que vemos nosotros: hallazgos, riesgos y patrones que muchas veces no se detectan en un examen tradicional.",
    "wizard.step7.item2": "Te mostramos tus alternativas sobre tu propia boca. Sobre tus imágenes te mostramos, de forma visual, las distintas opciones de tratamiento y cómo se verían en tu caso.",
    "wizard.step7.item3": "Te explicamos todo y cómo abordarlo. El porqué de cada alternativa, qué pasa si decides tratar ahora o esperar, y el costo real de cada opción con formas de pago disponibles.",
    "wizard.step7.experience": "Cómo se vive",
    "wizard.step7.experienceText": "La evaluación se realiza en una visita presencial de aproximadamente 90–100 minutos, guiada paso a paso por el equipo clínico, con explicación directa frente a pantalla.",
    "wizard.step7.price": "49.000 CLP",
    "wizard.step7.priceNote": "Abonable al tratamiento si decides continuar.",
    "wizard.step7.button": "Confirmar y pagar evaluación",
    "wizard.step7.processing": "Procesando pago...",

    // Wizard Step 8 - Confirmation
    "wizard.step8.caption": "Paso 8 de 8",
    "wizard.step8.headline": "Evaluación Confirmada",
    "wizard.step8.intro": "Tu evaluación presencial ha sido reservada. Selecciona cómo deseas agendar tu visita a la clínica.",
    "wizard.step8.schedule": "Agendar Online",
    "wizard.step8.whatsapp": "Agendar por WhatsApp",

    // Wizard Navigation
    "wizard.nav.back": "Volver",
    "wizard.nav.continue": "Continuar",
    "wizard.nav.processing": "Procesando...",
    
    // Wizard Errors
    "wizard.errors.required": "Por favor completa todos los campos requeridos",
    "wizard.errors.invalidEmail": "Por favor ingresa un correo electrónico válido",

    // Menu
    "menu.open": "Menú",
    "menu.close": "Cerrar",
    "menu.evaluation": "Evaluación Predictiva",
    "menu.portal": "Portal Paciente",
    "menu.opinion": "Segunda Opinión",
    "menu.international": "Pacientes Internacionales",

    // Second Opinion Page
    "opinion.hero.caption": "Segunda Opinión",
    "opinion.hero.headline": "Una mirada fresca antes de decidir.",
    "opinion.hero.subline": "Si ya tienes un diagnóstico o presupuesto, podemos analizarlo con nuestra perspectiva predictiva.",
    
    "opinion.what.caption": "Qué Es",
    "opinion.what.headline": "Claridad antes de comprometerte.",
    "opinion.what.p1": "Has recibido un diagnóstico o presupuesto de otra clínica. Antes de tomar una decisión importante, quieres estar seguro de que entiendes todas tus opciones.",
    "opinion.what.p2": "Nuestra Segunda Opinión analiza tu caso con tecnología predictiva, comparando tratamientos propuestos con alternativas que quizás no te han presentado.",
    "opinion.what.p3": "No es cuestión de desconfiar. Es cuestión de decidir con información completa.",
    
    "opinion.options.caption": "Modalidades",
    "opinion.options.headline": "Elige tu nivel de profundidad.",
    "opinion.options.ia.title": "Análisis IA",
    "opinion.options.ia.desc": "Informe automático generado por inteligencia artificial basado en tu diagnóstico y presupuesto actual. Recibes hallazgos clave, comparaciones y recomendaciones.",
    "opinion.options.ia.price": "Gratis",
    "opinion.options.specialist.title": "IA + Especialista",
    "opinion.options.specialist.desc": "Informe IA más videollamada de 20 minutos con un especialista para resolver todas tus dudas y recibir orientación personalizada.",
    "opinion.options.specialist.price": "$19.000 CLP",
    
    "opinion.cta.headline": "¿Listo para una segunda mirada?",
    "opinion.cta.subline": "Completa el formulario con los detalles de tu caso y recibirás un análisis objetivo de tus opciones.",
    "opinion.cta.button": "Solicitar segunda opinión",

    // Second Opinion Wizard Steps
    "opinion.step1.caption": "Paso 1 de 3",
    "opinion.step1.headline": "Tus datos de contacto",
    
    "opinion.step2.caption": "Paso 2 de 3",
    "opinion.step2.headline": "Cuéntanos tu situación",
    "opinion.step2.reason": "¿Por qué buscas una segunda opinión?",
    "opinion.step2.reasonPlaceholder": "Describe brevemente tu situación dental y qué te preocupa...",
    "opinion.step2.diagnosis": "Diagnóstico que te dieron (opcional)",
    "opinion.step2.diagnosisPlaceholder": "Describe el diagnóstico o tratamiento propuesto...",
    "opinion.step2.clinicName": "Clínica de origen",
    "opinion.step2.budgetAmount": "Monto del presupuesto (CLP)",
    
    "opinion.step3.caption": "Paso 3 de 3",
    "opinion.step3.headline": "¿Cómo quieres recibir tu análisis?",
    "opinion.step3.iaOnly.title": "Solo Análisis IA",
    "opinion.step3.iaOnly.desc": "Informe automático con hallazgos, comparaciones y recomendaciones basadas en tu caso.",
    "opinion.step3.iaOnly.price": "Gratis",
    "opinion.step3.specialist.title": "Análisis IA + Videollamada",
    "opinion.step3.specialist.desc": "Informe IA más 20 minutos con un especialista para resolver dudas y recibir orientación.",
    "opinion.step3.specialist.price": "$19.000 CLP",
    
    "opinion.step4.headline": "Analizando tu caso...",
    "opinion.step4.message": "Nuestra inteligencia artificial está procesando la información para generar tu informe personalizado.",
    
    "opinion.step5.caption": "Tu Informe IA",
    "opinion.step5.headline": "Análisis de Segunda Opinión",
    "opinion.step5.findings": "Hallazgos Clave",
    "opinion.step5.recommendations": "Recomendaciones",
    "opinion.step5.savings": "Ahorro potencial estimado",
    "opinion.step5.ctaSpecialist": "Agendar videollamada con especialista",
    "opinion.step5.ctaPremium": "Agendar Evaluación Presencial Premium",
  },
  en: {
    // Header
    "location": "Santiago, Chile",
    
    // Philosophy Section
    "philosophy.caption": "Our Philosophy",
    "philosophy.headline": "Prevention is precision.",
    "philosophy.p1": "Traditional dentistry waits for problems. We chose a different path. Through advanced imaging and artificial intelligence, we read the signals your smile sends before symptoms appear.",
    "philosophy.p2": "Every examination becomes a conversation between technology and human expertise. Every diagnosis, a window into your dental future.",
    "philosophy.p3": "This is not innovation for its own sake. This is care, redefined.",
    
    // Approach Section
    "approach.caption": "The Approach",
    "approach.headline": "We see what remains invisible to conventional practice. Our technology maps trajectories, not just conditions.",
    "approach.step1": "Three-dimensional imaging captures the complete architecture of your oral health.",
    "approach.step2": "Predictive algorithms analyze patterns invisible to the human eye alone.",
    "approach.step3": "Personalized protocols address tomorrow's concerns today.",
    
    // Vision Section
    "vision.headline": "The future of dental health begins with foresight.",
    "vision.subline": "In a world that moves fast, we take the time to look ahead. Your smile deserves nothing less than certainty.",
    
    // CTA Section
    "cta.headline": "Ready to begin?",
    "cta.button": "Begin Evaluation",
    
    // Footer
    "footer.tagline": "Predictive Dentistry",
    
    // Evaluation Page
    "eval.caption": "Predictive Evaluation",
    "eval.headline": "Advanced diagnosis before any decision.",
    "eval.subline": "A comprehensive assessment that reveals what conventional examinations cannot.",
    
    "eval.what.caption": "What It Is",
    "eval.what.headline": "The foundation of foresight.",
    "eval.what.p1": "The Predictive Evaluation is not a routine check-up. It is a comprehensive exploration of your oral health, designed to uncover patterns and potentials that standard examinations simply cannot detect.",
    "eval.what.p2": "Through advanced three-dimensional imaging and predictive analysis, we construct a complete map of your dental architecture—identifying not only current conditions but the trajectories they may follow.",
    "eval.what.p3": "This is where prevention begins. This is where certainty lives.",
    
    "eval.why.caption": "Who It's For",
    "eval.why.headline": "Patients seeking clarity before action.",
    "eval.why.p1": "For those who have postponed their dental health and want an honest starting point. For those considering complex treatments who need certainty before deciding.",
    "eval.why.p2": "For demanding professionals who value their time and expect a level of care to match. For those traveling to Chile who want to optimize their visit with a complete diagnosis.",
    "eval.why.p3": "If you seek clear answers before any intervention, this evaluation is for you.",
    
    "eval.includes.caption": "What You Get",
    "eval.includes.headline": "Precision. Clarity. Scenarios.",
    "eval.includes.imaging.title": "Dimensional Imaging",
    "eval.includes.imaging.desc": "Your evaluation begins with comprehensive three-dimensional scanning—a precise digital reconstruction of your entire oral architecture. Every surface, every angle, every hidden space becomes visible and measurable.",
    "eval.includes.analysis.title": "Predictive Analysis",
    "eval.includes.analysis.desc": "Our artificial intelligence systems analyze your imaging data against patterns drawn from thousands of cases. The result is a probability map—a clear view of potential developments.",
    "eval.includes.protocol.title": "Personal Protocol",
    "eval.includes.protocol.desc": "You leave with more than information. You receive a personalized care protocol—specific recommendations tailored to your unique dental profile.",
    "eval.includes.dialogue.title": "Clinical Dialogue",
    "eval.includes.dialogue.desc": "An honest conversation about your options. No pressure. No exaggerated promises. Just clarity about the path that best suits your situation.",
    
    "eval.cta.headline": "Request your evaluation.",
    "eval.cta.subline": "One session. Complete clarity.",
    "eval.cta.button": "Request Evaluation",

    // How to Begin - 4 Equal Options
    "eval.begin.caption": "Your Entry Point",
    "eval.begin.headline": "How would you like to begin?",
    "eval.begin.preevaluation.title": "Predictive Pre-Evaluation",
    "eval.begin.preevaluation.desc": "Complete a brief digital form with your basic clinical information and a reference image. Our system prepares your case before your in-person visit.",
    "eval.begin.preevaluation.cta": "Start pre-evaluation",
    "eval.begin.portal.title": "Patient Portal",
    "eval.begin.portal.desc": "Private access to your evaluations, detailed reports, and continuous follow-up of your care plan. Your clinical history, always available.",
    "eval.begin.portal.cta": "Access portal",
    "eval.begin.opinion.title": "Second Opinion",
    "eval.begin.opinion.desc": "If you already have studies or previous diagnoses, we can analyze them with our predictive perspective. A fresh look before deciding.",
    "eval.begin.opinion.cta": "Request second opinion",
    "eval.begin.international.title": "Regional & International Patients",
    "eval.begin.international.desc": "Optimized evaluations for those traveling or living outside Chile. We maximize every visit with a process designed for your time.",
    "eval.begin.international.cta": "View international options",

    // Wizard Step 1
    "wizard.step1.caption": "Step 1 of 8",
    "wizard.step1.headline": "Personal Information",
    "wizard.step1.name": "Full name",
    "wizard.step1.email": "Email address",
    "wizard.step1.phone": "Phone number",
    "wizard.step1.country": "Country",
    "wizard.step1.city": "City",

    // Wizard Step 2
    "wizard.step2.caption": "Step 2 of 8",
    "wizard.step2.headline": "Medical History & Habits",
    "wizard.step2.conditions": "Do you have any medical conditions?",
    "wizard.step2.conditions.diabetes": "Diabetes",
    "wizard.step2.conditions.hypertension": "Hypertension",
    "wizard.step2.conditions.heart": "Heart disease",
    "wizard.step2.conditions.allergies": "Drug allergies",
    "wizard.step2.conditions.respiratory": "Respiratory problems",
    "wizard.step2.conditions.bleeding": "Bleeding disorders",
    "wizard.step2.conditions.none": "None of the above",
    "wizard.step2.medications": "Current medications",
    "wizard.step2.medications.placeholder": "List of medications you take regularly",
    "wizard.step2.habits": "Relevant habits",
    "wizard.step2.habits.tobacco": "Tobacco use",
    "wizard.step2.habits.bruxism": "Bruxism (teeth grinding)",
    "wizard.step2.habits.alcohol": "Frequent alcohol consumption",
    "wizard.step2.habits.none": "None",

    // Wizard Step 3
    "wizard.step3.caption": "Step 3 of 8",
    "wizard.step3.headline": "Your Dental History",
    "wizard.step3.intro": "Be honest: When was your last dental check-up or treatment?",
    "wizard.step3.year": "Approximate year",
    "wizard.step3.treatment": "Briefly describe the treatment",
    "wizard.step3.treatment.placeholder": "Cleaning, extraction, implant, etc.",

    // Wizard Step 4
    "wizard.step4.caption": "Step 4 of 8",
    "wizard.step4.headline": "Reference Image",
    "wizard.step4.intro": "A photograph of the area that concerns you helps us prepare your evaluation. You can upload an image or take a selfie.",
    "wizard.step4.upload": "Upload image",
    "wizard.step4.camera": "Take selfie",
    "wizard.step4.selected": "Selected file",

    // Wizard Step 5
    "wizard.step5.caption": "Step 5 of 8",
    "wizard.step5.headline": "Pre-Analysis",
    "wizard.step5.analyzing": "Analyzing your information...",
    "wizard.step5.waiting": "Preparing analysis...",
    "wizard.step5.complete": "Analysis complete",
    "wizard.step5.message": "Our system is processing the provided data to guide your evaluation toward the most appropriate module.",
    "wizard.step5.result": "Based on your profile, your case could benefit from the comprehensive evaluation protocol. We will confirm the details during your in-person visit.",
    "wizard.step5.riskLevel": "Risk level",
    "wizard.step5.riskLow": "Low",
    "wizard.step5.riskModerate": "Moderate",
    "wizard.step5.riskHigh": "High",

    // Wizard Step 6
    "wizard.step6.caption": "Step 6 of 8",
    "wizard.step6.headline": "Premium In-Person Evaluation",
    "wizard.step6.p1": "The digital pre-analysis is just the first step. The complete evaluation happens in person, where technology and clinical expertise meet.",
    "wizard.step6.p2": "During your visit, we will perform complete three-dimensional imaging, detailed predictive analysis, and a deep conversation about your options.",
    "wizard.step6.p3": "This is the foundation upon which we build your personalized care plan.",

    // Wizard Step 7 - Payment
    "wizard.step7.caption": "Step 7",
    "wizard.step7.headline": "Premium In-Person Evaluation",
    "wizard.step7.subtitle": "An advanced, highly guided and visual first clinical visit.",
    "wizard.step7.intro": "Includes a complete diagnostic set with images, live AI analysis, visual planning and a clear document to make decisions with real information.",
    "wizard.step7.includes": "What's included",
    "wizard.step7.item1": "Watch your diagnosis live with AI. You see what we see: findings, risks and patterns often missed in traditional exams.",
    "wizard.step7.item2": "See your options on your own images. We show treatment alternatives visually, directly on your scans, so you understand what each means for you.",
    "wizard.step7.item3": "We explain everything clearly. Why each option matters, what happens if you treat now or wait, real costs and payment options available.",
    "wizard.step7.experience": "The experience",
    "wizard.step7.experienceText": "The evaluation takes place in an in-person visit of approximately 90–100 minutes, guided step by step by the clinical team, with direct explanation in front of the screen.",
    "wizard.step7.price": "49,000 CLP",
    "wizard.step7.priceNote": "Applicable to treatment if you decide to continue.",
    "wizard.step7.button": "Confirm and pay evaluation",
    "wizard.step7.processing": "Processing payment...",

    // Wizard Step 8 - Confirmation
    "wizard.step8.caption": "Step 8 of 8",
    "wizard.step8.headline": "Evaluation Confirmed",
    "wizard.step8.intro": "Your in-person evaluation has been reserved. Select how you would like to schedule your clinic visit.",
    "wizard.step8.schedule": "Schedule Online",
    "wizard.step8.whatsapp": "Schedule via WhatsApp",

    // Wizard Navigation
    "wizard.nav.back": "Back",
    "wizard.nav.continue": "Continue",
    "wizard.nav.processing": "Processing...",
    
    // Wizard Errors
    "wizard.errors.required": "Please fill in all required fields",
    "wizard.errors.invalidEmail": "Please enter a valid email address",

    // Menu
    "menu.open": "Menu",
    "menu.close": "Close",
    "menu.evaluation": "Predictive Evaluation",
    "menu.portal": "Patient Portal",
    "menu.opinion": "Second Opinion",
    "menu.international": "International Patients",

    // Second Opinion Page
    "opinion.hero.caption": "Second Opinion",
    "opinion.hero.headline": "A fresh look before deciding.",
    "opinion.hero.subline": "If you already have a diagnosis or quote, we can analyze it with our predictive perspective.",
    
    "opinion.what.caption": "What It Is",
    "opinion.what.headline": "Clarity before you commit.",
    "opinion.what.p1": "You've received a diagnosis or quote from another clinic. Before making an important decision, you want to be sure you understand all your options.",
    "opinion.what.p2": "Our Second Opinion analyzes your case with predictive technology, comparing proposed treatments with alternatives you may not have been presented.",
    "opinion.what.p3": "It's not about distrust. It's about deciding with complete information.",
    
    "opinion.options.caption": "Options",
    "opinion.options.headline": "Choose your depth level.",
    "opinion.options.ia.title": "AI Analysis",
    "opinion.options.ia.desc": "Automated report generated by artificial intelligence based on your current diagnosis and quote. You receive key findings, comparisons and recommendations.",
    "opinion.options.ia.price": "Free",
    "opinion.options.specialist.title": "AI + Specialist",
    "opinion.options.specialist.desc": "AI report plus 20-minute video call with a specialist to resolve all your questions and receive personalized guidance.",
    "opinion.options.specialist.price": "$19,000 CLP",
    
    "opinion.cta.headline": "Ready for a second look?",
    "opinion.cta.subline": "Complete the form with details of your case and receive an objective analysis of your options.",
    "opinion.cta.button": "Request second opinion",

    // Second Opinion Wizard Steps
    "opinion.step1.caption": "Step 1 of 3",
    "opinion.step1.headline": "Your contact details",
    
    "opinion.step2.caption": "Step 2 of 3",
    "opinion.step2.headline": "Tell us your situation",
    "opinion.step2.reason": "Why are you seeking a second opinion?",
    "opinion.step2.reasonPlaceholder": "Briefly describe your dental situation and what concerns you...",
    "opinion.step2.diagnosis": "Diagnosis you received (optional)",
    "opinion.step2.diagnosisPlaceholder": "Describe the diagnosis or proposed treatment...",
    "opinion.step2.clinicName": "Original clinic",
    "opinion.step2.budgetAmount": "Quote amount (CLP)",
    
    "opinion.step3.caption": "Step 3 of 3",
    "opinion.step3.headline": "How would you like to receive your analysis?",
    "opinion.step3.iaOnly.title": "AI Analysis Only",
    "opinion.step3.iaOnly.desc": "Automated report with findings, comparisons and recommendations based on your case.",
    "opinion.step3.iaOnly.price": "Free",
    "opinion.step3.specialist.title": "AI Analysis + Video Call",
    "opinion.step3.specialist.desc": "AI report plus 20 minutes with a specialist to resolve questions and receive guidance.",
    "opinion.step3.specialist.price": "$19,000 CLP",
    
    "opinion.step4.headline": "Analyzing your case...",
    "opinion.step4.message": "Our artificial intelligence is processing the information to generate your personalized report.",
    
    "opinion.step5.caption": "Your AI Report",
    "opinion.step5.headline": "Second Opinion Analysis",
    "opinion.step5.findings": "Key Findings",
    "opinion.step5.recommendations": "Recommendations",
    "opinion.step5.savings": "Estimated potential savings",
    "opinion.step5.ctaSpecialist": "Schedule video call with specialist",
    "opinion.step5.ctaPremium": "Schedule Premium In-Person Evaluation",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    return (stored as Language) || "es";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
