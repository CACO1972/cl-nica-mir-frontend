import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MERCADOPAGO_API_URL = "https://api.mercadopago.com";

interface RegionalCheckoutRequest {
  lead_id: string;
  evaluation_type: 'online' | 'presencial';
  travel_dates?: {
    arrival: string;
    departure: string;
  };
  timezone?: string;
}

// Pricing for regional/international patients
const PRICING = {
  online: {
    amount: 35000, // CLP - Evaluación Premium Online (videollamada)
    description: 'Evaluación Premium Online - Videollamada con Especialista',
  },
  presencial: {
    amount: 49000, // CLP - Same as regular premium
    description: 'Evaluación Presencial Premium - 100% abonable a tratamiento',
  },
};

async function createMercadoPagoPreference(
  lead: { id: string; name: string; email: string },
  evaluationType: 'online' | 'presencial',
  baseUrl: string
): Promise<{ preference_id: string; init_point: string } | null> {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
  
  if (!accessToken) {
    console.log('[Regional Checkout] MERCADOPAGO_ACCESS_TOKEN not configured');
    return null;
  }

  const pricing = PRICING[evaluationType];

  try {
    const response = await fetch(`${MERCADOPAGO_API_URL}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            title: pricing.description,
            quantity: 1,
            unit_price: pricing.amount,
            currency_id: 'CLP',
          },
        ],
        payer: {
          name: lead.name.split(' ')[0],
          surname: lead.name.split(' ').slice(1).join(' ') || '',
          email: lead.email,
        },
        external_reference: `regional_${evaluationType}_${lead.id}`,
        notification_url: `${baseUrl}/functions/v1/mercadopago`,
        back_urls: {
          success: `${baseUrl.replace('supabase.co', 'lovable.app')}/evaluation/regional/success?lead=${lead.id}&type=${evaluationType}`,
          failure: `${baseUrl.replace('supabase.co', 'lovable.app')}/evaluation/regional/checkout?lead=${lead.id}&error=payment_failed`,
          pending: `${baseUrl.replace('supabase.co', 'lovable.app')}/evaluation/regional/pending?lead=${lead.id}`,
        },
        auto_return: 'approved',
        statement_descriptor: 'CLINICA MIRO',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Regional Checkout] MercadoPago error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`[Regional Checkout] MercadoPago preference created: ${data.id}`);
    
    return {
      preference_id: data.id,
      init_point: data.init_point,
    };
  } catch (error) {
    console.error('[Regional Checkout] MercadoPago failed:', error);
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

    // Verify this is a regional lead
    const preferences = lead.scheduling_preferences as Record<string, unknown> | null;
    if (!preferences?.is_regional) {
      return new Response(
        JSON.stringify({ error: 'This endpoint is only for regional/international leads' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pricing = PRICING[body.evaluation_type];

    // Create MercadoPago preference
    const mpPreference = await createMercadoPagoPreference(
      lead,
      body.evaluation_type,
      supabaseUrl
    );

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('funnel_payments')
      .insert({
        lead_id: lead.id,
        amount: pricing.amount,
        description: pricing.description,
        status: 'pending',
        mercadopago_preference_id: mpPreference?.preference_id || null,
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

    // Update lead status and add travel dates if provided
    const updateData: Record<string, unknown> = {
      status: 'CHECKOUT_CREATED',
    };

    if (body.travel_dates || body.timezone) {
      updateData.scheduling_preferences = {
        ...preferences,
        travel_dates: body.travel_dates,
        timezone: body.timezone || preferences.timezone,
        evaluation_type: body.evaluation_type,
      };
    }

    await supabase
      .from('funnel_leads')
      .update(updateData)
      .eq('id', body.lead_id);

    // Track analytics
    await supabase.from('analytics_events').insert({
      event_type: 'regional_checkout_created',
      event_category: 'funnel',
      lead_id: body.lead_id,
      event_data: {
        evaluation_type: body.evaluation_type,
        amount: pricing.amount,
        country: preferences.country,
        has_travel_dates: !!body.travel_dates,
      },
    });

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
          checkout_url: mpPreference?.init_point || null,
          preference_id: mpPreference?.preference_id || null,
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
