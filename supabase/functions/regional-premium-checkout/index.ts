import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FLOW_API_URL = "https://www.flow.cl/api";

interface RegionalCheckoutRequest {
  lead_id: string;
  evaluation_type: 'online' | 'presencial';
  travel_dates?: {
    arrival: string;
    departure: string;
  };
  timezone?: string;
}

const PRICING = {
  online: {
    amount: 35000,
    description: 'Evaluación Premium Online - Videollamada con Especialista',
  },
  presencial: {
    amount: 49000,
    description: 'Evaluación Presencial Premium - 100% abonable a tratamiento',
  },
};

async function flowSignAsync(params: Record<string, string>, secretKey: string): Promise<string> {
  const keys = Object.keys(params).sort();
  let toSign = "";
  for (const key of keys) {
    toSign += key + params[key];
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(toSign));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function createFlowPayment(
  lead: { id: string; name: string; email: string },
  evaluationType: 'online' | 'presencial',
  baseUrl: string
): Promise<{ url: string; token: string; flowOrder: number } | null> {
  const apiKey = Deno.env.get('FLOW_API_KEY');
  const secretKey = Deno.env.get('FLOW_SECRET_KEY');

  if (!apiKey || !secretKey) {
    console.log('[Regional Checkout] FLOW_API_KEY or FLOW_SECRET_KEY not configured');
    return null;
  }

  const pricing = PRICING[evaluationType];
  const shortId = lead.id.replace(/-/g, '').substring(0, 10);
  const prefix = evaluationType === 'online' ? 'ro' : 'rp';
  const commerceOrder = `${prefix}_${shortId}_${Date.now()}`;

  const params: Record<string, string> = {
    apiKey,
    commerceOrder,
    subject: pricing.description,
    amount: String(pricing.amount),
    email: lead.email,
    currency: 'CLP',
    urlReturn: `${baseUrl.replace('.supabase.co', '.lovable.app')}/evaluation/regional/success?lead=${lead.id}&type=${evaluationType}`,
    urlConfirmation: `${baseUrl}/functions/v1/funnel-checkout`,
  };

  const signature = await flowSignAsync(params, secretKey);
  params.s = signature;

  const formBody = new URLSearchParams(params).toString();

  try {
    const response = await fetch(`${FLOW_API_URL}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Regional Checkout] Flow error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`[Regional Checkout] Flow order created: ${data.flowOrder}`);
    return data;
  } catch (error) {
    console.error('[Regional Checkout] Flow failed:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RegionalCheckoutRequest = await req.json();
    console.log('[Regional Checkout] Creating checkout:', { lead_id: body.lead_id, type: body.evaluation_type });

    if (!body.lead_id || !body.evaluation_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: lead_id, evaluation_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['online', 'presencial'].includes(body.evaluation_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid evaluation_type. Must be "online" or "presencial"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.lead_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid lead_id format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lead
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .select('id, name, email, phone, status, scheduling_preferences')
      .eq('id', body.lead_id)
      .single();

    if (leadError || !lead) {
      console.error('[Regional Checkout] Lead not found:', body.lead_id);
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const preferences = lead.scheduling_preferences as Record<string, unknown> | null;
    if (!preferences?.is_regional) {
      return new Response(
        JSON.stringify({ error: 'This endpoint is only for regional/international leads' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pricing = PRICING[body.evaluation_type];

    // Create Flow payment
    const flowResult = await createFlowPayment(lead, body.evaluation_type, supabaseUrl);

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('funnel_payments')
      .insert({
        lead_id: lead.id,
        amount: pricing.amount,
        description: pricing.description,
        status: 'pending',
        mercadopago_preference_id: flowResult ? String(flowResult.flowOrder) : null,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('[Regional Checkout] Failed to create payment:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update lead status
    const updateData: Record<string, unknown> = { status: 'CHECKOUT_CREATED' };
    if (body.travel_dates || body.timezone) {
      updateData.scheduling_preferences = {
        ...preferences,
        travel_dates: body.travel_dates,
        timezone: body.timezone || (preferences as Record<string, unknown>).timezone,
        evaluation_type: body.evaluation_type,
      };
    }

    await supabase.from('funnel_leads').update(updateData).eq('id', body.lead_id);

    // Track analytics
    await supabase.from('analytics_events').insert({
      event_type: 'regional_checkout_created',
      event_category: 'funnel',
      lead_id: body.lead_id,
      event_data: {
        evaluation_type: body.evaluation_type,
        amount: pricing.amount,
        country: preferences?.country,
        has_travel_dates: !!body.travel_dates,
      },
    });

    const checkoutUrl = flowResult ? `${flowResult.url}?token=${flowResult.token}` : null;
    console.log(`[Regional Checkout] Checkout created for lead ${body.lead_id}, payment: ${payment.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          lead_id: body.lead_id,
          payment_id: payment.id,
          evaluation_type: body.evaluation_type,
          amount: pricing.amount,
          currency: 'CLP',
          description: pricing.description,
          checkout_url: checkoutUrl,
          preference_id: flowResult ? String(flowResult.flowOrder) : null,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Regional Checkout] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
