-- Tipos de cita con configuración de agenda
CREATE TABLE public.appointment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- 'evaluation_premium', 'implant_consult', 'ortho_control', etc.
  name TEXT NOT NULL,
  description TEXT,
  -- Duración y configuración
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  buffer_before_minutes INTEGER NOT NULL DEFAULT 0, -- tiempo buffer antes
  buffer_after_minutes INTEGER NOT NULL DEFAULT 15, -- tiempo buffer después
  -- Restricciones
  requires_professional_ids TEXT[], -- IDs de Dentalink de profesionales habilitados
  max_per_day INTEGER, -- máximo de este tipo por día
  min_hours_advance INTEGER NOT NULL DEFAULT 24, -- mínimo de horas de anticipación
  max_days_advance INTEGER NOT NULL DEFAULT 60, -- máximo días en el futuro
  -- Precio (si aplica)
  price_clp INTEGER,
  -- Estado
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Preferencias de horario del paciente
CREATE TABLE public.patient_scheduling_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  user_id UUID, -- para pacientes registrados
  -- Preferencias
  preferred_days TEXT[] DEFAULT '{}', -- ['monday', 'tuesday', ...]
  preferred_time_range TEXT DEFAULT 'any', -- 'morning', 'afternoon', 'evening', 'any'
  avoid_dates DATE[] DEFAULT '{}',
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Constraint: debe tener lead_id o user_id
  CONSTRAINT has_patient CHECK (lead_id IS NOT NULL OR user_id IS NOT NULL)
);

-- Citas reservadas (mirror de Dentalink para tracking)
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Referencias
  lead_id UUID REFERENCES public.funnel_leads(id) ON DELETE SET NULL,
  user_id UUID,
  appointment_type_id UUID REFERENCES public.appointment_types(id),
  -- Dentalink IDs
  dentalink_appointment_id TEXT,
  dentalink_patient_id TEXT,
  dentalink_professional_id TEXT,
  -- Detalles
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  -- Estado
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
  confirmation_sent BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lista de espera dinámica
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  user_id UUID,
  appointment_type_id UUID REFERENCES public.appointment_types(id),
  -- Preferencias
  preferred_dates DATE[] NOT NULL,
  preferred_time_range TEXT DEFAULT 'any',
  max_wait_days INTEGER DEFAULT 14,
  -- Estado
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'offered', 'booked', 'expired'
  offered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_appointments_date ON public.appointments(scheduled_date);
CREATE INDEX idx_appointments_lead ON public.appointments(lead_id);
CREATE INDEX idx_appointments_dentalink ON public.appointments(dentalink_appointment_id);
CREATE INDEX idx_waitlist_status ON public.waitlist(status);
CREATE INDEX idx_appointment_types_code ON public.appointment_types(code);

-- Enable RLS
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_scheduling_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies (gestionado por edge functions con service role)
CREATE POLICY "Service can manage appointment_types"
ON public.appointment_types FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service can manage scheduling_preferences"
ON public.patient_scheduling_preferences FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service can manage appointments"
ON public.appointments FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service can manage waitlist"
ON public.waitlist FOR ALL USING (true) WITH CHECK (true);

-- Triggers para updated_at
CREATE TRIGGER update_appointment_types_updated_at
BEFORE UPDATE ON public.appointment_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduling_prefs_updated_at
BEFORE UPDATE ON public.patient_scheduling_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar tipos de cita base
INSERT INTO public.appointment_types (code, name, description, duration_minutes, buffer_before_minutes, buffer_after_minutes, price_clp, min_hours_advance, max_days_advance) VALUES
('evaluation_premium', 'Evaluación Presencial Premium', 'Diagnóstico con IA en vivo, visualización de alternativas y plan personalizado', 90, 15, 15, 49000, 24, 60),
('implant_consult', 'Consulta Implantes', 'Evaluación para tratamiento de implantes dentales', 60, 10, 10, NULL, 48, 30),
('ortho_control', 'Control Ortodoncia', 'Control mensual de tratamiento ortodóncico', 30, 5, 5, NULL, 12, 90),
('rms_control', 'Control RMS', 'Control de retratamiento endodóntico', 45, 10, 10, NULL, 24, 60),
('emergency', 'Urgencia Dental', 'Atención de urgencia por dolor o trauma', 30, 0, 10, NULL, 1, 7),
('cleaning', 'Limpieza Dental', 'Profilaxis y detartraje', 45, 5, 5, NULL, 24, 30);