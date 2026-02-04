import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface MiniCallRequest {
  lead_id: string;
  preferred_datetime: string; // ISO datetime
  contact_method: 'whatsapp_video' | 'google_meet' | 'zoom';
  notes?: string;
}

interface MiniCallSlot {
  datetime: string;
  available: boolean;
}

// Generate available slots for mini-calls (15 min slots)
function generateAvailableSlots(startDate: Date, daysAhead: number = 7): MiniCallSlot[] {
  const slots: MiniCallSlot[] = [];
  const workingHours = { start: 9, end: 18 }; // Chile time (UTC-3 or UTC-4)
  
  for (let day = 0; day < daysAhead; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);
        
        // Only future slots
        if (slotDate > new Date()) {
          slots.push({
            datetime: slotDate.toISOString(),
            available: Math.random() > 0.3, // 70% availability for demo
          });
        }
      }
    }
  }
  
  return slots;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Handle GET for available slots
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const leadId = url.searchParams.get('lead_id');
      
      if (!leadId) {
        return new Response(
          JSON.stringify({ error: 'Missing lead_id parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify lead exists and is regional
      const { data: lead, error: leadError } = await supabase
        .from('funnel_leads')
        .select('id, scheduling_preferences')
        .eq('id', leadId)
        .single();

      if (leadError || !lead) {
        return new Response(
          JSON.stringify({ error: 'Lead not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const preferences = lead.scheduling_preferences as Record<string, unknown> | null;
      const timezone = (preferences?.timezone as string) || 'America/Santiago';

      const slots = generateAvailableSlots(new Date(), 14);
      const availableSlots = slots.filter(s => s.available);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            lead_id: leadId,
            timezone,
            slots: availableSlots.slice(0, 20), // Return max 20 available slots
            duration_minutes: 15,
            purpose: 'Instrucciones para obtener radiografía panorámica en su ciudad',
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle POST to schedule mini-call
    const body: MiniCallRequest = await req.json();
    console.log('[Regional Mini-Call] Scheduling call:', { lead_id: body.lead_id });

    if (!body.lead_id || !body.preferred_datetime || !body.contact_method) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: lead_id, preferred_datetime, contact_method' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const validMethods = ['whatsapp_video', 'google_meet', 'zoom'];
    if (!validMethods.includes(body.contact_method)) {
      return new Response(
        JSON.stringify({ error: 'Invalid contact_method' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get lead
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .select('id, name, email, phone, scheduling_preferences')
      .eq('id', body.lead_id)
      .single();

    if (leadError || !lead) {
      console.error('[Regional Mini-Call] Lead not found:', body.lead_id);
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

    // Create appointment record for mini-call
    const callDate = new Date(body.preferred_datetime);
    
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        lead_id: body.lead_id,
        scheduled_date: callDate.toISOString().split('T')[0],
        scheduled_time: callDate.toTimeString().split(' ')[0].slice(0, 5),
        duration_minutes: 15,
        status: 'scheduled',
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('[Regional Mini-Call] Failed to create appointment:', appointmentError);
      return new Response(
        JSON.stringify({ error: 'Failed to schedule mini-call' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update lead with mini-call info
    await supabase
      .from('funnel_leads')
      .update({
        scheduling_preferences: {
          ...preferences,
          mini_call_scheduled: true,
          mini_call_datetime: body.preferred_datetime,
          mini_call_method: body.contact_method,
          mini_call_notes: body.notes,
        },
      })
      .eq('id', body.lead_id);

    // Generate meeting link based on contact method
    let meetingInfo = {
      method: body.contact_method,
      link: '',
      instructions: '',
    };

    switch (body.contact_method) {
      case 'whatsapp_video':
        meetingInfo.link = `https://wa.me/${lead.phone}`;
        meetingInfo.instructions = 'Le llamaremos por videollamada de WhatsApp a la hora agendada';
        break;
      case 'google_meet':
        meetingInfo.link = `https://meet.google.com/new`; // Would be generated dynamically
        meetingInfo.instructions = 'Recibirá un enlace de Google Meet por email';
        break;
      case 'zoom':
        meetingInfo.link = 'https://zoom.us/j/pending'; // Would be generated dynamically
        meetingInfo.instructions = 'Recibirá un enlace de Zoom por email';
        break;
    }

    // Track analytics
    await supabase.from('analytics_events').insert({
      event_type: 'regional_mini_call_scheduled',
      event_category: 'funnel',
      lead_id: body.lead_id,
      event_data: {
        contact_method: body.contact_method,
        scheduled_datetime: body.preferred_datetime,
        country: preferences.country,
      },
    });

    // TODO: Send notification (WhatsApp/email) with confirmation

    console.log(`[Regional Mini-Call] Scheduled for lead ${body.lead_id} at ${body.preferred_datetime}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          lead_id: body.lead_id,
          appointment_id: appointment.id,
          scheduled_datetime: body.preferred_datetime,
          duration_minutes: 15,
          meeting: meetingInfo,
          purpose: 'Instrucciones para obtener radiografía panorámica',
          next_steps: [
            'Recibirá confirmación por email y WhatsApp',
            'Durante la llamada le explicaremos qué radiografía necesita',
            'Le indicaremos centros radiológicos recomendados en su zona',
            'Una vez tenga la RX, continúa el proceso de preevaluación IA',
          ],
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Regional Mini-Call] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
