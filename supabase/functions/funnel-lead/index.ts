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

async function syncToDentalink(lead: LeadRequest): Promise<string | null> {
  const apiKey = Deno.env.get('DENTALINK_API_KEY');
  
  if (!apiKey) {
    console.log('[Funnel Lead] DENTALINK_API_KEY not configured, skipping sync');
    return null;
  }

  try {
    // Create or update patient in Dentalink
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
      console.error(`[Funnel Lead] Dentalink error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`[Funnel Lead] Dentalink patient created/updated: ${data.id}`);
    return data.id?.toString() || null;
  } catch (error) {
    console.error('[Funnel Lead] Dentalink sync failed:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
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

    // Sync to Dentalink first
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

    console.log(`[Funnel Lead] Lead created: ${lead.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          lead_id: lead.id,
          status: lead.status,
          dentalink_synced: !!dentalinkPatientId,
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
