import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

interface NotificationRequest {
  action: 'send_funnel_notification' | 'send_appointment_reminder';
  // Para send_funnel_notification
  lead_id?: string;
  event_type?: 'lead_created' | 'ia_done' | 'checkout_created' | 'paid' | 'scheduled';
  // Para send_appointment_reminder
  appointment_id?: string;
  reminder_type?: '48h' | '24h' | '2h';
}

interface NotificationTemplate {
  template_name: string;
  components: Array<{
    type: string;
    parameters: Array<{ type: string; text: string }>;
  }>;
}

function getTemplateForEvent(
  eventType: string,
  data: { name: string; date?: string; time?: string; amount?: number }
): NotificationTemplate | null {
  switch (eventType) {
    case 'lead_created':
      return {
        template_name: 'lead_welcome',
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: data.name },
          ],
        }],
      };

    case 'ia_done':
      return {
        template_name: 'ia_analysis_ready',
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: data.name },
          ],
        }],
      };

    case 'paid':
      return {
        template_name: 'payment_confirmed',
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: data.name },
            { type: 'text', text: `$${(data.amount || 49000).toLocaleString('es-CL')}` },
          ],
        }],
      };

    case 'scheduled':
      return {
        template_name: 'appointment_confirmed',
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: data.name },
            { type: 'text', text: data.date || '' },
            { type: 'text', text: data.time || '' },
          ],
        }],
      };

    default:
      return null;
  }
}

function getReminderTemplate(
  reminderType: string,
  data: { name: string; date: string; time: string }
): NotificationTemplate {
  const templateMap: Record<string, string> = {
    '48h': 'appointment_reminder_48h',
    '24h': 'appointment_reminder_24h',
    '2h': 'appointment_reminder_2h',
  };

  return {
    template_name: templateMap[reminderType] || 'appointment_reminder',
    components: [{
      type: 'body',
      parameters: [
        { type: 'text', text: data.name },
        { type: 'text', text: data.date },
        { type: 'text', text: data.time },
      ],
    }],
  };
}

async function sendWhatsAppTemplate(
  phone: string,
  template: NotificationTemplate
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiToken = Deno.env.get('WHATSAPP_API_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

  if (!apiToken || !phoneNumberId) {
    console.log('[Notify] WhatsApp credentials not configured, logging only');
    return { success: false, error: 'WhatsApp not configured' };
  }

  // Formatea número chileno
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = formattedPhone.substring(1);
  }
  if (!formattedPhone.startsWith('56') && formattedPhone.length <= 9) {
    formattedPhone = '56' + formattedPhone;
  }

  const messageData = {
    messaging_product: 'whatsapp',
    to: formattedPhone,
    type: 'template',
    template: {
      name: template.template_name,
      language: { code: 'es_CL' },
      components: template.components,
    },
  };

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Notify] WhatsApp API error: ${response.status} - ${errorText}`);
      return { success: false, error: `WhatsApp API error: ${response.status}` };
    }

    const result = await response.json();
    const messageId = result.messages?.[0]?.id;
    console.log(`[Notify] WhatsApp message sent: ${messageId}`);
    return { success: true, messageId };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Notify] WhatsApp send failed:', errMsg);
    return { success: false, error: errMsg };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: NotificationRequest = await req.json();
    console.log('[Notify] Request:', body);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (body.action === 'send_funnel_notification') {
      if (!body.lead_id || !body.event_type) {
        return new Response(
          JSON.stringify({ error: 'Missing lead_id or event_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get lead data
      const { data: lead, error: leadError } = await supabase
        .from('funnel_leads')
        .select('*')
        .eq('id', body.lead_id)
        .single();

      if (leadError || !lead) {
        return new Response(
          JSON.stringify({ error: 'Lead not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get appointment data if scheduled
      let appointmentData: { date?: string; time?: string } = {};
      if (body.event_type === 'scheduled') {
        const { data: apt } = await supabase
          .from('appointments')
          .select('scheduled_date, scheduled_time')
          .eq('lead_id', body.lead_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (apt) {
          appointmentData = {
            date: new Date(apt.scheduled_date).toLocaleDateString('es-CL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }),
            time: apt.scheduled_time,
          };
        }
      }

      // Get payment amount if paid
      let paymentAmount = 49000;
      if (body.event_type === 'paid') {
        const { data: payment } = await supabase
          .from('funnel_payments')
          .select('amount')
          .eq('lead_id', body.lead_id)
          .eq('status', 'approved')
          .single();

        if (payment) {
          paymentAmount = payment.amount;
        }
      }

      const template = getTemplateForEvent(body.event_type, {
        name: lead.name,
        ...appointmentData,
        amount: paymentAmount,
      });

      if (!template) {
        return new Response(
          JSON.stringify({ error: 'Unknown event type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Send WhatsApp
      const whatsappResult = await sendWhatsAppTemplate(lead.phone, template);

      // Log notification
      await supabase.from('notifications_log').insert({
        lead_id: body.lead_id,
        channel: 'whatsapp',
        template_name: template.template_name,
        recipient_phone: lead.phone,
        message_content: JSON.stringify(template.components),
        status: whatsappResult.success ? 'sent' : 'failed',
        external_message_id: whatsappResult.messageId,
        error_message: whatsappResult.error,
        sent_at: whatsappResult.success ? new Date().toISOString() : null,
      });

      // Track analytics event
      await supabase.from('analytics_events').insert({
        lead_id: body.lead_id,
        event_type: `notification_${body.event_type}`,
        event_category: 'notification',
        event_data: {
          channel: 'whatsapp',
          template: template.template_name,
          success: whatsappResult.success,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            notification_sent: whatsappResult.success,
            message_id: whatsappResult.messageId,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.action === 'send_appointment_reminder') {
      if (!body.appointment_id || !body.reminder_type) {
        return new Response(
          JSON.stringify({ error: 'Missing appointment_id or reminder_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get appointment with lead data
      const { data: apt, error: aptError } = await supabase
        .from('appointments')
        .select(`
          *,
          funnel_leads (name, phone, email)
        `)
        .eq('id', body.appointment_id)
        .single();

      if (aptError || !apt) {
        return new Response(
          JSON.stringify({ error: 'Appointment not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const lead = apt.funnel_leads as { name: string; phone: string; email: string } | null;
      if (!lead?.phone) {
        return new Response(
          JSON.stringify({ error: 'No phone number for this appointment' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const template = getReminderTemplate(body.reminder_type, {
        name: lead.name,
        date: new Date(apt.scheduled_date).toLocaleDateString('es-CL', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }),
        time: apt.scheduled_time,
      });

      const whatsappResult = await sendWhatsAppTemplate(lead.phone, template);

      // Update appointment
      const reminderField = body.reminder_type === '48h' ? 'reminder_sent' : 'confirmation_sent';
      await supabase
        .from('appointments')
        .update({ [reminderField]: true })
        .eq('id', body.appointment_id);

      // Log notification
      await supabase.from('notifications_log').insert({
        lead_id: apt.lead_id,
        channel: 'whatsapp',
        template_name: template.template_name,
        recipient_phone: lead.phone,
        status: whatsappResult.success ? 'sent' : 'failed',
        external_message_id: whatsappResult.messageId,
        error_message: whatsappResult.error,
        sent_at: whatsappResult.success ? new Date().toISOString() : null,
      });

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            notification_sent: whatsappResult.success,
            message_id: whatsappResult.messageId,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Notify] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
