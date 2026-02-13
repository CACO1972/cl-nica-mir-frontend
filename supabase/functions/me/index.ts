import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DENTALINK_API_URL = "https://api.dentalink.healthatom.com/api/v1";

interface ProfileResponse {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  rut: string | null;
  dentalink_patient_id: string | null;
  created_at: string;
  appointments: Array<{
    id: string;
    date: string;
    time: string;
    type_name: string;
    status: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  }>;
  funnel_history: Array<{
    id: string;
    status: string;
    created_at: string;
    ia_scan_result: object | null;
  }>;
  dentalink_patient: object | null;
}

/**
 * Normaliza RUT al formato sin puntos y con guión: 12345678-9
 */
function normalizeRut(rut: string): string {
  // Remove dots, spaces, dashes
  const cleaned = rut.replace(/[.\s-]/g, '').toUpperCase();
  if (cleaned.length < 2) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return `${body}-${dv}`;
}

async function dentalinkRequest(endpoint: string) {
  const apiKey = Deno.env.get('DENTALINK_API_KEY');
  if (!apiKey) throw new Error('DENTALINK_API_KEY not configured');

  const response = await fetch(`${DENTALINK_API_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Dentalink] Error: ${response.status} - ${errorText}`);
    throw new Error(`Dentalink API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Busca paciente en Dentalink por RUT normalizado
 */
async function findDentalinkPatientByRut(rut: string): Promise<{ id: string; data: object } | null> {
  try {
    const normalizedRut = normalizeRut(rut);
    console.log(`[Me] Searching Dentalink patient by RUT: ${normalizedRut}`);

    const result = await dentalinkRequest(`/pacientes?q=${encodeURIComponent(normalizedRut)}`);

    const patients = result?.data || result?.results || [];
    if (Array.isArray(patients) && patients.length > 0) {
      const patient = patients[0];
      const patientId = String(patient.id_paciente || patient.id);
      console.log(`[Me] Found Dentalink patient: ${patientId}`);
      return { id: patientId, data: patient };
    }

    console.log(`[Me] No Dentalink patient found for RUT: ${normalizedRut}`);
    return null;
  } catch (error) {
    console.error(`[Me] Dentalink lookup error:`, error instanceof Error ? error.message : error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[Me] Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Me] Fetching data for user: ${user.id}`);

    // Obtiene el perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[Me] Profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Si tiene RUT pero no dentalink_patient_id, buscar y vincular
    let dentalinkPatient: object | null = null;

    if (profile.rut && !profile.dentalink_patient_id) {
      const found = await findDentalinkPatientByRut(profile.rut);
      if (found) {
        // Vincula el paciente en el perfil
        await supabase
          .from('profiles')
          .update({ dentalink_patient_id: found.id })
          .eq('id', profile.id);

        profile.dentalink_patient_id = found.id;
        dentalinkPatient = found.data;
        console.log(`[Me] Linked Dentalink patient ${found.id} to profile ${profile.id}`);
      }
    } else if (profile.dentalink_patient_id) {
      // Ya vinculado, traer datos actualizados
      try {
        const result = await dentalinkRequest(`/pacientes/${profile.dentalink_patient_id}`);
        dentalinkPatient = result?.data || result;
      } catch (e) {
        console.error('[Me] Error fetching linked Dentalink patient:', e);
      }
    }

    // Obtiene citas
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_date,
        scheduled_time,
        status,
        appointment_types (name)
      `)
      .or(`lead_id.in.(select id from funnel_leads where email = '${profile.email}'),user_id.eq.${user.id}`)
      .order('scheduled_date', { ascending: false })
      .limit(10);

    // Obtiene historial de funnel por email
    const { data: funnelHistory } = await supabase
      .from('funnel_leads')
      .select('id, status, created_at, ia_scan_result')
      .eq('email', profile.email)
      .order('created_at', { ascending: false })
      .limit(5);

    // Obtiene pagos
    const { data: payments } = await supabase
      .from('funnel_payments')
      .select('id, amount, currency, status, created_at, lead_id')
      .in('lead_id', (funnelHistory || []).map(f => f.id))
      .order('created_at', { ascending: false })
      .limit(10);

    const response: ProfileResponse = {
      id: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      rut: profile.rut,
      dentalink_patient_id: profile.dentalink_patient_id,
      created_at: profile.created_at,
      appointments: (appointments || []).map(apt => {
        const typeName = Array.isArray(apt.appointment_types) 
          ? apt.appointment_types[0]?.name 
          : (apt.appointment_types as unknown as { name: string } | null)?.name;
        return {
          id: apt.id,
          date: apt.scheduled_date,
          time: apt.scheduled_time,
          type_name: typeName || 'Cita',
          status: apt.status,
        };
      }),
      payments: (payments || []).map(pay => ({
        id: pay.id,
        amount: pay.amount,
        currency: pay.currency,
        status: pay.status,
        created_at: pay.created_at,
      })),
      funnel_history: (funnelHistory || []).map(f => ({
        id: f.id,
        status: f.status,
        created_at: f.created_at,
        ia_scan_result: f.ia_scan_result,
      })),
      dentalink_patient: dentalinkPatient,
    };

    console.log(`[Me] Response ready for ${profile.email} (dentalink: ${profile.dentalink_patient_id || 'not linked'})`);

    return new Response(
      JSON.stringify({ success: true, data: response }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Me] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
