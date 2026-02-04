import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DENTALINK_API_URL = "https://api.dentalink.healthatom.com/api/v1";

interface AgendaOptionsRequest {
  appointment_type: string; // 'evaluation_premium', 'implant_consult', etc.
  lead_id?: string;
  preferred_days?: string[]; // ['monday', 'tuesday', ...]
  preferred_time_range?: 'morning' | 'afternoon' | 'evening' | 'any';
  num_options?: number; // default 5
}

interface TimeSlot {
  date: string; // ISO date
  time: string; // HH:MM
  end_time: string;
  professional_id?: string;
  professional_name?: string;
  score: number; // ranking score for sorting
}

// Time ranges in 24h format
const TIME_RANGES = {
  morning: { start: 9, end: 13 },
  afternoon: { start: 13, end: 18 },
  evening: { start: 18, end: 21 },
  any: { start: 9, end: 21 },
};

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

async function getDentalinkAvailability(date: string, professionalId?: string): Promise<TimeSlot[]> {
  const apiKey = Deno.env.get('DENTALINK_API_KEY');
  
  if (!apiKey) {
    console.log('[Agenda Options] DENTALINK_API_KEY not configured, using mock data');
    return generateMockSlots(date);
  }

  try {
    let endpoint = `/agenda/disponibilidad?fecha=${date}`;
    if (professionalId) {
      endpoint += `&id_profesional=${professionalId}`;
    }

    const response = await fetch(`${DENTALINK_API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[Agenda Options] Dentalink error: ${response.status}`);
      return generateMockSlots(date);
    }

    const data = await response.json();
    
    // Transform Dentalink response to our format
    const slots: TimeSlot[] = [];
    if (data.data && Array.isArray(data.data)) {
      for (const slot of data.data) {
        slots.push({
          date: date,
          time: slot.hora_inicio,
          end_time: slot.hora_termino,
          professional_id: slot.id_profesional?.toString(),
          professional_name: slot.nombre_profesional,
          score: 0,
        });
      }
    }

    return slots;
  } catch (error) {
    console.error('[Agenda Options] Dentalink fetch failed:', error);
    return generateMockSlots(date);
  }
}

function generateMockSlots(date: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  // Slots de 2 horas para acomodar citas largas (Evaluación Premium = 90 min)
  const baseHours = [9, 11, 14, 16, 18];
  
  // Generate 3-4 random slots
  const numSlots = 3 + Math.floor(Math.random() * 2);
  const shuffled = baseHours.sort(() => Math.random() - 0.5).slice(0, numSlots);
  
  for (const hour of shuffled.sort((a, b) => a - b)) {
    slots.push({
      date: date,
      time: `${hour.toString().padStart(2, '0')}:00`,
      end_time: `${(hour + 2).toString().padStart(2, '0')}:00`, // 2 hour slots
      professional_id: 'mock_prof_1',
      professional_name: 'Dr. Miró',
      score: 0,
    });
  }

  return slots;
}

