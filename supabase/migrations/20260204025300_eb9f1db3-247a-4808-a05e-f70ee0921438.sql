-- Profiles para pacientes (extiende auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL, -- referencia a auth.users
  -- Datos personales
  rut TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  -- Dirección
  address TEXT,
  city TEXT,
  region TEXT,
  -- IDs externos
  dentalink_patient_id TEXT,
  -- Estado
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de consentimientos
CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  -- Tipo de consentimiento
  consent_type TEXT NOT NULL, -- 'ia_disclaimer', 'data_usage', 'image_usage', 'marketing', 'terms'
  version TEXT NOT NULL DEFAULT '1.0',
  -- Estado
  accepted BOOLEAN NOT NULL,
  accepted_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  -- Texto del consentimiento
  consent_text TEXT,
  -- Digital signature (si aplica)
  signature_data TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Constraint
  CONSTRAINT has_user CHECK (profile_id IS NOT NULL OR lead_id IS NOT NULL)
);

-- Tabla de segunda opinión
CREATE TABLE public.second_opinions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Paciente
  profile_id UUID REFERENCES public.profiles(id),
  lead_id UUID REFERENCES public.funnel_leads(id),
  -- Datos de contacto
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  -- Motivo
  reason TEXT NOT NULL,
  current_diagnosis TEXT,
  external_budget_amount INTEGER, -- presupuesto externo en CLP
  external_clinic_name TEXT,
  -- Archivos
  has_rx BOOLEAN DEFAULT false,
  rx_storage_paths TEXT[] DEFAULT '{}',
  budget_document_path TEXT,
  -- Flujo elegido
  flow_type TEXT NOT NULL DEFAULT 'ia_only', -- 'ia_only', 'ia_plus_specialist'
  -- Resultado IA
  ia_report JSONB,
  ia_completed_at TIMESTAMPTZ,
  -- Videollamada (si aplica)
  specialist_id TEXT,
  videocall_scheduled_at TIMESTAMPTZ,
  videocall_url TEXT,
  videocall_completed BOOLEAN DEFAULT false,
  -- Pago (si aplica especialista)
  payment_id UUID,
  payment_status TEXT,
  -- Estado general
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'ia_processing', 'ia_done', 'specialist_pending', 'specialist_done', 'converted'
  converted_to_evaluation BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de métricas/eventos
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Contexto
  profile_id UUID REFERENCES public.profiles(id),
  lead_id UUID REFERENCES public.funnel_leads(id),
  session_id TEXT,
  -- Evento
  event_type TEXT NOT NULL, -- 'page_view', 'funnel_start', 'ia_scan', 'checkout_start', 'payment_success', 'appointment_booked', etc.
  event_category TEXT, -- 'funnel', 'payment', 'scheduling', 'second_opinion'
  event_data JSONB DEFAULT '{}',
  -- Atribución
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de notificaciones enviadas
CREATE TABLE public.notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Destinatario
  profile_id UUID REFERENCES public.profiles(id),
  lead_id UUID REFERENCES public.funnel_leads(id),
  -- Canal
  channel TEXT NOT NULL, -- 'whatsapp', 'email', 'sms'
  -- Contenido
  template_name TEXT,
  recipient_phone TEXT,
  recipient_email TEXT,
  message_content TEXT,
  -- Estado
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  external_message_id TEXT, -- ID de WhatsApp/email provider
  error_message TEXT,
  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_profiles_rut ON public.profiles(rut);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_consents_profile ON public.consents(profile_id);
CREATE INDEX idx_second_opinions_status ON public.second_opinions(status);
CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX idx_notifications_log_lead ON public.notifications_log(lead_id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.second_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

-- Policies para profiles (usuarios autenticados pueden ver su propio perfil)
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Service can manage profiles"
ON public.profiles FOR ALL
USING (true) WITH CHECK (true);

-- Policies para consents
CREATE POLICY "Service can manage consents"
ON public.consents FOR ALL
USING (true) WITH CHECK (true);

-- Policies para second_opinions
CREATE POLICY "Service can manage second_opinions"
ON public.second_opinions FOR ALL
USING (true) WITH CHECK (true);

-- Policies para analytics
CREATE POLICY "Service can manage analytics"
ON public.analytics_events FOR ALL
USING (true) WITH CHECK (true);

-- Policies para notifications
CREATE POLICY "Service can manage notifications"
ON public.notifications_log FOR ALL
USING (true) WITH CHECK (true);

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_second_opinions_updated_at
BEFORE UPDATE ON public.second_opinions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil automáticamente cuando se crea usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para crear perfil en signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();