import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MERCADOPAGO_API_URL = "https://api.mercadopago.com";

interface PaymentRequest {
  action: 'create_preference' | 'get_payment' | 'webhook';
  // For create_preference
  items?: Array<{
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>;
  payer_email?: string;
  payer_name?: string;
  payer_phone?: string;
  external_reference?: string;
  notification_url?: string;
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  // For get_payment
  payment_id?: string;
  // For webhook
  webhook_data?: object;
}

async function mercadopagoRequest(endpoint: string, method: string = 'GET', body?: object) {
  const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
  
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured');
  }

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  console.log(`[MercadoPago] ${method} ${endpoint}`);
  
  const response = await fetch(`${MERCADOPAGO_API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[MercadoPago] Error: ${response.status} - ${errorText}`);
    throw new Error(`MercadoPago API error: ${response.status}`);
  }

  return response.json();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: PaymentRequest = await req.json();
    console.log(`[MercadoPago] Action: ${body.action}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Webhook doesn't require user auth
    if (body.action === 'webhook') {
      console.log('[MercadoPago] Processing webhook');
      // Process webhook notification from MercadoPago
      const webhookData = body.webhook_data;
      console.log('[MercadoPago] Webhook data:', JSON.stringify(webhookData));
      
      // TODO: Update payment status in database
      // This would typically update a payments table with the new status
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Other actions require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[MercadoPago] No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[MercadoPago] Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[MercadoPago] Authenticated user: ${user.id}`);

    let result;

    switch (body.action) {
      case 'create_preference': {
        if (!body.items || body.items.length === 0) {
          throw new Error('Missing required field: items');
        }

        const preferenceData = {
          items: body.items.map(item => ({
            title: item.title,
            description: item.description || '',
            quantity: item.quantity,
            unit_price: item.unit_price,
            currency_id: item.currency_id || 'ARS',
          })),
          payer: {
            email: body.payer_email || user.email,
            name: body.payer_name,
            phone: body.payer_phone ? { number: body.payer_phone } : undefined,
          },
          external_reference: body.external_reference || `user_${user.id}_${Date.now()}`,
          back_urls: body.back_urls || {
            success: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/payment/success`,
            failure: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/payment/failure`,
            pending: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/payment/pending`,
          },
          auto_return: 'approved',
          notification_url: body.notification_url,
        };

        result = await mercadopagoRequest('/checkout/preferences', 'POST', preferenceData);
        console.log(`[MercadoPago] Preference created: ${result.id}`);
        break;
      }

      case 'get_payment': {
        if (!body.payment_id) {
          throw new Error('Missing required field: payment_id');
        }
        result = await mercadopagoRequest(`/v1/payments/${body.payment_id}`);
        break;
      }

      default:
        throw new Error(`Unknown action: ${body.action}`);
    }

    console.log(`[MercadoPago] Success`);
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MercadoPago] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