function scoreSlot(
  slot: TimeSlot,
  preferences: {
    preferred_days: string[];
    preferred_time_range: string;
  }
): number {
  let score = 50; // base score

  const slotDate = new Date(slot.date);
  const dayName = DAY_NAMES[slotDate.getDay()];
  const hour = parseInt(slot.time.split(':')[0]);

  // Day preference bonus
  if (preferences.preferred_days.length > 0) {
    if (preferences.preferred_days.includes(dayName)) {
      score += 30;
    }
  }

  // Time range bonus
  const range = TIME_RANGES[preferences.preferred_time_range as keyof typeof TIME_RANGES] || TIME_RANGES.any;
  if (hour >= range.start && hour < range.end) {
    score += 20;
  }

  // Prefer earlier dates slightly
  const daysFromNow = Math.floor((slotDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysFromNow <= 7) {
    score += 10;
  } else if (daysFromNow <= 14) {
    score += 5;
  }

  // Random factor for variety
  score += Math.random() * 5;

  return score;
}

function getDateRange(minDays: number, maxDays: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  
  for (let i = minDays; i <= maxDays && dates.length < 14; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    // Skip Sundays (clinic closed)
    if (date.getDay() === 0) continue;
    
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: AgendaOptionsRequest = await req.json();
    console.log('[Agenda Options] Request:', { 
      type: body.appointment_type, 
      lead: body.lead_id,
      days: body.preferred_days,
      time: body.preferred_time_range 
    });

    if (!body.appointment_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: appointment_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get appointment type config
    const { data: appointmentType, error: typeError } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('code', body.appointment_type)
      .eq('is_active', true)
      .single();

    if (typeError || !appointmentType) {
      console.error('[Agenda Options] Appointment type not found:', body.appointment_type);
      return new Response(
        JSON.stringify({ error: 'Invalid appointment type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get patient preferences if lead_id provided
    let patientPrefs = {
      preferred_days: body.preferred_days || [],
      preferred_time_range: body.preferred_time_range || 'any',
    };

    if (body.lead_id) {
      const { data: savedPrefs } = await supabase
        .from('patient_scheduling_preferences')
        .select('*')
        .eq('lead_id', body.lead_id)
        .single();

      if (savedPrefs) {
        patientPrefs = {
          preferred_days: savedPrefs.preferred_days || patientPrefs.preferred_days,
          preferred_time_range: savedPrefs.preferred_time_range || patientPrefs.preferred_time_range,
        };
      }
    }

    // Calculate date range based on appointment type config
    const minHoursAdvance = appointmentType.min_hours_advance || 24;
    const maxDaysAdvance = appointmentType.max_days_advance || 60;
    const minDays = Math.ceil(minHoursAdvance / 24);
    
    const dates = getDateRange(minDays, maxDaysAdvance);
    console.log(`[Agenda Options] Checking ${dates.length} dates`);

    // Fetch availability for each date (limit to first 7 for performance)
    const allSlots: TimeSlot[] = [];
    const datesToCheck = dates.slice(0, 7);

    for (const date of datesToCheck) {
      const daySlots = await getDentalinkAvailability(
        date,
        appointmentType.requires_professional_ids?.[0]
      );
      
      // Filter slots by duration requirement
      for (const slot of daySlots) {
        const slotStart = parseInt(slot.time.split(':')[0]) * 60 + parseInt(slot.time.split(':')[1]);
        const slotEnd = parseInt(slot.end_time.split(':')[0]) * 60 + parseInt(slot.end_time.split(':')[1]);
        const slotDuration = slotEnd - slotStart;

        // Check if slot is long enough (including buffers)
        const requiredDuration = appointmentType.duration_minutes + 
          (appointmentType.buffer_before_minutes || 0) + 
          (appointmentType.buffer_after_minutes || 0);

        if (slotDuration >= requiredDuration) {
          // Score the slot based on preferences
          slot.score = scoreSlot(slot, patientPrefs);
          allSlots.push(slot);
        }
      }
    }

    // Sort by score and take top N options
    const numOptions = body.num_options || 5;
    const topSlots = allSlots
      .sort((a, b) => b.score - a.score)
      .slice(0, numOptions);

    console.log(`[Agenda Options] Found ${allSlots.length} slots, returning ${topSlots.length}`);

    // Format response
    const options = topSlots.map((slot, index) => ({
      id: `${slot.date}_${slot.time.replace(':', '')}`,
      rank: index + 1,
      date: slot.date,
      time: slot.time,
      end_time: slot.end_time,
      professional_name: slot.professional_name,
      professional_id: slot.professional_id,
      formatted_date: new Date(slot.date).toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      formatted_time: slot.time,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          appointment_type: {
            code: appointmentType.code,
            name: appointmentType.name,
            duration_minutes: appointmentType.duration_minutes,
            price_clp: appointmentType.price_clp,
          },
          options,
          preferences_applied: patientPrefs,
          has_more: allSlots.length > numOptions,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Agenda Options] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
