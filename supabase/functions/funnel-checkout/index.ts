import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MERCADOPAGO_API_URL = "https://api.mercadopago.com";
const EVALUATION_PRICE = 49000; // CLP

interface CheckoutRequest {
  lead_id: string;
  success_url?: string;
  failure_url?: string;
  pending_url?: string;
}

interface WebhookRequest {
  action: 'webhook';
  type?: string;
  data?: {
    id?: string;
  };
}

async function createMercadoPagoPreference(
  lead: { id: string; name: string; email: string; phone: string },
  backUrls: { success: string; failure: string; pending: string },
  notificationUrl: string
) {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
  
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
  }

  const preferenceData = {
    items: [{
      title: 'Evaluación Presencial Premium',
      description: 'Diagnóstico con IA en vivo, visualización de alternativas y plan de tratamiento personalizado - 90 min',
      quantity: 1,
      unit_price: EVALUATION_PRICE,
      currency_id: 'CLP',
    }],
    payer: {
      name: lead.name,
      email: lead.email,
      phone: { number: lead.phone },
    },
    external_reference: `funnel_${lead.id}`,
    back_urls: backUrls,
    auto_return: 'approved',
    notification_url: notificationUrl,
    statement_descriptor: 'CLINICA MIRO',
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
  };

  console.log('[Funnel Checkout] Creating MercadoPago preference');

  const response = await fetch(`${MERCADOPAGO_API_URL}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferenceData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Funnel Checkout] MercadoPago error: ${response.status} - ${errorText}`);
    throw new Error(`MercadoPago API error: ${response.status}`);
  }

  return response.json();
}

async function getPaymentDetails(paymentId: string) {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
  
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
  }

  const response = await fetch(`${MERCADOPAGO_API_URL}/v1/payments/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Funnel Checkout] MercadoPago get payment error: ${response.status} - ${errorText}`);
    throw new Error(`Failed to get payment: ${response.status}`);
  }

  return response.json();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle webhook from MercadoPago
    if (body.action === 'webhook' || body.type === 'payment') {
      console.log('[Funnel Checkout] Processing webhook:', JSON.stringify(body));
      
      const paymentId = body.data?.id;
      if (!paymentId) {
        console.log('[Funnel Checkout] Webhook without payment ID, ignoring');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get payment details from MercadoPago
      const payment = await getPaymentDetails(paymentId);
      console.log(`[Funnel Checkout] Payment ${paymentId} status: ${payment.status}`);

      // Extract lead_id from external_reference
      const externalRef = payment.external_reference || '';
      const leadId = externalRef.replace('funnel_', '');

      if (!leadId) {
        console.error('[Funnel Checkout] No lead_id in external_reference');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Map MercadoPago status to our status
      let paymentStatus: 'pending' | 'approved' | 'rejected' | 'cancelled' = 'pending';
      if (payment.status === 'approved') paymentStatus = 'approved';
      else if (['rejected', 'cancelled'].includes(payment.status)) paymentStatus = 'rejected';

      // Update payment record
      const { error: paymentError } = await supabase
        .from('funnel_payments')
        .update({
          mercadopago_payment_id: paymentId,
          mercadopago_status: payment.status,
          mercadopago_response: payment,
          status: paymentStatus,
          paid_at: paymentStatus === 'approved' ? new Date().toISOString() : null,
        })
        .eq('lead_id', leadId);

      if (paymentError) {
        console.error('[Funnel Checkout] Failed to update payment:', paymentError);
      }

      // If approved, update lead status
      if (paymentStatus === 'approved') {
        const { error: leadError } = await supabase
          .from('funnel_leads')
          .update({ status: 'PAID' })
          .eq('id', leadId);

        if (leadError) {
          console.error('[Funnel Checkout] Failed to update lead status:', leadError);
        } else {
          console.log(`[Funnel Checkout] Lead ${leadId} marked as PAID`);
        }

        // TODO: Send WhatsApp confirmation
        // TODO: Create base appointment in Dentalink
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Regular checkout request
    const checkoutBody = body as CheckoutRequest;
    console.log('[Funnel Checkout] Creating checkout for lead:', checkoutBody.lead_id);

    if (!checkoutBody.lead_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: lead_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get lead
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .select('*')
      .eq('id', checkoutBody.lead_id)
      .single();

    if (leadError || !lead) {
      console.error('[Funnel Checkout] Lead not found:', checkoutBody.lead_id);
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already paid
    const { data: existingPayment } = await supabase
      .from('funnel_payments')
      .select('status')
      .eq('lead_id', checkoutBody.lead_id)
      .eq('status', 'approved')
      .single();

    if (existingPayment) {
      return new Response(
        JSON.stringify({ error: 'This evaluation has already been paid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build URLs
    const baseUrl = supabaseUrl.replace('.supabase.co', '.lovable.app');
    const backUrls = {
      success: checkoutBody.success_url || `${baseUrl}/evaluacion/pago-exitoso`,
      failure: checkoutBody.failure_url || `${baseUrl}/evaluacion/pago-fallido`,
      pending: checkoutBody.pending_url || `${baseUrl}/evaluacion/pago-pendiente`,
    };
    const notificationUrl = `${supabaseUrl}/functions/v1/funnel-checkout`;

    // Create MercadoPago preference
    const mpPreference = await createMercadoPagoPreference(
      { 
        id: lead.id, 
        name: lead.name, 
        email: lead.email, 
        phone: lead.phone 
      },
      backUrls,
      notificationUrl
    );

    console.log(`[Funnel Checkout] Preference created: ${mpPreference.id}`);

    // Create payment record
    const { data: payment, error: paymentInsertError } = await supabase
      .from('funnel_payments')
      .insert({
        lead_id: lead.id,
        amount: EVALUATION_PRICE,
        currency: 'CLP',
        description: 'Evaluación Presencial Premium',
        mercadopago_preference_id: mpPreference.id,
        status: 'pending',
      })
      .select()
      .single();

    if (paymentInsertError) {
      console.error('[Funnel Checkout] Failed to create payment record:', paymentInsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update lead status
    await supabase
      .from('funnel_leads')
      .update({ status: 'CHECKOUT_CREATED' })
      .eq('id', lead.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          payment_id: payment.id,
          checkout_url: mpPreference.init_point,
          sandbox_url: mpPreference.sandbox_init_point,
          preference_id: mpPreference.id,
          amount: EVALUATION_PRICE,
          currency: 'CLP',
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Funnel Checkout] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
