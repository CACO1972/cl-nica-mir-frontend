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

// ─── Flow.cl HMAC-SHA256 signing ───
async function flowSignAsync(params: Record<string, string>, secretKey: string): Promise<string> {
  const keys = Object.keys(params).sort();
  let toSign = "";
  for (const key of keys) toSign += key + params[key];

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
  if (!apiKey || !secretKey) throw new Error('FLOW_API_KEY or FLOW_SECRET_KEY not configured');

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
  params.s = await flowSignAsync(params, secretKey);

  console.log(`[Funnel Checkout] Creating Flow payment for order ${commerceOrder}`);
  const response = await fetch(`${FLOW_API_URL}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
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
  params.s = await flowSignAsync(params, secretKey);

  const response = await fetch(`${FLOW_API_URL}/payment/getStatus?${new URLSearchParams(params).toString()}`);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Funnel Checkout] Flow getStatus error: ${response.status} - ${errorText}`);
    throw new Error(`Flow getStatus error: ${response.status}`);
  }
  return response.json();
}

// ─── Shared post-payment workflow (idempotent) ───
// deno-lint-ignore no-explicit-any
async function reconcileFlowPayment(supabase: any, supabaseUrl: string, supabaseKey: string, token: string) {
  const flowPayment = await getFlowPaymentStatus(token) as Record<string, any>;
  const flowOrderStr = String(flowPayment.flowOrder);
  console.log(`[Funnel Checkout] Reconciling flowOrder=${flowOrderStr}, status=${flowPayment.status}`);

  let paymentStatus: 'pending' | 'approved' | 'rejected' | 'cancelled' = 'pending';
  if (flowPayment.status === 2) paymentStatus = 'approved';
  else if (flowPayment.status === 3) paymentStatus = 'rejected';
  else if (flowPayment.status === 4) paymentStatus = 'cancelled';

  // Find payment record by flowOrder (stored in mercadopago_preference_id)
  const { data: paymentRow } = await supabase
    .from('funnel_payments')
    .select('id, lead_id, status')
    .eq('mercadopago_preference_id', flowOrderStr)
    .maybeSingle();

  if (!paymentRow) {
    console.error('[Funnel Checkout] No payment record for flowOrder:', flowOrderStr);
    return { paymentStatus, flowOrder: flowOrderStr, alreadyProcessed: false };
  }

  // Idempotency: if already approved, don't re-run post-payment side effects
  const alreadyApproved = paymentRow.status === 'approved';

  await supabase
    .from('funnel_payments')
    .update({
      mercadopago_payment_id: flowOrderStr,
      mercadopago_status: String(flowPayment.status),
      mercadopago_response: flowPayment,
      status: paymentStatus,
      paid_at: paymentStatus === 'approved' ? new Date().toISOString() : null,
    })
    .eq('id', paymentRow.id);

  if (paymentStatus === 'approved' && !alreadyApproved) {
    await supabase.from('funnel_leads').update({ status: 'PAID' }).eq('id', paymentRow.lead_id);
    console.log(`[Funnel Checkout] Lead ${paymentRow.lead_id} marked PAID`);

    // Dentalink patient creation (best-effort)
    try {
      const dRes = await fetch(`${supabaseUrl}/functions/v1/dentalink-create-patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
        body: JSON.stringify({ lead_id: paymentRow.lead_id }),
      });
      const dData = await dRes.json();
      console.log('[Funnel Checkout] Dentalink:', dData.success ? `created ${dData.data?.dentalink_patient_id}` : `failed ${dData.error}`);
    } catch (e) {
      console.error('[Funnel Checkout] Dentalink error:', e instanceof Error ? e.message : e);
    }

    // WhatsApp confirmation (best-effort)
    try {
      const { data: leadData } = await supabase
        .from('funnel_leads').select('name, phone').eq('id', paymentRow.lead_id).maybeSingle();
      if (leadData?.phone) {
        await fetch(`${supabaseUrl}/functions/v1/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
          body: JSON.stringify({ channel: 'whatsapp', phone: leadData.phone, template: 'payment_confirmed', name: leadData.name }),
        });
        console.log('[Funnel Checkout] WhatsApp sent');
      }
    } catch (e) {
      console.error('[Funnel Checkout] Notify error:', e instanceof Error ? e.message : e);
    }
  }

  return { paymentStatus, flowOrder: flowOrderStr, alreadyProcessed: alreadyApproved };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const url = new URL(req.url);

  try {
    // ─── GET: manual reconciliation from frontend return ───
    if (req.method === 'GET') {
      const token = url.searchParams.get('token');
      const leadId = url.searchParams.get('lead_id');

      if (token) {
        try {
          const result = await reconcileFlowPayment(supabase, supabaseUrl, supabaseKey, token);
          return new Response(JSON.stringify({ success: true, ...result }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (err) {
          console.error('[Funnel Checkout] Reconciliation error:', err);
          return new Response(JSON.stringify({ success: false, error: 'Reconciliation failed' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }

      if (leadId) {
        const { data: payment } = await supabase
          .from('funnel_payments').select('status, paid_at, amount')
          .eq('lead_id', leadId).order('created_at', { ascending: false }).limit(1).maybeSingle();
        return new Response(JSON.stringify({ success: true, payment }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ error: 'Missing token or lead_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ─── POST from Flow webhook (urlConfirmation) ───
    // Flow sends application/x-www-form-urlencoded with `token`.
    // CRITICAL: always respond 200 so Flow doesn't retry storm.
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('x-www-form-urlencoded')) {
      try {
        const formData = await req.formData();
        const token = formData.get('token') as string;
        if (!token) {
          console.log('[Funnel Checkout] Webhook without token, ack');
          return new Response('OK', { status: 200, headers: corsHeaders });
        }
        console.log(`[Funnel Checkout] Webhook token: ${token}`);
        await reconcileFlowPayment(supabase, supabaseUrl, supabaseKey, token);
      } catch (err) {
        // Log but still ACK 200 — Flow retries on non-2xx and reconciliation runs on user return anyway.
        console.error('[Funnel Checkout] Webhook error (ack anyway):', err instanceof Error ? err.message : err);
      }
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // ─── POST JSON: create new checkout ───
    const body: CheckoutRequest = await req.json();
    console.log('[Funnel Checkout] Creating checkout for lead:', body.lead_id);

    if (!body.lead_id) {
      return new Response(JSON.stringify({ error: 'Missing required field: lead_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads').select('*').eq('id', body.lead_id).maybeSingle();

    if (leadError || !lead) {
      console.error('[Funnel Checkout] Lead not found:', body.lead_id);
      return new Response(JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Idempotency: block if already paid
    const { data: existingPayment } = await supabase
      .from('funnel_payments').select('status')
      .eq('lead_id', body.lead_id).eq('status', 'approved').maybeSingle();

    if (existingPayment) {
      return new Response(JSON.stringify({ error: 'This evaluation has already been paid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const origin = req.headers.get('origin') || req.headers.get('referer')?.replace(/\/$/, '') || 'https://miro-patient-portal.lovable.app';
    const urlReturn = body.success_url || `${origin}/evaluation?payment=success`;
    const urlConfirmation = `${supabaseUrl}/functions/v1/funnel-checkout`;

    const flowResult = await createFlowPayment(
      { id: lead.id, name: lead.name, email: lead.email },
      urlReturn,
      urlConfirmation
    );

    const checkoutUrl = `${flowResult.url}?token=${flowResult.token}`;
    console.log(`[Funnel Checkout] Flow checkout URL generated, flowOrder: ${flowResult.flowOrder}`);

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
      .select().single();

    if (paymentInsertError) {
      console.error('[Funnel Checkout] Failed to create payment record:', paymentInsertError);
      return new Response(JSON.stringify({ error: 'Failed to create payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    await supabase.from('funnel_leads').update({ status: 'CHECKOUT_CREATED' }).eq('id', lead.id);

    return new Response(JSON.stringify({
      success: true,
      data: {
        payment_id: payment.id,
        checkout_url: checkoutUrl,
        sandbox_url: checkoutUrl,
        preference_id: String(flowResult.flowOrder),
        amount: EVALUATION_PRICE,
        currency: 'CLP',
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Funnel Checkout] Error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
