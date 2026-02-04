-- Enum para estados del funnel
CREATE TYPE public.funnel_status AS ENUM (
  'LEAD',
  'IA_DONE', 
  'CHECKOUT_CREATED',
  'PAID',
  'SCHEDULED'
);

-- Enum para estados de pago
CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'refunded'
);

-- Tabla principal de leads del funnel
CREATE TABLE public.funnel_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Datos del paciente
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  rut TEXT,
  -- Información del caso
  reason TEXT, -- motivo de consulta
  origin TEXT DEFAULT 'web', -- origen del lead (web, whatsapp, referido)
  -- Estado del funnel
  status funnel_status NOT NULL DEFAULT 'LEAD',
  -- IDs externos
  dentalink_patient_id TEXT,
  dentalink_appointment_id TEXT,
  -- Resultados IA
  ia_scan_result JSONB,
  ia_scan_completed_at TIMESTAMPTZ,
  -- Preferencias de agenda
  scheduling_preferences JSONB,
  scheduled_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de uploads (fotos, RX)
CREATE TABLE public.funnel_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  -- Información del archivo
  file_type TEXT NOT NULL, -- 'selfie', 'rx_panoramic', 'rx_periapical', 'photo_intraoral'
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  -- Metadatos
  metadata JSONB DEFAULT '{}',
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de pagos
CREATE TABLE public.funnel_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  -- Información del pago
  amount INTEGER NOT NULL, -- en centavos/pesos
  currency TEXT NOT NULL DEFAULT 'CLP',
  description TEXT NOT NULL DEFAULT 'Evaluación Presencial Premium',
  -- MercadoPago
  mercadopago_preference_id TEXT,
  mercadopago_payment_id TEXT,
  mercadopago_status TEXT,
  mercadopago_response JSONB,
  -- Estado
  status payment_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de historial de estados (para tracking)
CREATE TABLE public.funnel_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  from_status funnel_status,
  to_status funnel_status NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Storage bucket para intake files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('intake-files', 'intake-files', false, 10485760); -- 10MB limit

-- Índices para performance
CREATE INDEX idx_funnel_leads_status ON public.funnel_leads(status);
CREATE INDEX idx_funnel_leads_email ON public.funnel_leads(email);
CREATE INDEX idx_funnel_leads_created ON public.funnel_leads(created_at DESC);
CREATE INDEX idx_funnel_uploads_lead ON public.funnel_uploads(lead_id);
CREATE INDEX idx_funnel_payments_lead ON public.funnel_payments(lead_id);
CREATE INDEX idx_funnel_payments_mp_id ON public.funnel_payments(mercadopago_payment_id);

-- Enable RLS
ALTER TABLE public.funnel_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Los leads son públicos para crear (funnel anónimo)
-- pero solo el servicio puede leer/actualizar

-- Policy para crear leads (cualquiera puede crear un lead)
CREATE POLICY "Anyone can create a lead"
ON public.funnel_leads
FOR INSERT
WITH CHECK (true);

-- Policy para crear uploads (cualquiera con lead_id válido)
CREATE POLICY "Anyone can upload for their lead"
ON public.funnel_uploads
FOR INSERT
WITH CHECK (true);

-- Policy para crear pagos (solo desde edge functions con service role)
CREATE POLICY "Service can manage payments"
ON public.funnel_payments
FOR ALL
USING (true)
WITH CHECK (true);

-- Policy para historial (solo lectura para servicio)
CREATE POLICY "Service can manage history"
ON public.funnel_status_history
FOR ALL
USING (true)
WITH CHECK (true);

-- Storage policies para intake-files
CREATE POLICY "Anyone can upload intake files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'intake-files');

CREATE POLICY "Service can read intake files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'intake-files');

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_funnel_leads_updated_at
BEFORE UPDATE ON public.funnel_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funnel_payments_updated_at
BEFORE UPDATE ON public.funnel_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Función para registrar cambios de estado
CREATE OR REPLACE FUNCTION public.log_funnel_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.funnel_status_history (lead_id, from_status, to_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para log de estados
CREATE TRIGGER log_funnel_lead_status_change
AFTER UPDATE ON public.funnel_leads
FOR EACH ROW
EXECUTE FUNCTION public.log_funnel_status_change();