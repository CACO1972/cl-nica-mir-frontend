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
    "location": "Av. Nueva Providencia 2214, Of. 189 · Providencia, Santiago",
    
    // Philosophy Section
    "philosophy.caption": "Nuestra Filosofía",
    "philosophy.headline": "¿Te dieron diagnósticos distintos y no sabes cuál es el correcto?",
    "philosophy.p1": "¿Te ha pasado que vas a tres dentistas y sales con tres diagnósticos distintos? El problema no es el precio. El problema es la incertidumbre.",
    "philosophy.p2": "En Clínica Miró potenciamos nuestros procesos con inteligencia artificial, no para tomar decisiones por ti, sino para entregarte diagnósticos más precisos, tratamientos más seguros y resultados más predecibles.",
    "philosophy.p3": "Antes de tratarte, entiende tu caso con claridad.",
    
    // Approach Section
    "approach.caption": "El Enfoque",
    "approach.headline": "Claridad clínica antes de cualquier decisión. Entendemos tu caso para que decidas con información real.",
    "approach.step1": "Imágenes tridimensionales que muestran lo que otros exámenes no detectan.",
    "approach.step2": "Análisis que identifica patrones para darte alternativas claras.",
    "approach.step3": "Te explicamos cada opción y el costo real de cada una.",
    
    // Vision Section
    "vision.headline": "Tu sonrisa merece decisiones informadas.",
    "vision.subline": "No te vendemos un tratamiento. Te ayudamos a entender tu caso para que tomes la mejor decisión para ti.",
    
    // CTA Section
    "cta.headline": "¿Listo para entender tu caso?",
    "cta.button": "Empezar mi evaluación guiada",
    
    // Footer
    "footer.tagline": "Claridad antes de tratarte",
    
    // Evaluation Page
    "eval.caption": "Evaluación Paciente Nuevo",
    "eval.headline": "¿Te dieron diagnósticos distintos y no sabes cuál es el correcto?",
    "eval.subline": "Antes de tratarte, entiende tu caso con claridad clínica y visual.",
    
    "eval.what.caption": "Qué Es",
    "eval.what.headline": "Un proceso para decidir con información real.",
    "eval.what.p1": "Esto no es una consulta tradicional. Es una evaluación clínica avanzada donde analizamos tu caso en profundidad, te mostramos tus alternativas y el posible resultado de cada una.",
    "eval.what.p2": "La inteligencia artificial no decide por ti ni por nosotros. Nos permite tener la seguridad de que estamos tomando la mejor decisión posible.",
    "eval.what.p3": "Aquí es donde termina la incertidumbre. Aquí es donde comienza la claridad.",
    
    "eval.why.caption": "Para Quién Es",
    "eval.why.headline": "Para quienes buscan claridad antes de actuar.",
    "eval.why.p1": "Para quienes han ido a varios dentistas y recibido diagnósticos distintos. Para quienes tienen miedo de equivocarse con un tratamiento caro.",
    "eval.why.p2": "Para quienes quieren entender su caso antes de comprometerse. Para quienes valoran su tiempo y esperan explicaciones claras, no ventas.",
    "eval.why.p3": "Si buscas respuestas claras antes de cualquier tratamiento, este proceso es para ti.",
    
    "eval.includes.caption": "Qué Obtienes",
    "eval.includes.headline": "Claridad. Alternativas. Tranquilidad.",
    "eval.includes.imaging.title": "Visualización Completa",
    "eval.includes.imaging.desc": "Ves lo mismo que vemos nosotros: tu caso en imágenes tridimensionales, hallazgos, riesgos y patrones que muchas veces no se detectan en un examen tradicional.",
    "eval.includes.analysis.title": "Tus Alternativas Claras",
    "eval.includes.analysis.desc": "Te mostramos las distintas opciones de tratamiento sobre tus propias imágenes, de forma visual, para que entiendas qué significa cada una para tu caso.",
    "eval.includes.protocol.title": "Explicación Honesta",
    "eval.includes.protocol.desc": "Te explicamos el porqué de cada alternativa, qué pasa si decides tratar ahora o esperar, y el costo real de cada opción con formas de pago disponibles.",
    "eval.includes.dialogue.title": "Sin Presión",
    "eval.includes.dialogue.desc": "Una conversación honesta sobre tus opciones. Sin venta agresiva. Sin promesas exageradas. Solo claridad sobre el camino que mejor se adapta a tu situación.",
    
    "eval.cta.headline": "Solicita tu evaluación.",
    "eval.cta.subline": "Sin compromiso. Sin venta. Solo claridad.",
    "eval.cta.button": "Empezar mi evaluación guiada",

    // How to Begin - 4 Equal Options
    "eval.begin.caption": "Tu Punto de Entrada",
    "eval.begin.headline": "¿Cómo quieres comenzar?",
    "eval.begin.preevaluation.title": "Evaluación Paciente Nuevo",
    "eval.begin.preevaluation.desc": "Te acompañamos paso a paso para entender tu caso. Sin compromiso. Sin venta. Solo claridad antes de cualquier decisión.",
    "eval.begin.preevaluation.cta": "Empezar mi evaluación guiada",
    "eval.begin.portal.title": "Portal Paciente",
    "eval.begin.portal.desc": "Acceso privado a tus evaluaciones, informes detallados y seguimiento continuo de tu plan de cuidado. Tu historial clínico, siempre disponible.",
    "eval.begin.portal.cta": "Acceder al portal",
    "eval.begin.opinion.title": "Segunda Opinión",
    "eval.begin.opinion.desc": "Si ya tienes estudios o diagnósticos previos, podemos analizarlos con nuestra perspectiva. Una mirada fresca antes de decidir.",
    "eval.begin.opinion.cta": "Solicitar segunda opinión",
    "eval.begin.international.title": "Pacientes Regionales e Internacionales",
    "eval.begin.international.desc": "Evaluaciones optimizadas para quienes viajan o residen fuera de Chile. Maximizamos cada visita con un proceso diseñado para tu tiempo.",
    "eval.begin.international.cta": "Ver modalidad internacional",

    // Wizard Step 1
    "wizard.step1.caption": "Te acompañamos paso a paso",
    "wizard.step1.headline": "Empecemos por conocerte",
    "wizard.step1.name": "Nombre completo",
    "wizard.step1.email": "Correo electrónico",
    "wizard.step1.phone": "Teléfono",
    "wizard.step1.country": "País",
    "wizard.step1.city": "Ciudad",

    // Wizard Step 2
    "wizard.step2.caption": "Te acompañamos paso a paso",
    "wizard.step2.headline": "Tu Historial de Salud",
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
    "wizard.step3.caption": "Te acompañamos paso a paso",
    "wizard.step3.headline": "Tu Historial Dental",
    "wizard.step3.intro": "No estás tomando ninguna decisión todavía. Solo estamos entendiendo tu caso.",
    "wizard.step3.year": "Año aproximado de tu última visita",
    "wizard.step3.treatment": "Describe brevemente el tratamiento",
    "wizard.step3.treatment.placeholder": "Limpieza, extracción, implante, etc.",

    // Wizard Step 4
    "wizard.step4.caption": "Te acompañamos paso a paso",
    "wizard.step4.headline": "Imagen de Referencia",
    "wizard.step4.intro": "Una fotografía de la zona que te preocupa nos ayuda a preparar tu evaluación. Puedes subir una imagen o tomar una selfie.",
    "wizard.step4.upload": "Subir imagen",
    "wizard.step4.camera": "Tomar selfie",
    "wizard.step4.selected": "Archivo seleccionado",

    // Wizard Step 5
    "wizard.step5.caption": "Te acompañamos paso a paso",
    "wizard.step5.headline": "Preparando tu caso",
    "wizard.step5.analyzing": "Analizando tu información...",
    "wizard.step5.waiting": "Preparando análisis...",
    "wizard.step5.complete": "Listo para continuar",
    "wizard.step5.message": "Estamos preparando la información para tu evaluación presencial. No te preocupes, solo estamos entendiendo mejor tu caso.",
    "wizard.step5.result": "Tu caso está listo. En la evaluación presencial podremos mostrarte todo con claridad visual.",
    "wizard.step5.riskLevel": "Nivel de atención",
    "wizard.step5.riskLow": "Bajo",
    "wizard.step5.riskModerate": "Moderado",
    "wizard.step5.riskHigh": "Alto",

    // Wizard Step 6
    "wizard.step6.caption": "Te acompañamos paso a paso",
    "wizard.step6.headline": "El siguiente paso: claridad visual",
    "wizard.step6.p1": "Este proceso digital es solo el inicio. La evaluación completa ocurre en persona, donde podrás ver tu caso con claridad total.",
    "wizard.step6.p2": "Te mostraremos tus alternativas sobre tus propias imágenes. Verás lo mismo que vemos nosotros y entenderás cada opción antes de decidir nada.",
    "wizard.step6.p3": "El objetivo no es venderte un tratamiento. Es que entiendas tu caso y decidas con información real.",

    // Wizard Step 7 - Payment
    "wizard.step7.caption": "Te acompañamos paso a paso",
    "wizard.step7.headline": "Evaluación Presencial con Claridad Visual",
    "wizard.step7.subtitle": "Una primera visita donde entiendes tu caso antes de comprometerte con nada.",
    "wizard.step7.intro": "Esto no es una consulta tradicional. Es una evaluación donde analizamos tu caso en profundidad, te mostramos tus alternativas y el posible resultado de cada una, para que decidas con información real.",
    "wizard.step7.includes": "Qué incluye",
    "wizard.step7.item1": "Visualiza en vivo tu diagnóstico. Ves lo mismo que vemos nosotros: hallazgos, riesgos y patrones que muchas veces no se detectan en un examen tradicional.",
    "wizard.step7.item2": "Te mostramos tus alternativas sobre tu propia boca. De forma visual, las distintas opciones de tratamiento y cómo se verían en tu caso.",
    "wizard.step7.item3": "Te explicamos todo y cómo abordarlo. El porqué de cada alternativa, qué pasa si decides tratar ahora o esperar, y el costo real de cada opción.",
    "wizard.step7.item4": "Incluye Rx panorámica y escaneo intraoral digital. Tomamos tus imágenes diagnósticas en la clínica para analizar tu caso con precisión real.",
    "wizard.step7.experience": "Cómo se vive",
    "wizard.step7.experienceText": "La evaluación dura aproximadamente 90–100 minutos, guiada paso a paso por el equipo clínico, con explicación directa frente a pantalla. Sin prisa. Sin presión.",
    "wizard.step7.price": "49.000 CLP",
    "wizard.step7.priceNote": "Abonable al tratamiento si decides continuar.",
    "wizard.step7.priceNote2": "Pago seguro · Evaluación presencial guiada",
    "wizard.step7.button": "Confirmar y reservar evaluación",
    "wizard.step7.processing": "Procesando...",

    // Wizard Step 8 - Confirmation
    "wizard.step8.caption": "¡Listo!",
    "wizard.step8.headline": "Tu evaluación está confirmada",
    "wizard.step8.intro": "El siguiente paso es acompañarte en la decisión, no venderte un tratamiento. Selecciona cómo deseas agendar tu visita.",
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
    "menu.evaluation": "Evaluación Paciente Nuevo",
    "menu.portal": "Portal Paciente",
    "menu.opinion": "Segunda Opinión",
    "menu.international": "Pacientes Internacionales",

    // Second Opinion Page
    "opinion.hero.caption": "Segunda Opinión",
    "opinion.hero.headline": "Una mirada fresca antes de decidir.",
    "opinion.hero.subline": "Si ya tienes un diagnóstico o presupuesto, podemos analizarlo para darte claridad.",
    
    "opinion.what.caption": "Qué Es",
    "opinion.what.headline": "Claridad antes de comprometerte.",
    "opinion.what.p1": "Has recibido un diagnóstico o presupuesto de otra clínica. Antes de tomar una decisión importante, quieres estar seguro de que entiendes todas tus opciones.",
    "opinion.what.p2": "Nuestra Segunda Opinión analiza tu caso comparando tratamientos propuestos con alternativas que quizás no te han presentado.",
    "opinion.what.p3": "No es cuestión de desconfiar. Es cuestión de decidir con información completa.",
    
    "opinion.options.caption": "Modalidades",
    "opinion.options.headline": "Elige tu nivel de profundidad.",
    "opinion.options.ia.title": "Análisis Inicial",
    "opinion.options.ia.desc": "Informe basado en tu diagnóstico y presupuesto actual. Recibes hallazgos clave, comparaciones y recomendaciones.",
    "opinion.options.ia.price": "Gratis",
    "opinion.options.specialist.title": "Análisis + Especialista",
    "opinion.options.specialist.desc": "Informe más videollamada de 20 minutos con un especialista para resolver todas tus dudas y recibir orientación personalizada.",
    "opinion.options.specialist.price": "$19.000 CLP",
    
    "opinion.cta.headline": "¿Listo para una segunda mirada?",
    "opinion.cta.subline": "Completa el formulario con los detalles de tu caso y recibirás un análisis objetivo de tus opciones.",
    "opinion.cta.button": "Solicitar segunda opinión",

    // Second Opinion Wizard Steps
    "opinion.step1.caption": "Te acompañamos paso a paso",
    "opinion.step1.headline": "Tus datos de contacto",
    
    "opinion.step2.caption": "Te acompañamos paso a paso",
    "opinion.step2.headline": "Cuéntanos tu situación",
    "opinion.step2.reason": "¿Por qué buscas una segunda opinión?",
    "opinion.step2.reasonPlaceholder": "Describe brevemente tu situación dental y qué te preocupa...",
    "opinion.step2.diagnosis": "Diagnóstico que te dieron (opcional)",
    "opinion.step2.diagnosisPlaceholder": "Describe el diagnóstico o tratamiento propuesto...",
    "opinion.step2.clinicName": "Clínica de origen",
    "opinion.step2.budgetAmount": "Monto del presupuesto (CLP)",
    
    "opinion.step3.caption": "Te acompañamos paso a paso",
    "opinion.step3.headline": "¿Cómo quieres recibir tu análisis?",
    "opinion.step3.iaOnly.title": "Solo Análisis Inicial",
    "opinion.step3.iaOnly.desc": "Informe con hallazgos, comparaciones y recomendaciones basadas en tu caso.",
    "opinion.step3.iaOnly.price": "Gratis",
    "opinion.step3.specialist.title": "Análisis + Videollamada",
    "opinion.step3.specialist.desc": "Informe más 20 minutos con un especialista para resolver dudas y recibir orientación.",
    "opinion.step3.specialist.price": "$19.000 CLP",
    
    "opinion.step4.headline": "Analizando tu caso...",
    "opinion.step4.message": "Estamos procesando la información para generar tu informe personalizado.",
    
    "opinion.step5.caption": "Tu Informe",
    "opinion.step5.headline": "Análisis de Segunda Opinión",
    "opinion.step5.findings": "Hallazgos Clave",
    "opinion.step5.recommendations": "Recomendaciones",
    "opinion.step5.savings": "Ahorro potencial estimado",
    "opinion.step5.ctaSpecialist": "Agendar videollamada con especialista",
    "opinion.step5.ctaPremium": "Agendar Evaluación Presencial",
  },
  en: {
    // Header
    "location": "Av. Nueva Providencia 2214, Of. 189 · Providencia, Santiago",
    
    // Philosophy Section
    "philosophy.caption": "Our Philosophy",
    "philosophy.headline": "Did you get different diagnoses and don't know which one is right?",
    "philosophy.p1": "Have you ever gone to three dentists and left with three different diagnoses? The problem isn't the price. The problem is the uncertainty.",
    "philosophy.p2": "At Clínica Miró we enhance our processes with artificial intelligence, not to make decisions for you, but to give you more accurate diagnoses, safer treatments, and more predictable results.",
    "philosophy.p3": "Before treating you, understand your case with clarity.",
    
    // Approach Section
    "approach.caption": "The Approach",
    "approach.headline": "Clinical clarity before any decision. We understand your case so you can decide with real information.",
    "approach.step1": "Three-dimensional imaging that shows what other exams don't detect.",
    "approach.step2": "Analysis that identifies patterns to give you clear alternatives.",
    "approach.step3": "We explain each option and the real cost of each one.",
    
    // Vision Section
    "vision.headline": "Your smile deserves informed decisions.",
    "vision.subline": "We don't sell you a treatment. We help you understand your case so you can make the best decision for you.",
    
    // CTA Section
    "cta.headline": "Ready to understand your case?",
    "cta.button": "Start my guided evaluation",
    
    // Footer
    "footer.tagline": "Clarity before treatment",
    
    // Evaluation Page
    "eval.caption": "New Patient Evaluation",
    "eval.headline": "Did you get different diagnoses and don't know which one is right?",
    "eval.subline": "Before treating you, understand your case with clinical and visual clarity.",
    
    "eval.what.caption": "What It Is",
    "eval.what.headline": "A process to decide with real information.",
    "eval.what.p1": "This is not a traditional consultation. It's an advanced clinical evaluation where we analyze your case in depth, show you your alternatives and the possible outcome of each one.",
    "eval.what.p2": "Artificial intelligence doesn't decide for you or for us. It allows us the certainty that we're making the best possible decision.",
    "eval.what.p3": "This is where uncertainty ends. This is where clarity begins.",
    
    "eval.why.caption": "Who It's For",
    "eval.why.headline": "For those seeking clarity before action.",
    "eval.why.p1": "For those who have been to several dentists and received different diagnoses. For those afraid of making a mistake with an expensive treatment.",
    "eval.why.p2": "For those who want to understand their case before committing. For those who value their time and expect clear explanations, not sales pitches.",
    "eval.why.p3": "If you seek clear answers before any treatment, this process is for you.",
    
    "eval.includes.caption": "What You Get",
    "eval.includes.headline": "Clarity. Alternatives. Peace of mind.",
    "eval.includes.imaging.title": "Complete Visualization",
    "eval.includes.imaging.desc": "You see what we see: your case in three-dimensional images, findings, risks and patterns often missed in traditional exams.",
    "eval.includes.analysis.title": "Your Clear Alternatives",
    "eval.includes.analysis.desc": "We show you the different treatment options on your own images, visually, so you understand what each one means for your case.",
    "eval.includes.protocol.title": "Honest Explanation",
    "eval.includes.protocol.desc": "We explain why each alternative matters, what happens if you treat now or wait, and the real cost of each option with available payment methods.",
    "eval.includes.dialogue.title": "No Pressure",
    "eval.includes.dialogue.desc": "An honest conversation about your options. No aggressive sales. No exaggerated promises. Just clarity about the path that best suits your situation.",
    
    "eval.cta.headline": "Request your evaluation.",
    "eval.cta.subline": "No commitment. No sales. Just clarity.",
    "eval.cta.button": "Start my guided evaluation",

    // How to Begin - 4 Equal Options
    "eval.begin.caption": "Your Entry Point",
    "eval.begin.headline": "How would you like to begin?",
    "eval.begin.preevaluation.title": "New Patient Evaluation",
    "eval.begin.preevaluation.desc": "We guide you step by step to understand your case. No commitment. No sales. Just clarity before any decision.",
    "eval.begin.preevaluation.cta": "Start my guided evaluation",
    "eval.begin.portal.title": "Patient Portal",
    "eval.begin.portal.desc": "Private access to your evaluations, detailed reports, and continuous follow-up of your care plan. Your clinical history, always available.",
    "eval.begin.portal.cta": "Access portal",
    "eval.begin.opinion.title": "Second Opinion",
    "eval.begin.opinion.desc": "If you already have studies or previous diagnoses, we can analyze them with our perspective. A fresh look before deciding.",
    "eval.begin.opinion.cta": "Request second opinion",
    "eval.begin.international.title": "Regional & International Patients",
    "eval.begin.international.desc": "Optimized evaluations for those traveling or living outside Chile. We maximize every visit with a process designed for your time.",
    "eval.begin.international.cta": "View international options",

    // Wizard Step 1
    "wizard.step1.caption": "We guide you step by step",
    "wizard.step1.headline": "Let's start by getting to know you",
    "wizard.step1.name": "Full name",
    "wizard.step1.email": "Email address",
    "wizard.step1.phone": "Phone number",
    "wizard.step1.country": "Country",
    "wizard.step1.city": "City",

    // Wizard Step 2
    "wizard.step2.caption": "We guide you step by step",
    "wizard.step2.headline": "Your Health History",
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
    "wizard.step3.caption": "We guide you step by step",
    "wizard.step3.headline": "Your Dental History",
    "wizard.step3.intro": "You're not making any decision yet. We're just understanding your case.",
    "wizard.step3.year": "Approximate year of your last visit",
    "wizard.step3.treatment": "Briefly describe the treatment",
    "wizard.step3.treatment.placeholder": "Cleaning, extraction, implant, etc.",

    // Wizard Step 4
    "wizard.step4.caption": "We guide you step by step",
    "wizard.step4.headline": "Reference Image",
    "wizard.step4.intro": "A photograph of the area that concerns you helps us prepare your evaluation. You can upload an image or take a selfie.",
    "wizard.step4.upload": "Upload image",
    "wizard.step4.camera": "Take selfie",
    "wizard.step4.selected": "Selected file",

    // Wizard Step 5
    "wizard.step5.caption": "We guide you step by step",
    "wizard.step5.headline": "Preparing your case",
    "wizard.step5.analyzing": "Analyzing your information...",
    "wizard.step5.waiting": "Preparing analysis...",
    "wizard.step5.complete": "Ready to continue",
    "wizard.step5.message": "We're preparing the information for your in-person evaluation. Don't worry, we're just better understanding your case.",
    "wizard.step5.result": "Your case is ready. In the in-person evaluation we can show you everything with visual clarity.",
    "wizard.step5.riskLevel": "Attention level",
    "wizard.step5.riskLow": "Low",
    "wizard.step5.riskModerate": "Moderate",
    "wizard.step5.riskHigh": "High",

    // Wizard Step 6
    "wizard.step6.caption": "We guide you step by step",
    "wizard.step6.headline": "Next step: visual clarity",
    "wizard.step6.p1": "This digital process is just the beginning. The complete evaluation happens in person, where you can see your case with total clarity.",
    "wizard.step6.p2": "We'll show you your alternatives on your own images. You'll see what we see and understand each option before deciding anything.",
    "wizard.step6.p3": "The goal is not to sell you a treatment. It's for you to understand your case and decide with real information.",

    // Wizard Step 7 - Payment
    "wizard.step7.caption": "We guide you step by step",
    "wizard.step7.headline": "In-Person Evaluation with Visual Clarity",
    "wizard.step7.subtitle": "A first visit where you understand your case before committing to anything.",
    "wizard.step7.intro": "This is not a traditional consultation. It's an evaluation where we analyze your case in depth, show you your alternatives and the possible outcome of each one, so you can decide with real information.",
    "wizard.step7.includes": "What's included",
    "wizard.step7.item1": "Visualize your diagnosis live. You see what we see: findings, risks and patterns often missed in traditional exams.",
    "wizard.step7.item2": "We show you your alternatives on your own mouth. Visually, the different treatment options and how they would look in your case.",
    "wizard.step7.item3": "We explain everything and how to approach it. Why each alternative matters, what happens if you treat now or wait, and the real cost of each option.",
    "wizard.step7.item4": "Includes panoramic X-ray and digital intraoral scan. We capture your diagnostic images at the clinic to analyze your case with real precision.",
    "wizard.step7.experience": "The experience",
    "wizard.step7.experienceText": "The evaluation takes approximately 90–100 minutes, guided step by step by the clinical team, with direct explanation in front of the screen. No rush. No pressure.",
    "wizard.step7.price": "49,000 CLP",
    "wizard.step7.priceNote": "Applicable to treatment if you decide to continue.",
    "wizard.step7.priceNote2": "Secure payment · Guided in-person evaluation",
    "wizard.step7.button": "Confirm and reserve evaluation",
    "wizard.step7.processing": "Processing...",

    // Wizard Step 8 - Confirmation
    "wizard.step8.caption": "Done!",
    "wizard.step8.headline": "Your evaluation is confirmed",
    "wizard.step8.intro": "The next step is to accompany you in the decision, not sell you a treatment. Select how you'd like to schedule your visit.",
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
    "menu.evaluation": "New Patient Evaluation",
    "menu.portal": "Patient Portal",
    "menu.opinion": "Second Opinion",
    "menu.international": "International Patients",

    // Second Opinion Page
    "opinion.hero.caption": "Second Opinion",
    "opinion.hero.headline": "A fresh look before deciding.",
    "opinion.hero.subline": "If you already have a diagnosis or quote, we can analyze it to give you clarity.",
    
    "opinion.what.caption": "What It Is",
    "opinion.what.headline": "Clarity before you commit.",
    "opinion.what.p1": "You've received a diagnosis or quote from another clinic. Before making an important decision, you want to be sure you understand all your options.",
    "opinion.what.p2": "Our Second Opinion analyzes your case comparing proposed treatments with alternatives you may not have been presented.",
    "opinion.what.p3": "It's not about distrust. It's about deciding with complete information.",
    
    "opinion.options.caption": "Options",
    "opinion.options.headline": "Choose your depth level.",
    "opinion.options.ia.title": "Initial Analysis",
    "opinion.options.ia.desc": "Report based on your current diagnosis and quote. You receive key findings, comparisons and recommendations.",
    "opinion.options.ia.price": "Free",
    "opinion.options.specialist.title": "Analysis + Specialist",
    "opinion.options.specialist.desc": "Report plus 20-minute video call with a specialist to resolve all your questions and receive personalized guidance.",
    "opinion.options.specialist.price": "$19,000 CLP",
    
    "opinion.cta.headline": "Ready for a second look?",
    "opinion.cta.subline": "Complete the form with details of your case and receive an objective analysis of your options.",
    "opinion.cta.button": "Request second opinion",

    // Second Opinion Wizard Steps
    "opinion.step1.caption": "We guide you step by step",
    "opinion.step1.headline": "Your contact details",
    
    "opinion.step2.caption": "We guide you step by step",
    "opinion.step2.headline": "Tell us your situation",
    "opinion.step2.reason": "Why are you seeking a second opinion?",
    "opinion.step2.reasonPlaceholder": "Briefly describe your dental situation and what concerns you...",
    "opinion.step2.diagnosis": "Diagnosis you received (optional)",
    "opinion.step2.diagnosisPlaceholder": "Describe the diagnosis or proposed treatment...",
    "opinion.step2.clinicName": "Original clinic",
    "opinion.step2.budgetAmount": "Quote amount (CLP)",
    
    "opinion.step3.caption": "We guide you step by step",
    "opinion.step3.headline": "How would you like to receive your analysis?",
    "opinion.step3.iaOnly.title": "Initial Analysis Only",
    "opinion.step3.iaOnly.desc": "Report with findings, comparisons and recommendations based on your case.",
    "opinion.step3.iaOnly.price": "Free",
    "opinion.step3.specialist.title": "Analysis + Video Call",
    "opinion.step3.specialist.desc": "Report plus 20 minutes with a specialist to resolve questions and receive guidance.",
    "opinion.step3.specialist.price": "$19,000 CLP",
    
    "opinion.step4.headline": "Analyzing your case...",
    "opinion.step4.message": "We're processing the information to generate your personalized report.",
    
    "opinion.step5.caption": "Your Report",
    "opinion.step5.headline": "Second Opinion Analysis",
    "opinion.step5.findings": "Key Findings",
    "opinion.step5.recommendations": "Recommendations",
    "opinion.step5.savings": "Estimated potential savings",
    "opinion.step5.ctaSpecialist": "Schedule video call with specialist",
    "opinion.step5.ctaPremium": "Schedule In-Person Evaluation",
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
