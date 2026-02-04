import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface IAScanRequest {
  lead_id: string;
}

interface IAScanResult {
  overall_risk: 'low' | 'moderate' | 'high';
  caries_risk: {
    level: 'low' | 'moderate' | 'high';
    score: number; // 0-100
    findings: string[];
  };
  periodontal_risk: {
    level: 'low' | 'moderate' | 'high';
    score: number;
    findings: string[];
  };
  bone_loss_risk: {
    level: 'low' | 'moderate' | 'high';
    score: number;
    findings: string[];
  };
  alignment: {
    level: 'good' | 'moderate' | 'needs_attention';
    score: number;
    findings: string[];
  };
  suggested_treatments: string[];
  urgency: 'routine' | 'soon' | 'urgent';
  disclaimer: string;
}

// Mock IA analysis - simulates Scandent/clinical AI
function generateMockIAResult(hasRx: boolean, uploadCount: number): IAScanResult {
  // Generate somewhat realistic random scores
  const cariesScore = Math.floor(Math.random() * 60) + 20; // 20-80
  const perioScore = Math.floor(Math.random() * 50) + 15; // 15-65
  const boneScore = hasRx ? Math.floor(Math.random() * 40) + 10 : 30; // Lower if no RX
  const alignScore = Math.floor(Math.random() * 70) + 30; // 30-100

  const getRiskLevel = (score: number): 'low' | 'moderate' | 'high' => {
    if (score < 35) return 'low';
    if (score < 65) return 'moderate';
    return 'high';
  };

  const getAlignmentLevel = (score: number): 'good' | 'moderate' | 'needs_attention' => {
    if (score >= 70) return 'good';
    if (score >= 40) return 'moderate';
    return 'needs_attention';
  };

  const cariesRisk = getRiskLevel(cariesScore);
  const perioRisk = getRiskLevel(perioScore);
  const boneRisk = getRiskLevel(boneScore);

  // Calculate overall risk
  const avgScore = (cariesScore + perioScore + boneScore) / 3;
  const overallRisk = getRiskLevel(avgScore);

  // Generate findings based on scores
  const cariesFindings: string[] = [];
  if (cariesScore > 40) cariesFindings.push('Posibles áreas de desmineralización detectadas');
  if (cariesScore > 60) cariesFindings.push('Se recomienda evaluación de lesiones interproximales');
  if (cariesFindings.length === 0) cariesFindings.push('Sin hallazgos significativos en análisis preliminar');

  const perioFindings: string[] = [];
  if (perioScore > 35) perioFindings.push('Posible inflamación gingival leve');
  if (perioScore > 55) perioFindings.push('Se sugiere evaluación periodontal completa');
  if (perioFindings.length === 0) perioFindings.push('Encías aparentemente saludables');

  const boneFindings: string[] = [];
  if (!hasRx) {
    boneFindings.push('Análisis óseo limitado sin radiografía panorámica');
  } else {
    if (boneScore > 30) boneFindings.push('Evaluación de niveles óseos recomendada');
    if (boneScore > 50) boneFindings.push('Posible pérdida ósea horizontal detectada');
  }
  if (boneFindings.length === 0) boneFindings.push('Niveles óseos dentro de parámetros normales');

  const alignFindings: string[] = [];
  if (alignScore < 50) alignFindings.push('Posible apiñamiento o malposición dental');
  if (alignScore < 30) alignFindings.push('Se recomienda evaluación ortodóncica');
  if (alignFindings.length === 0) alignFindings.push('Alineación dental aceptable');

  // Suggest treatments based on findings
  const treatments: string[] = [];
  if (cariesRisk !== 'low') treatments.push('Tratamiento restaurador preventivo');
  if (perioRisk !== 'low') treatments.push('Terapia periodontal');
  if (boneRisk === 'high') treatments.push('Evaluación implantológica');
  if (alignScore < 50) treatments.push('Ortodoncia o alineadores');
  if (treatments.length === 0) treatments.push('Mantención preventiva');

  // Determine urgency
  let urgency: 'routine' | 'soon' | 'urgent' = 'routine';
  if (overallRisk === 'moderate') urgency = 'soon';
  if (overallRisk === 'high' || boneRisk === 'high') urgency = 'urgent';

  return {
    overall_risk: overallRisk,
    caries_risk: {
      level: cariesRisk,
      score: cariesScore,
      findings: cariesFindings,
    },
    periodontal_risk: {
      level: perioRisk,
      score: perioScore,
      findings: perioFindings,
    },
    bone_loss_risk: {
      level: boneRisk,
      score: boneScore,
      findings: boneFindings,
    },
    alignment: {
      level: getAlignmentLevel(alignScore),
      score: alignScore,
      findings: alignFindings,
    },
    suggested_treatments: treatments,
    urgency,
    disclaimer: 'Este análisis es orientativo y no constituye un diagnóstico clínico. Los resultados deben ser validados por un profesional de la salud dental en la Evaluación Presencial Premium.',
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: IAScanRequest = await req.json();
    console.log('[Funnel IA Scan] Processing scan for lead:', body.lead_id);

    // Validate lead_id
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

    // Get lead and uploads
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .select('id, status, name')
      .eq('id', body.lead_id)
      .single();

    if (leadError || !lead) {
      console.error('[Funnel IA Scan] Lead not found:', body.lead_id);
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check uploads
    const { data: uploads } = await supabase
      .from('funnel_uploads')
      .select('file_type')
      .eq('lead_id', body.lead_id);

    const uploadCount = uploads?.length || 0;
    const hasRx = uploads?.some(u => u.file_type.startsWith('rx_')) || false;

    if (uploadCount === 0) {
      return new Response(
        JSON.stringify({ error: 'No images uploaded for this lead. Please upload at least one image.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Funnel IA Scan] Found ${uploadCount} uploads, hasRx: ${hasRx}`);

    // Simulate processing delay (1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate mock IA result
    const iaResult = generateMockIAResult(hasRx, uploadCount);

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
      console.error('[Funnel IA Scan] Failed to update lead:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save scan results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Funnel IA Scan] Scan complete for lead ${body.lead_id}, risk: ${iaResult.overall_risk}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          lead_id: body.lead_id,
          scan_result: iaResult,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Funnel IA Scan] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
