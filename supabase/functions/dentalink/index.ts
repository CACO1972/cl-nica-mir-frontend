import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DENTALINK_API_URL = "https://api.dentalink.healthatom.com/api/v1";

interface AppointmentRequest {
  action: 'list_appointments' | 'create_appointment' | 'get_patient' | 'list_patients' | 'get_available_slots';
  date?: string;
  patient_id?: string;
  professional_id?: string;
  service_id?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
}

async function dentalinkRequest(endpoint: string, method: string = 'GET', body?: object) {
  const apiKey = Deno.env.get('DENTALINK_API_KEY');
  
  if (!apiKey) {
    throw new Error('DENTALINK_API_KEY not configured');
  }

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  console.log(`[Dentalink] ${method} ${endpoint}`);
  
  const response = await fetch(`${DENTALINK_API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Dentalink] Error: ${response.status} - ${errorText}`);
    throw new Error(`Dentalink API error: ${response.status}`);
  }

  return response.json();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[Dentalink] No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[Dentalink] Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Dentalink] Authenticated user: ${user.id}`);

    const body: AppointmentRequest = await req.json();
    console.log(`[Dentalink] Action: ${body.action}`);

    let result;

    switch (body.action) {
      case 'list_appointments': {
        const dateFilter = body.date ? `?fecha=${body.date}` : '';
        result = await dentalinkRequest(`/citas${dateFilter}`);
        break;
      }

      case 'create_appointment': {
        if (!body.patient_id || !body.professional_id || !body.start_time) {
          throw new Error('Missing required fields: patient_id, professional_id, start_time');
        }
        result = await dentalinkRequest('/citas', 'POST', {
          id_paciente: body.patient_id,
          id_profesional: body.professional_id,
          id_servicio: body.service_id,
          fecha_hora: body.start_time,
          fecha_hora_termino: body.end_time,
          notas: body.notes || '',
        });
        break;
      }

      case 'get_patient': {
        if (!body.patient_id) {
          throw new Error('Missing required field: patient_id');
        }
        result = await dentalinkRequest(`/pacientes/${body.patient_id}`);
        break;
      }

      case 'list_patients': {
        result = await dentalinkRequest('/pacientes');
        break;
      }

      case 'get_available_slots': {
        if (!body.professional_id || !body.date) {
          throw new Error('Missing required fields: professional_id, date');
        }
        result = await dentalinkRequest(`/agenda/disponibilidad?id_profesional=${body.professional_id}&fecha=${body.date}`);
        break;
      }

      default:
        throw new Error(`Unknown action: ${body.action}`);
    }

    console.log(`[Dentalink] Success`);
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Dentalink] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
