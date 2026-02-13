import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface IAScanRequest {
  lead_id: string;
}

interface IAScanResult {
  overall_risk: 'low' | 'moderate' | 'high';
  caries_risk: {
    level: string;
    score: number;
    findings: string[];
  };
  periodontal_risk: {
    level: string;
    score: number;
    findings: string[];
  };
  bone_loss_risk: {
    level: string;
    score: number;
    findings: string[];
  };
  alignment: {
    level: string;
    score: number;
    findings: string[];
  };
  suggested_treatments: string[];
  urgency: string;
  disclaimer: string;
}

const SYSTEM_PROMPT = `Eres un sistema de IA de pre-diagnóstico dental. Analiza las imágenes clínicas proporcionadas (selfies intraorales, radiografías panorámicas, periapicales, fotos) y genera un informe estructurado de riesgo.

IMPORTANTE: Este es un análisis orientativo, NO un diagnóstico clínico. Siempre incluye el disclaimer.

Debes responder EXCLUSIVAMENTE con el JSON estructurado usando la función proporcionada.

Criterios de evaluación:
- Caries: manchas oscuras, desmineralización, cavidades visibles
- Periodontal: inflamación gingival, retracción, sangrado aparente, sarro
- Pérdida ósea: solo evaluable con radiografías (si no hay RX, indicar "limitado")
- Alineación: apiñamiento, espacios, malposición, mordida

Scores: 0-100 donde 0=sin riesgo, 100=riesgo máximo
Niveles: low (<35), moderate (35-65), high (>65)
Urgencia: routine, soon, urgent`;

async function getImageBase64FromStorage(
  supabase: ReturnType<typeof createClient>,
  storagePath: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const { data, error } = await supabase.storage
      .from('intake-files')
      .download(storagePath);

    if (error || !data) {
      console.error(`[IA Scan] Failed to download ${storagePath}:`, error);
      return null;
    }

    // Check minimum file size (skip test/placeholder files)
    const arrayBuffer = await data.arrayBuffer();
    if (arrayBuffer.byteLength < 1000) {
      console.warn(`[IA Scan] File too small (${arrayBuffer.byteLength} bytes), likely placeholder: ${storagePath}`);
      return null;
    }

    // Encode in chunks to avoid stack overflow with large files
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64 = btoa(binary);
    const mimeType = data.type || 'image/jpeg';

    console.log(`[IA Scan] Image loaded: ${storagePath} (${arrayBuffer.byteLength} bytes)`);
    return { base64, mimeType };
  } catch (err) {
    console.error(`[IA Scan] Error processing ${storagePath}:`, err);
    return null;
  }
}

