import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FLOW_API_URL = "https://www.flow.cl/api";

// ─── Flow.cl HMAC signing ───
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

interface PaymentRequest {
  action: 'create_payment' | 'get_status' | 'webhook';
  // For create_payment
  commerceOrder?: string;
  subject?: string;
  amount?: number;
  email?: string;
  urlReturn?: string;
  urlConfirmation?: string;
  currency?: string;
  // For get_status
  token?: string;
  // For webhook
  webhook_data?: object;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FLOW_API_KEY');
    const secretKey = Deno.env.get('FLOW_SECRET_KEY');

    if (!apiKey || !secretKey) {
      throw new Error('FLOW_API_KEY or FLOW_SECRET_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle Flow confirmation callback (form-urlencoded with token)
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('x-www-form-urlencoded')) {
      const formData = await req.formData();
      const token = formData.get('token') as string;

      if (!token) {
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[Flow] Confirmation callback, token: ${token}`);

      // Get payment status
      const statusParams: Record<string, string> = { apiKey, token };
      const sig = await flowSignAsync(statusParams, secretKey);
      statusParams.s = sig;

      const qs = new URLSearchParams(statusParams).toString();
      const statusRes = await fetch(`${FLOW_API_URL}/payment/getStatus?${qs}`);
      const flowPayment = await statusRes.json();

      console.log(`[Flow] Payment status: ${flowPayment.status}, order: ${flowPayment.flowOrder}`);

      return new Response(
        JSON.stringify({ success: true, data: flowPayment }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // JSON requests
    const body: PaymentRequest = await req.json();
    console.log(`[Flow] Action: ${body.action}`);

    let result;

    switch (body.action) {
      case 'create_payment': {
        if (!body.subject || !body.amount || !body.email) {
          throw new Error('Missing required fields: subject, amount, email');
        }

        const params: Record<string, string> = {
          apiKey,
          commerceOrder: body.commerceOrder || `order_${Date.now()}`,
          subject: body.subject,
          amount: String(body.amount),
          email: body.email,
          currency: body.currency || 'CLP',
          urlReturn: body.urlReturn || `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/payment/success`,
          urlConfirmation: body.urlConfirmation || `${supabaseUrl}/functions/v1/mercadopago`,
        };

        const sig = await flowSignAsync(params, secretKey);
        params.s = sig;

        const formBody = new URLSearchParams(params).toString();
        const response = await fetch(`${FLOW_API_URL}/payment/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Flow API error: ${response.status} - ${errorText}`);
        }

        const flowData = await response.json();
        result = {
          checkout_url: `${flowData.url}?token=${flowData.token}`,
          flow_order: flowData.flowOrder,
          token: flowData.token,
        };
        break;
      }

      case 'get_status': {
        if (!body.token) {
          throw new Error('Missing required field: token');
        }

        const params: Record<string, string> = { apiKey, token: body.token };
        const sig = await flowSignAsync(params, secretKey);
        params.s = sig;

        const qs = new URLSearchParams(params).toString();
        const response = await fetch(`${FLOW_API_URL}/payment/getStatus?${qs}`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Flow getStatus error: ${response.status} - ${errorText}`);
        }

        result = await response.json();
        break;
      }

      default:
        throw new Error(`Unknown action: ${body.action}`);
    }

    console.log('[Flow] Success');
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Flow] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
