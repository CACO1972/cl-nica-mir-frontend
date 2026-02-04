import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DENTALINK_API_URL = "https://api.dentalink.healthatom.com/api/v1";

interface BookingRequest {
  lead_id: string;
  appointment_type: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  professional_id?: string;
  // Optional preferences to save
  save_preferences?: boolean;
  preferred_days?: string[];
  preferred_time_range?: string;
  notes?: string;
}

async function createDentalinkAppointment(
  patientId: string,
  professionalId: string,
  dateTime: string,
  endDateTime: string,
  notes?: string
): Promise<{ id: string } | null> {
  const apiKey = Deno.env.get('DENTALINK_API_KEY');
  
  if (!apiKey) {
    console.log('[Agenda Book] DENTALINK_API_KEY not configured, skipping Dentalink');
    return { id: `mock_apt_${Date.now()}` };
  }

  try {
    const response = await fetch(`${DENTALINK_API_URL}/citas`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_paciente: patientId,
        id_profesional: professionalId,
        fecha_hora: dateTime,
        fecha_hora_termino: endDateTime,
        notas: notes || 'Reserva desde web',
        estado: 'confirmada',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Agenda Book] Dentalink error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(`[Agenda Book] Dentalink appointment created: ${data.id}`);
    return { id: data.id?.toString() };
  } catch (error) {
    console.error('[Agenda Book] Dentalink create failed:', error);
    return null;
  }
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: BookingRequest = await req.json();
    console.log('[Agenda Book] Booking request:', {
      lead_id: body.lead_id,
      type: body.appointment_type,
      date: body.date,
      time: body.time,
    });

    // Validate required fields
    if (!body.lead_id || !body.appointment_type || !body.date || !body.time) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: lead_id, appointment_type, date, time' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.date)) {
      return new Response(
        JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate time format
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(body.time)) {
      return new Response(
        JSON.stringify({ error: 'Invalid time format. Use HH:MM' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate date is in the future
    const appointmentDate = new Date(`${body.date}T${body.time}:00`);
    if (appointmentDate <= new Date()) {
      return new Response(
        JSON.stringify({ error: 'Appointment must be in the future' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lead
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .select('*')
      .eq('id', body.lead_id)
      .single();

    if (leadError || !lead) {
      console.error('[Agenda Book] Lead not found:', body.lead_id);
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if lead is in correct status for booking
    if (!['PAID', 'IA_DONE', 'CHECKOUT_CREATED'].includes(lead.status)) {
      console.error('[Agenda Book] Invalid lead status for booking:', lead.status);
      return new Response(
        JSON.stringify({ error: 'Lead must complete payment before booking' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get appointment type
    const { data: appointmentType, error: typeError } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('code', body.appointment_type)
      .eq('is_active', true)
      .single();

    if (typeError || !appointmentType) {
      console.error('[Agenda Book] Appointment type not found:', body.appointment_type);
      return new Response(
        JSON.stringify({ error: 'Invalid appointment type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing appointment on same date
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('lead_id', body.lead_id)
      .eq('scheduled_date', body.date)
      .eq('status', 'scheduled')
      .single();

    if (existingAppointment) {
      return new Response(
        JSON.stringify({ error: 'You already have an appointment scheduled for this date' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate end time
    const endTime = calculateEndTime(body.time, appointmentType.duration_minutes);
    const startDateTime = `${body.date}T${body.time}:00`;
    const endDateTime = `${body.date}T${endTime}:00`;

    // Create appointment in Dentalink
    const professionalId = body.professional_id || 
      appointmentType.requires_professional_ids?.[0] || 
      'default_prof';

    let dentalinkAppointment = null;
    if (lead.dentalink_patient_id) {
      dentalinkAppointment = await createDentalinkAppointment(
        lead.dentalink_patient_id,
        professionalId,
        startDateTime,
        endDateTime,
        body.notes
      );
    } else {
      console.log('[Agenda Book] No Dentalink patient ID, creating mock appointment');
      dentalinkAppointment = { id: `mock_${Date.now()}` };
    }

    // Create appointment record in Supabase
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        lead_id: body.lead_id,
        appointment_type_id: appointmentType.id,
        dentalink_appointment_id: dentalinkAppointment?.id,
        dentalink_patient_id: lead.dentalink_patient_id,
        dentalink_professional_id: professionalId,
        scheduled_date: body.date,
        scheduled_time: body.time,
        duration_minutes: appointmentType.duration_minutes,
        status: 'scheduled',
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('[Agenda Book] Failed to create appointment:', appointmentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create appointment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update lead status
    await supabase
      .from('funnel_leads')
      .update({
        status: 'SCHEDULED',
        scheduling_preferences: {
          preferred_days: body.preferred_days,
          preferred_time_range: body.preferred_time_range,
        },
        scheduled_at: new Date().toISOString(),
        dentalink_appointment_id: dentalinkAppointment?.id,
      })
      .eq('id', body.lead_id);

    // Save preferences if requested
    if (body.save_preferences && (body.preferred_days || body.preferred_time_range)) {
      await supabase
        .from('patient_scheduling_preferences')
        .upsert({
          lead_id: body.lead_id,
          preferred_days: body.preferred_days || [],
          preferred_time_range: body.preferred_time_range || 'any',
          notes: body.notes,
        }, {
          onConflict: 'lead_id',
        });
    }

    console.log(`[Agenda Book] Appointment created: ${appointment.id}`);

    // Format response
    const formattedDate = new Date(body.date).toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          appointment_id: appointment.id,
          dentalink_id: dentalinkAppointment?.id,
          date: body.date,
          time: body.time,
          end_time: endTime,
          formatted_date: formattedDate,
          formatted_time: body.time,
          appointment_type: {
            name: appointmentType.name,
            duration_minutes: appointmentType.duration_minutes,
          },
          patient: {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
          },
          confirmation_message: `Tu cita para ${appointmentType.name} ha sido confirmada para el ${formattedDate} a las ${body.time}.`,
          instructions: [
            'Llegar 10 minutos antes de la cita',
            'Traer documento de identidad',
            'Si tienes radiografías previas, tráelas contigo',
          ],
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Agenda Book] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
