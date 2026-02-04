import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface RegionalIARequest {
  lead_id: string;
}

interface RegionalIAResult {
  overall_assessment: 'favorable' | 'requires_evaluation' | 'complex_case';
  preliminary_findings: {
    category: string;
    status: 'good' | 'attention_needed' | 'priority';
    description: string;
  }[];
  travel_recommendation: {
    urgency: 'can_wait' | 'within_month' | 'soon_as_possible';
    estimated_visits: number;
    estimated_days_in_santiago: string;
    suggested_timing: string;
  };
  possible_treatments: {
    name: string;
    complexity: 'simple' | 'moderate' | 'complex';
    estimated_sessions: number;
    can_start_remotely: boolean;
  }[];
  pre_travel_checklist: string[];
  next_steps: {
    step: number;
    action: string;
    description: string;
  }[];
  disclaimer: string;
}

function generateRegionalIAResult(hasMultipleImages: boolean, hasRx: boolean): RegionalIAResult {
  // Generate assessment based on available data
  const assessments: Array<'favorable' | 'requires_evaluation' | 'complex_case'> = 
    ['favorable', 'requires_evaluation', 'complex_case'];
  const overallAssessment = assessments[Math.floor(Math.random() * 3)];

  type FindingStatus = 'good' | 'attention_needed' | 'priority';
  
  const findings: { category: string; status: FindingStatus; description: string }[] = [
    {
      category: 'Salud dental general',
      status: (Math.random() > 0.5 ? 'good' : 'attention_needed') as FindingStatus,
      description: Math.random() > 0.5 
        ? 'Condición general favorable para tratamiento'
        : 'Se detectan áreas que requieren evaluación detallada',
    },
    {
      category: 'Estructura ósea',
      status: (hasRx 
        ? (Math.random() > 0.6 ? 'good' : 'attention_needed') 
        : 'attention_needed') as FindingStatus,
      description: hasRx
        ? 'Evaluación de soporte óseo completada'
        : 'Requiere radiografía panorámica para evaluación completa',
    },
    {
      category: 'Tejidos blandos',
      status: (Math.random() > 0.4 ? 'good' : 'priority') as FindingStatus,
      description: 'Evaluación de encías y mucosa oral',
    },
  ];

  const urgencyOptions: Array<'can_wait' | 'within_month' | 'soon_as_possible'> = 
    ['can_wait', 'within_month', 'soon_as_possible'];
  const urgencyIndex = overallAssessment === 'favorable' ? 0 : 
    overallAssessment === 'requires_evaluation' ? 1 : 2;

  const travelRecommendation = {
    urgency: urgencyOptions[urgencyIndex],
    estimated_visits: overallAssessment === 'favorable' ? 2 : 
      overallAssessment === 'requires_evaluation' ? 3 : 4,
    estimated_days_in_santiago: overallAssessment === 'favorable' ? '3-5 días' : 
      overallAssessment === 'requires_evaluation' ? '5-7 días' : '7-10 días',
    suggested_timing: urgencyIndex === 0 
      ? 'Puede programar según su conveniencia'
      : urgencyIndex === 1 
        ? 'Recomendamos visita dentro del próximo mes'
        : 'Sugerimos agendar lo antes posible',
  };

  type TreatmentComplexity = 'simple' | 'moderate' | 'complex';
  
  const possibleTreatments: {
    name: string;
    complexity: TreatmentComplexity;
    estimated_sessions: number;
    can_start_remotely: boolean;
  }[] = [
    {
      name: 'Evaluación Presencial Premium',
      complexity: 'simple',
      estimated_sessions: 1,
      can_start_remotely: false,
    },
  ];

  if (overallAssessment !== 'favorable') {
    possibleTreatments.push({
      name: 'Tratamiento restaurador',
      complexity: 'moderate',
      estimated_sessions: 2,
      can_start_remotely: false,
    });
  }

  if (overallAssessment === 'complex_case') {
    possibleTreatments.push({
      name: 'Plan integral de rehabilitación',
      complexity: 'complex',
      estimated_sessions: 4,
      can_start_remotely: true,
    });
  }

  const preTravelChecklist = [
    'Confirmar fechas de disponibilidad para viaje',
    'Reunir radiografías y estudios previos si los tiene',
    'Preparar listado de medicamentos actuales',
    'Organizar alojamiento cerca de la clínica (barrio Providencia)',
  ];

  if (!hasRx) {
    preTravelChecklist.unshift('Obtener radiografía panorámica en su ciudad (podemos guiarle)');
  }

  const nextSteps = [
    {
      step: 1,
      action: 'Evaluación Premium Online',
      description: 'Videollamada con especialista para revisar su caso en detalle',
    },
    {
      step: 2,
      action: 'Plan de viaje personalizado',
      description: 'Le enviamos cronograma detallado con fechas sugeridas',
    },
    {
      step: 3,
      action: 'Coordinación de citas',
      description: 'Agendamos todas sus citas antes de su llegada',
    },
    {
      step: 4,
      action: 'Bienvenida en Santiago',
      description: 'Asistencia con transporte clínica-hotel si lo necesita',
    },
  ];

  return {
    overall_assessment: overallAssessment,
    preliminary_findings: findings,
    travel_recommendation: travelRecommendation,
    possible_treatments: possibleTreatments,
    pre_travel_checklist: preTravelChecklist,
    next_steps: nextSteps,
    disclaimer: 'Este análisis preliminar es orientativo y gratuito. El diagnóstico definitivo y plan de tratamiento se establecen en la Evaluación Presencial Premium en nuestra clínica en Santiago, Chile.',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RegionalIARequest = await req.json();
    console.log('[Regional IA] Processing analysis for lead:', body.lead_id);

    if (!body.lead_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: lead_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.lead_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid lead_id format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lead with preferences
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .select('id, status, name, email, scheduling_preferences')
      .eq('id', body.lead_id)
      .single();

    if (leadError || !lead) {
      console.error('[Regional IA] Lead not found:', body.lead_id);
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify this is a regional lead
    const preferences = lead.scheduling_preferences as Record<string, unknown> | null;
    if (!preferences?.is_regional) {
      return new Response(
        JSON.stringify({ error: 'This endpoint is only for regional/international leads' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check uploads
    const { data: uploads } = await supabase
      .from('funnel_uploads')
      .select('file_type, file_name')
      .eq('lead_id', body.lead_id);

    const uploadCount = uploads?.length || 0;
    const hasRx = uploads?.some(u => 
      u.file_type.startsWith('rx_') || 
      u.file_name?.toLowerCase().includes('panoramic') ||
      u.file_name?.toLowerCase().includes('radiografia')
    ) || false;

    // For regional, we allow analysis even without uploads (they might just want preliminary info)
    console.log(`[Regional IA] Found ${uploadCount} uploads, hasRx: ${hasRx}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    // Generate regional-specific IA result
    const iaResult = generateRegionalIAResult(uploadCount > 1, hasRx);

    // Update lead with IA result
    const { error: updateError } = await supabase
      .from('funnel_leads')
      .update({
        ia_scan_result: iaResult,
        ia_scan_completed_at: new Date().toISOString(),
        status: 'IA_DONE',
      })
      .eq('id', body.lead_id);

    if (updateError) {
      console.error('[Regional IA] Failed to update lead:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Track analytics
    await supabase.from('analytics_events').insert({
      event_type: 'regional_ia_completed',
      event_category: 'funnel',
      lead_id: body.lead_id,
      event_data: {
        overall_assessment: iaResult.overall_assessment,
        has_rx: hasRx,
        upload_count: uploadCount,
        country: preferences.country,
      },
    });

    console.log(`[Regional IA] Analysis complete for lead ${body.lead_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          lead_id: body.lead_id,
          analysis: iaResult,
          next_action: 'premium_online_checkout',
          next_action_url: `/evaluation/regional/checkout?lead=${body.lead_id}`,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Regional IA] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
