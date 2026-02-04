import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DENTALINK_API_URL = "https://api.dentalink.healthatom.com/api/v1";

interface RegionalIntakeRequest {
  name: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  timezone?: string;
  has_rx: boolean;
  preferred_contact: 'whatsapp' | 'email' | 'videocall';
  travel_flexibility?: 'flexible' | 'specific_dates' | 'remote_only';
  notes?: string;
}

async function syncToDentalink(data: RegionalIntakeRequest): Promise<string | null> {
  const apiKey = Deno.env.get('DENTALINK_API_KEY');
  
  if (!apiKey) {
    console.log('[Regional Intake] DENTALINK_API_KEY not configured, skipping sync');
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
        nombre: data.name.split(' ')[0],
        apellido: data.name.split(' ').slice(1).join(' ') || '-',
        email: data.email,
        telefono: data.phone,
        notas: `[REGIONAL] País: ${data.country}${data.city ? `, Ciudad: ${data.city}` : ''}. ${data.notes || ''}`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Regional Intake] Dentalink error: ${response.status} - ${errorText}`);
      return null;
    }

    const responseData = await response.json();
    console.log(`[Regional Intake] Dentalink patient created: ${responseData.id}`);
    return responseData.id?.toString() || null;
  } catch (error) {
    console.error('[Regional Intake] Dentalink sync failed:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RegionalIntakeRequest = await req.json();
    console.log('[Regional Intake] Creating regional lead:', { email: body.email, country: body.country });

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.country) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, email, phone, country' }),
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

    // Validate phone (international format - more flexible)
    const phoneClean = body.phone.replace(/\D/g, '');
    if (phoneClean.length < 7 || phoneClean.length > 15) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Sync to Dentalink
    const dentalinkPatientId = await syncToDentalink(body);

    // Create lead with regional origin
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .insert({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: phoneClean,
        origin: body.country === 'Chile' ? 'regional' : 'international',
        reason: `[${body.country}${body.city ? ` - ${body.city}` : ''}] ${body.notes || 'Preevaluación IA gratuita'}`,
        dentalink_patient_id: dentalinkPatientId,
        status: 'LEAD',
        scheduling_preferences: {
          country: body.country,
          city: body.city,
          timezone: body.timezone,
          has_rx: body.has_rx,
          preferred_contact: body.preferred_contact,
          travel_flexibility: body.travel_flexibility || 'flexible',
          is_regional: true,
        },
      })
      .select()
      .single();

    if (leadError) {
      console.error('[Regional Intake] Database error:', leadError);
      return new Response(
        JSON.stringify({ error: 'Failed to create lead' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Regional Intake] Lead created: ${lead.id}, hasRx: ${body.has_rx}`);

    // Track analytics event
    await supabase.from('analytics_events').insert({
      event_type: 'regional_intake_created',
      event_category: 'funnel',
      lead_id: lead.id,
      event_data: {
        country: body.country,
        city: body.city,
        has_rx: body.has_rx,
        preferred_contact: body.preferred_contact,
        travel_flexibility: body.travel_flexibility,
      },
    });

    // Determine next step based on RX availability
    const nextStep = body.has_rx 
      ? 'upload_rx' // Proceed to upload RX for IA analysis
      : 'schedule_mini_call'; // Schedule mini-call for RX instructions

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          lead_id: lead.id,
          status: lead.status,
          has_rx: body.has_rx,
          next_step: nextStep,
          next_step_url: body.has_rx 
            ? `/evaluation/regional/upload?lead=${lead.id}`
            : `/evaluation/regional/mini-call?lead=${lead.id}`,
          dentalink_synced: !!dentalinkPatientId,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Regional Intake] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
