import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

interface WhatsAppRequest {
  action: 'send_template' | 'send_message' | 'send_reminder';
  // Common
  to: string; // Phone number in international format (e.g., 5491112345678)
  // For send_template
  template_name?: string;
  template_language?: string;
  template_components?: Array<{
    type: string;
    parameters: Array<{
      type: string;
      text?: string;
    }>;
  }>;
  // For send_message
  message?: string;
  // For send_reminder
  patient_name?: string;
  appointment_date?: string;
  appointment_time?: string;
  doctor_name?: string;
}

async function whatsappRequest(endpoint: string, method: string = 'POST', body?: object) {
  const apiToken = Deno.env.get('WHATSAPP_API_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  
  if (!apiToken || !phoneNumberId) {
    throw new Error('WhatsApp credentials not configured');
  }

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const url = `${WHATSAPP_API_URL}/${phoneNumberId}${endpoint}`;
  console.log(`[WhatsApp] ${method} ${url}`);
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[WhatsApp] Error: ${response.status} - ${errorText}`);
    throw new Error(`WhatsApp API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 0, remove it (local format)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // If it doesn't start with country code, assume Argentina (54)
  if (!cleaned.startsWith('54') && cleaned.length <= 10) {
    cleaned = '54' + cleaned;
  }
  
  return cleaned;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[WhatsApp] No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('[WhatsApp] Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[WhatsApp] Authenticated user: ${user.id}`);

    const body: WhatsAppRequest = await req.json();
    console.log(`[WhatsApp] Action: ${body.action}`);

    if (!body.to) {
      throw new Error('Missing required field: to (phone number)');
    }

    const formattedPhone = formatPhoneNumber(body.to);
    console.log(`[WhatsApp] Sending to: ${formattedPhone}`);

    let result;

    switch (body.action) {
      case 'send_template': {
        if (!body.template_name) {
          throw new Error('Missing required field: template_name');
        }

        const messageData = {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: body.template_name,
            language: {
              code: body.template_language || 'es_AR',
            },
            components: body.template_components || [],
          },
        };

        result = await whatsappRequest('/messages', 'POST', messageData);
        break;
      }

      case 'send_message': {
        if (!body.message) {
          throw new Error('Missing required field: message');
        }

        const messageData = {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: body.message,
          },
        };

        result = await whatsappRequest('/messages', 'POST', messageData);
        break;
      }

      case 'send_reminder': {
        if (!body.patient_name || !body.appointment_date || !body.appointment_time) {
          throw new Error('Missing required fields for reminder: patient_name, appointment_date, appointment_time');
        }

        // Use a pre-approved template for appointment reminders
        // You need to create this template in Meta Business Manager
        const messageData = {
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: 'appointment_reminder', // Must be pre-approved in Meta Business
            language: {
              code: 'es_AR',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: body.patient_name },
                  { type: 'text', text: body.appointment_date },
                  { type: 'text', text: body.appointment_time },
                  { type: 'text', text: body.doctor_name || 'Dr. Miró' },
                ],
              },
            ],
          },
        };

        result = await whatsappRequest('/messages', 'POST', messageData);
        break;
      }

      default:
        throw new Error(`Unknown action: ${body.action}`);
    }

    console.log(`[WhatsApp] Message sent successfully:`, result);
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[WhatsApp] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