async function analyzeWithAI(
  images: Array<{ base64: string; mimeType: string; fileType: string }>,
  hasRx: boolean
): Promise<IAScanResult> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  // Build content array with images
  const contentParts: Array<Record<string, unknown>> = [];

  // Add text context
  const imageTypes = images.map(i => i.fileType).join(', ');
  contentParts.push({
    type: "text",
    text: `Analiza estas ${images.length} imágenes dentales (tipos: ${imageTypes}). ${hasRx ? 'Incluye radiografías para análisis óseo.' : 'No hay radiografías disponibles, el análisis óseo será limitado.'} Genera el informe de riesgo usando la función suggest_dental_analysis.`
  });

  // Add each image
  for (const img of images) {
    contentParts.push({
      type: "image_url",
      image_url: {
        url: `data:${img.mimeType};base64,${img.base64}`
      }
    });
  }

  const response = await fetch(AI_GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: contentParts }
      ],
      tools: [{
        type: "function",
        function: {
          name: "suggest_dental_analysis",
          description: "Structured dental risk analysis result",
          parameters: {
            type: "object",
            properties: {
              overall_risk: { type: "string", enum: ["low", "moderate", "high"] },
              caries_risk: {
                type: "object",
                properties: {
                  level: { type: "string", enum: ["low", "moderate", "high"] },
                  score: { type: "number", minimum: 0, maximum: 100 },
                  findings: { type: "array", items: { type: "string" } }
                },
                required: ["level", "score", "findings"]
              },
              periodontal_risk: {
                type: "object",
                properties: {
                  level: { type: "string", enum: ["low", "moderate", "high"] },
                  score: { type: "number", minimum: 0, maximum: 100 },
                  findings: { type: "array", items: { type: "string" } }
                },
                required: ["level", "score", "findings"]
              },
              bone_loss_risk: {
                type: "object",
                properties: {
                  level: { type: "string", enum: ["low", "moderate", "high"] },
                  score: { type: "number", minimum: 0, maximum: 100 },
                  findings: { type: "array", items: { type: "string" } }
                },
                required: ["level", "score", "findings"]
              },
              alignment: {
                type: "object",
                properties: {
                  level: { type: "string", enum: ["good", "moderate", "needs_attention"] },
                  score: { type: "number", minimum: 0, maximum: 100 },
                  findings: { type: "array", items: { type: "string" } }
                },
                required: ["level", "score", "findings"]
              },
              suggested_treatments: { type: "array", items: { type: "string" } },
              urgency: { type: "string", enum: ["routine", "soon", "urgent"] }
            },
            required: ["overall_risk", "caries_risk", "periodontal_risk", "bone_loss_risk", "alignment", "suggested_treatments", "urgency"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "suggest_dental_analysis" } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[IA Scan] AI Gateway error: ${response.status} - ${errorText}`);

    if (response.status === 429) {
      throw new Error('AI rate limit exceeded. Please try again in a moment.');
    }
    if (response.status === 402) {
      throw new Error('AI service credits exhausted. Please contact support.');
    }
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const aiResponse = await response.json();
  console.log('[IA Scan] AI response received');

  // Extract tool call result
  const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) {
    console.error('[IA Scan] No tool call in AI response:', JSON.stringify(aiResponse));
    throw new Error('AI did not return structured analysis');
  }

  let analysisResult: IAScanResult;
  try {
    const parsed = typeof toolCall.function.arguments === 'string'
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;

    analysisResult = {
      ...parsed,
      disclaimer: 'Este análisis es orientativo y fue generado por inteligencia artificial. No constituye un diagnóstico clínico. Los resultados deben ser validados por un profesional de la salud dental en la Evaluación Presencial Premium.',
    };
  } catch (parseError) {
    console.error('[IA Scan] Failed to parse AI result:', parseError);
    throw new Error('Failed to parse AI analysis');
  }

  return analysisResult;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: IAScanRequest = await req.json();
    console.log('[IA Scan] Processing scan for lead:', body.lead_id);

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

    // Get lead
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .select('id, status, name')
      .eq('id', body.lead_id)
      .single();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get uploads
    const { data: uploads } = await supabase
      .from('funnel_uploads')
      .select('file_type, storage_path, mime_type')
      .eq('lead_id', body.lead_id);

    if (!uploads || uploads.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No images uploaded for this lead. Please upload at least one image.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hasRx = uploads.some(u => u.file_type.startsWith('rx_'));
    console.log(`[IA Scan] Found ${uploads.length} uploads, hasRx: ${hasRx}`);

    // Download images from storage
    const images: Array<{ base64: string; mimeType: string; fileType: string }> = [];
    for (const upload of uploads) {
      const imageData = await getImageBase64FromStorage(supabase, upload.storage_path);
      if (imageData) {
        images.push({
          base64: imageData.base64,
          mimeType: imageData.mimeType,
          fileType: upload.file_type,
        });
      }
    }

    if (images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not process uploaded images' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[IA Scan] Analyzing ${images.length} images with AI...`);

    // Analyze with real AI
    const iaResult = await analyzeWithAI(images, hasRx);

    // Update lead with result
    const { error: updateError } = await supabase
      .from('funnel_leads')
      .update({
        ia_scan_result: iaResult,
        ia_scan_completed_at: new Date().toISOString(),
        status: 'IA_DONE',
      })
      .eq('id', body.lead_id);

    if (updateError) {
      console.error('[IA Scan] Failed to update lead:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save scan results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[IA Scan] Scan complete for lead ${body.lead_id}, risk: ${iaResult.overall_risk}`);

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
    console.error('[IA Scan] Error:', errorMessage);

    const status = errorMessage.includes('rate limit') ? 429
      : errorMessage.includes('credits') ? 402
      : 500;

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
