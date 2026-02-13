import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DENTALINK_API_URL = "https://api.dentalink.healthatom.com/api/v1";

interface CreatePatientRequest {
  lead_id: string;
}

function normalizeRut(rut: string): string {
  const cleaned = rut.replace(/[.\s-]/g, '').toUpperCase();
  if (cleaned.length < 2) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return `${body}-${dv}`;
}

async function dentalinkRequest(endpoint: string, method: string, body?: object) {
  const apiKey = Deno.env.get('DENTALINK_API_KEY');
  if (!apiKey) throw new Error('DENTALINK_API_KEY not configured');

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${DENTALINK_API_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Dentalink] ${method} ${endpoint} Error: ${response.status} - ${errorText}`);
    throw new Error(`Dentalink API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Busca paciente en Dentalink por RUT
 */
async function findPatientByRut(rut: string) {
  try {
    const result = await dentalinkRequest(`/pacientes?q=${encodeURIComponent(rut)}`, 'GET');
    const patients = result?.data || result?.results || [];
    if (Array.isArray(patients) && patients.length > 0) {
      const patient = patients[0];
      return { id: String(patient.id_paciente || patient.id), data: patient };
    }
    return null;
  } catch (e) {
    console.error('[Dentalink Create] Search error:', e);
    return null;
  }
}

/**
 * Crea paciente en Dentalink
 */
async function createPatientInDentalink(data: {
  nombre: string;
  apellidos: string;
  rut: string;
  email: string;
  telefono?: string;
}) {
  const payload = {
    nombre: data.nombre,
    apellidos: data.apellidos,
    rut: data.rut,
    email: data.email,
    fono: data.telefono || '',
  };

  console.log('[Dentalink Create] Creating patient:', JSON.stringify(payload));
  const result = await dentalinkRequest('/pacientes', 'POST', payload);
  const patientId = String(result?.data?.id_paciente || result?.data?.id || result?.id_paciente || result?.id);
  console.log('[Dentalink Create] Patient created with ID:', patientId);
  return { id: patientId, data: result?.data || result };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: CreatePatientRequest = await req.json();
    console.log('[Dentalink Create] Request for lead:', body.lead_id);

    if (!body.lead_id) {
      return new Response(
        JSON.stringify({ error: 'Missing lead_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lead data
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .select('*')
      .eq('id', body.lead_id)
      .maybeSingle();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check payment status
    if (lead.status !== 'PAID' && lead.status !== 'SCHEDULED') {
      return new Response(
        JSON.stringify({ error: 'Payment not completed. Current status: ' + lead.status }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rut = lead.rut ? normalizeRut(lead.rut) : null;

    // If lead already has dentalink_patient_id, return it
    if (lead.dentalink_patient_id) {
      console.log('[Dentalink Create] Lead already linked:', lead.dentalink_patient_id);
      return new Response(
        JSON.stringify({ success: true, data: { dentalink_patient_id: lead.dentalink_patient_id, already_existed: true } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search existing patient by RUT first
    let dentalinkPatientId: string | null = null;

    if (rut) {
      const existing = await findPatientByRut(rut);
      if (existing) {
        dentalinkPatientId = existing.id;
        console.log('[Dentalink Create] Found existing patient by RUT:', dentalinkPatientId);
      }
    }

    // If not found, create new patient in Dentalink
    if (!dentalinkPatientId) {
      const nameParts = lead.name.trim().split(' ');
      const nombre = nameParts[0] || lead.name;
      const apellidos = nameParts.slice(1).join(' ') || lead.name;

      const created = await createPatientInDentalink({
        nombre,
        apellidos,
        rut: rut || '',
        email: lead.email,
        telefono: lead.phone,
      });

      dentalinkPatientId = created.id;
    }

    // Update lead with dentalink_patient_id
    await supabase
      .from('funnel_leads')
      .update({ dentalink_patient_id: dentalinkPatientId })
      .eq('id', lead.id);

    // Also update profile if exists (by email or RUT)
    if (rut) {
      await supabase
        .from('profiles')
        .update({ dentalink_patient_id: dentalinkPatientId })
        .eq('rut', rut);
    } else {
      await supabase
        .from('profiles')
        .update({ dentalink_patient_id: dentalinkPatientId })
        .eq('email', lead.email);
    }

    // Create auth user + profile if not exists (for portal access)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', lead.email)
      .maybeSingle();

    if (!existingProfile) {
      console.log('[Dentalink Create] Creating auth user for:', lead.email);
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: lead.email,
        email_confirm: false,
        user_metadata: {
          full_name: lead.name,
          rut: rut,
          phone: lead.phone,
        },
      });

      if (!authError && authData.user) {
        await supabase
          .from('profiles')
          .update({
            full_name: lead.name,
            rut: rut,
            phone: lead.phone,
            dentalink_patient_id: dentalinkPatientId,
          })
          .eq('user_id', authData.user.id);
      }
    }

    console.log(`[Dentalink Create] Success: lead=${lead.id}, dentalink=${dentalinkPatientId}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          dentalink_patient_id: dentalinkPatientId,
          lead_id: lead.id,
          already_existed: false,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Dentalink Create] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
