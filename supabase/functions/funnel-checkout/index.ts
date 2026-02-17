import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FLOW_API_URL = "https://www.flow.cl/api";
const EVALUATION_PRICE = 49000; // CLP

interface CheckoutRequest {
  lead_id: string;
  success_url?: string;
  failure_url?: string;
  pending_url?: string;
}

// ─── Flow.cl signing utility ───
function flowSign(params: Record<string, string>, secretKey: string): string {
  const keys = Object.keys(params).sort();
  let toSign = "";
  for (const key of keys) {
    toSign += key + params[key];
  }
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const msgData = encoder.encode(toSign);

  // Use Web Crypto HMAC
  // We need sync, but Deno supports createHmac via node compat or we do async
  // For Deno edge functions, use crypto.subtle
  return ""; // placeholder – actual signing done in async helper
}

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
  urlReturn: string,
  urlConfirmation: string
): Promise<{ url: string; token: string; flowOrder: number }> {
  const apiKey = Deno.env.get('FLOW_API_KEY');
  const secretKey = Deno.env.get('FLOW_SECRET_KEY');

  if (!apiKey || !secretKey) {
    throw new Error('FLOW_API_KEY or FLOW_SECRET_KEY not configured');
  }

  // Flow limits commerceOrder to 45 chars. Use short prefix + timestamp
  const shortId = lead.id.replace(/-/g, '').substring(0, 12);
  const commerceOrder = `f_${shortId}_${Date.now()}`;

  const params: Record<string, string> = {
    apiKey,
    commerceOrder,
    subject: 'Evaluación Presencial Premium – Clínica Miró',
    amount: String(EVALUATION_PRICE),
    email: lead.email,
    currency: 'CLP',
    urlReturn,
    urlConfirmation,
  };

  const signature = await flowSignAsync(params, secretKey);
  params.s = signature;

  // Flow API requires application/x-www-form-urlencoded
  const formBody = new URLSearchParams(params).toString();

  console.log(`[Funnel Checkout] Creating Flow payment for order ${commerceOrder}`);

  const response = await fetch(`${FLOW_API_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Funnel Checkout] Flow error: ${response.status} - ${errorText}`);
    throw new Error(`Flow API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`[Funnel Checkout] Flow order created: ${data.flowOrder}`);
  return data;
}

async function getFlowPaymentStatus(token: string): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get('FLOW_API_KEY')!;
  const secretKey = Deno.env.get('FLOW_SECRET_KEY')!;

  const params: Record<string, string> = { apiKey, token };
  const signature = await flowSignAsync(params, secretKey);
  params.s = signature;

  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${FLOW_API_URL}/payment/getStatus?${qs}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Funnel Checkout] Flow getStatus error: ${response.status} - ${errorText}`);
    throw new Error(`Flow getStatus error: ${response.status}`);
  }

  return response.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Detect if this is a Flow confirmation callback (urlConfirmation)
    // Flow sends POST with application/x-www-form-urlencoded containing "token"
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('x-www-form-urlencoded')) {
      // This is a Flow webhook/confirmation callback
      const formData = await req.formData();
      const token = formData.get('token') as string;

      if (!token) {
        console.log('[Funnel Checkout] Confirmation without token, ignoring');
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[Funnel Checkout] Processing Flow confirmation, token: ${token}`);

      // Get payment status from Flow
      const flowPayment = await getFlowPaymentStatus(token) as Record<string, any>;
      console.log(`[Funnel Checkout] Flow payment status: ${flowPayment.status}, flowOrder: ${flowPayment.flowOrder}`);

      // Look up lead_id via flowOrder stored in mercadopago_preference_id
      const flowOrderStr = String(flowPayment.flowOrder);
      const { data: paymentRecord } = await supabase
        .from('funnel_payments')
        .select('lead_id')
        .eq('mercadopago_preference_id', flowOrderStr)
        .single();

      const leadId = paymentRecord?.lead_id;

      if (!leadId) {
        console.error('[Funnel Checkout] No payment found for flowOrder:', flowOrderStr);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Flow statuses: 1=pending, 2=paid, 3=rejected, 4=cancelled
      let paymentStatus: 'pending' | 'approved' | 'rejected' | 'cancelled' = 'pending';
      if (flowPayment.status === 2) paymentStatus = 'approved';
      else if (flowPayment.status === 3) paymentStatus = 'rejected';
      else if (flowPayment.status === 4) paymentStatus = 'cancelled';

      // Update payment record
      const { error: paymentError } = await supabase
        .from('funnel_payments')
        .update({
          mercadopago_payment_id: String(flowPayment.flowOrder),
          mercadopago_status: String(flowPayment.status),
          mercadopago_response: flowPayment,
          status: paymentStatus,
          paid_at: paymentStatus === 'approved' ? new Date().toISOString() : null,
        })
        .eq('lead_id', leadId);

      if (paymentError) {
        console.error('[Funnel Checkout] Failed to update payment:', paymentError);
      }

      // If approved, trigger post-payment workflow
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

        // Create patient in Dentalink + provision auth user
        try {
          const dentalinkRes = await fetch(
            `${supabaseUrl}/functions/v1/dentalink-create-patient`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({ lead_id: leadId }),
            }
          );
          const dentalinkData = await dentalinkRes.json();
          if (dentalinkData.success) {
            console.log(`[Funnel Checkout] Dentalink patient created: ${dentalinkData.data.dentalink_patient_id}`);
          } else {
            console.error('[Funnel Checkout] Dentalink creation failed:', dentalinkData.error);
          }
        } catch (dentalinkErr) {
          console.error('[Funnel Checkout] Dentalink call error:', dentalinkErr);
        }

        // Send WhatsApp confirmation
        try {
          const { data: leadData } = await supabase
            .from('funnel_leads')
            .select('name, phone')
            .eq('id', leadId)
            .single();

          if (leadData?.phone) {
            await fetch(
              `${supabaseUrl}/functions/v1/notify`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                  channel: 'whatsapp',
                  phone: leadData.phone,
                  template: 'payment_confirmed',
                  name: leadData.name,
                }),
              }
            );
            console.log('[Funnel Checkout] WhatsApp notification sent');
          }
        } catch (notifyErr) {
          console.error('[Funnel Checkout] Notify error:', notifyErr);
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Regular checkout request (JSON from frontend) ───
    const body: CheckoutRequest = await req.json();
    console.log('[Funnel Checkout] Creating checkout for lead:', body.lead_id);

    if (!body.lead_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: lead_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get lead
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .select('*')
      .eq('id', body.lead_id)
      .single();

    if (leadError || !lead) {
      console.error('[Funnel Checkout] Lead not found:', body.lead_id);
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already paid
    const { data: existingPayment } = await supabase
      .from('funnel_payments')
      .select('status')
      .eq('lead_id', body.lead_id)
      .eq('status', 'approved')
      .single();

    if (existingPayment) {
      return new Response(
        JSON.stringify({ error: 'This evaluation has already been paid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build URLs - use frontend-provided success_url
    const urlReturn = body.success_url || `https://miro-patient-portal.lovable.app/evaluation?payment=success`;
    const urlConfirmation = `${supabaseUrl}/functions/v1/funnel-checkout`;

    // Create Flow payment
    const flowResult = await createFlowPayment(
      { id: lead.id, name: lead.name, email: lead.email },
      urlReturn,
      urlConfirmation
    );

    const checkoutUrl = `${flowResult.url}?token=${flowResult.token}`;
    console.log(`[Funnel Checkout] Flow checkout URL generated, flowOrder: ${flowResult.flowOrder}`);

    // Create payment record
    const { data: payment, error: paymentInsertError } = await supabase
      .from('funnel_payments')
      .insert({
        lead_id: lead.id,
        amount: EVALUATION_PRICE,
        currency: 'CLP',
        description: 'Evaluación Presencial Premium',
        mercadopago_preference_id: String(flowResult.flowOrder),
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
          checkout_url: checkoutUrl,
          sandbox_url: checkoutUrl,
          preference_id: String(flowResult.flowOrder),
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
