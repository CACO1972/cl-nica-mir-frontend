import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DENTALINK_API_URL = "https://api.dentalink.healthatom.com/api/v1";

interface LeadRequest {
  name: string;
  email: string;
  phone: string;
  rut?: string;
  reason?: string;
  origin?: string;
}

/**
 * Search for existing patient in Dentalink by email or RUT
 */
async function findExistingDentalinkPatient(email: string, rut?: string): Promise<string | null> {
  const apiKey = Deno.env.get('DENTALINK_API_KEY');
  if (!apiKey) {
    console.log('[Funnel Lead] DENTALINK_API_KEY not configured, skipping search');
    return null;
  }

  try {
    // Search by email first
    const emailResponse = await fetch(`${DENTALINK_API_URL}/pacientes?q=${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (emailResponse.ok) {
      const data = await emailResponse.json();
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        const patientId = data.data[0].id?.toString();
        console.log(`[Funnel Lead] Found existing Dentalink patient by email: ${patientId}`);
        return patientId;
      }
    }

    // If not found by email and RUT is provided, search by RUT
    if (rut) {
      const rutResponse = await fetch(`${DENTALINK_API_URL}/pacientes?q=${encodeURIComponent(rut)}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (rutResponse.ok) {
        const data = await rutResponse.json();
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          const patientId = data.data[0].id?.toString();
          console.log(`[Funnel Lead] Found existing Dentalink patient by RUT: ${patientId}`);
          return patientId;
        }
      }
    }

    console.log('[Funnel Lead] No existing Dentalink patient found');
    return null;
  } catch (error) {
    console.error('[Funnel Lead] Dentalink search failed:', error);
    return null;
  }
}

/**
 * Create a new patient in Dentalink
 */
async function createDentalinkPatient(lead: LeadRequest): Promise<string | null> {
  const apiKey = Deno.env.get('DENTALINK_API_KEY');
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(`${DENTALINK_API_URL}/pacientes`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: lead.name.split(' ')[0],
        apellido: lead.name.split(' ').slice(1).join(' ') || '-',
        email: lead.email,
        telefono: lead.phone,
        rut: lead.rut || null,
        notas: lead.reason || '',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Funnel Lead] Dentalink create error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`[Funnel Lead] Dentalink patient created: ${data.id}`);
    return data.id?.toString() || null;
  } catch (error) {
    console.error('[Funnel Lead] Dentalink create failed:', error);
    return null;
  }
}

/**
 * Sync lead to Dentalink: first search for existing patient, then create if not found
 */
async function syncToDentalink(lead: LeadRequest): Promise<string | null> {
  // 1. Search for existing patient
  const existingId = await findExistingDentalinkPatient(lead.email, lead.rut);
  if (existingId) {
    return existingId;
  }

  // 2. Create new patient if not found
  return await createDentalinkPatient(lead);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: LeadRequest = await req.json();
    console.log('[Funnel Lead] Creating lead:', { email: body.email, origin: body.origin });

    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, phone' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone (Chilean format)
    const phoneClean = body.phone.replace(/\D/g, '');
    if (phoneClean.length < 8 || phoneClean.length > 12) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Sync to Dentalink (search existing first, then create if needed)
    const dentalinkPatientId = await syncToDentalink(body);

    // Create lead in Supabase
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .insert({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: phoneClean,
        rut: body.rut?.trim() || null,
        reason: body.reason?.trim() || null,
        origin: body.origin || 'web',
        dentalink_patient_id: dentalinkPatientId,
        status: 'LEAD',
      })
      .select()
      .single();

    if (leadError) {
      console.error('[Funnel Lead] Database error:', leadError);
      return new Response(
        JSON.stringify({ error: 'Failed to create lead' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Funnel Lead] Lead created: ${lead.id}, dentalink: ${dentalinkPatientId || 'none'}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          lead_id: lead.id,
          status: lead.status,
          dentalink_synced: !!dentalinkPatientId,
          dentalink_patient_id: dentalinkPatientId,
          is_existing_patient: !!(dentalinkPatientId && await findExistingDentalinkPatient(body.email, body.rut)),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Funnel Lead] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
