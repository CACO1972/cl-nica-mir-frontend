import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface SecondOpinionRequest {
  action: 'create' | 'ia_report' | 'specialist_checkout' | 'budget_comparison';
  // Create
  name?: string;
  email?: string;
  phone?: string;
  rut?: string;
  medical_history?: {
    last_visit: string;
    conditions: string[];
    current_treatment?: string;
  };
  diagnosis?: string;
  doubt?: string;
  flow_type?: 'ia_only' | 'ia_plus_specialist' | 'budget_comparison';
  // RX image
  rx_data?: string;
  rx_name?: string;
  rx_mime?: string;
  // Budget document
  budget_data?: string;
  budget_name?: string;
  budget_mime?: string;
  // For subsequent actions
  second_opinion_id?: string;
}

interface IAReport {
  assessment: string;
  key_findings: string[];
  recommendations: string[];
  comparison_notes?: string;
  estimated_savings?: number;
  urgency: 'low' | 'moderate' | 'high';
  cta_evaluation_premium: boolean;
  disclaimer: string;
}

interface BudgetItem {
  treatment: string;
  external_price: number;
  miro_price: number;
  notes?: string;
}

interface BudgetReport {
  external_total: number;
  miro_total: number;
  savings: number;
  savings_percent: number;
  items: BudgetItem[];
  notes?: string;
  disclaimer: string;
}

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const SPECIALIST_PRICE = 19000;

// ─── IA Report generation ─────────────────────────────────────────────────────
async function generateIAReport(
  diagnosis: string,
  doubt: string,
  medicalHistory: string,
  imageBase64: string | null,
): Promise<IAReport> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    console.error('[Second Opinion] LOVABLE_API_KEY not configured');
    return generateFallbackIAReport(diagnosis);
  }

  try {
    const systemPrompt = `Eres un asistente clínico dental especializado en segundas opiniones. Analiza el caso y genera un informe estructurado en español.

INSTRUCCIONES:
- Evalúa el diagnóstico previo del paciente, su duda específica e historial médico
- Si hay radiografía, analiza signos visibles (caries, inflamación gingival, pérdida ósea, alineación, tratamientos previos)
- Responde directamente la duda específica del paciente
- Determina urgencia: low, moderate, high
- Sé específico y claro, usa lenguaje accesible para el paciente
- Siempre recomienda la Evaluación Presencial Premium de Clínica Miró

Responde SOLO con JSON válido con esta estructura exacta:
{
  "assessment": "Respuesta directa a la duda del paciente y evaluación general en 3-4 oraciones",
  "key_findings": ["hallazgo específico 1", "hallazgo específico 2", ...],
  "recommendations": ["recomendación concreta 1", ...],
  "comparison_notes": null,
  "estimated_savings": null,
  "urgency": "low" | "moderate" | "high",
  "cta_evaluation_premium": true,
  "disclaimer": "Este informe es orientativo y no constituye un diagnóstico clínico certificado. Los resultados deben ser validados por un profesional de la salud dental en una evaluación presencial."
}`;

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: "text",
        text: `DIAGNÓSTICO RECIBIDO: ${diagnosis}\n\nDUDA ESPECÍFICA DEL PACIENTE: ${doubt}\n\nHISTORIAL MÉDICO DENTAL: ${medicalHistory}`,
      },
    ];

    if (imageBase64) {
      userContent.push({ type: "image_url", image_url: { url: imageBase64 } });
    }

    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('[Second Opinion] AI gateway error:', response.status);
      return generateFallbackIAReport(diagnosis);
    }

    const aiData = await response.json();
    const rawText = aiData.choices?.[0]?.message?.content || '';
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText;
    const parsed = JSON.parse(jsonStr.trim());

    return {
      assessment: parsed.assessment || 'Análisis completado.',
      key_findings: parsed.key_findings || [],
      recommendations: parsed.recommendations || [],
      comparison_notes: parsed.comparison_notes || undefined,
      estimated_savings: parsed.estimated_savings || undefined,
      urgency: parsed.urgency || 'moderate',
      cta_evaluation_premium: true,
      disclaimer: parsed.disclaimer || 'Este informe es orientativo y no constituye un diagnóstico clínico.',
    };
  } catch (error) {
    console.error('[Second Opinion] AI analysis error:', error);
    return generateFallbackIAReport(diagnosis);
  }
}

function generateFallbackIAReport(diagnosis: string): IAReport {
  return {
    assessment: `Hemos recibido su caso. Diagnóstico reportado: ${diagnosis}. Para una evaluación completa y validación clínica, recomendamos la Evaluación Presencial Premium.`,
    key_findings: [
      'Diagnóstico recibido registrado correctamente',
      'Se requiere validación clínica presencial para confirmar hallazgos',
      'La radiografía ha sido recibida para análisis por el especialista',
    ],
    recommendations: [
      'Evaluación Presencial Premium con IA en vivo sobre sus propias imágenes',
      'Consulta con especialista para plan de tratamiento personalizado',
      'Comparación de alternativas de tratamiento con tecnología de punta',
    ],
    urgency: 'moderate',
    cta_evaluation_premium: true,
    disclaimer: 'Este informe es orientativo y no constituye un diagnóstico clínico. Los resultados deben ser validados por un profesional.',
  };
}

// ─── Budget comparison with OCR ───────────────────────────────────────────────
async function generateBudgetComparison(
  diagnosis: string,
  doubt: string,
  budgetImageBase64: string | null,
): Promise<BudgetReport> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    console.error('[Second Opinion] LOVABLE_API_KEY not configured for budget comparison');
    return generateFallbackBudgetReport();
  }

  try {
    const systemPrompt = `Eres un experto en aranceles dentales de Chile. Tu tarea es:
1. Si hay imagen del presupuesto, extrae cada ítem con OCR (tratamiento y precio)
2. Compara cada ítem con los aranceles de Clínica Miró (basados en el arancel CONTINENTAL LINK, que es el estándar dental chileno)
3. Los precios de Clínica Miró son competitivos — generalmente entre 10% y 30% más económicos para implantes y rehabilitaciones complejas, similares en procedimientos simples

ARANCELES DE REFERENCIA CLÍNICA MIRÓ (CLP aproximados, 2024):
- Implante unitario (incluye corona): $850.000 - $1.200.000
- Corona metal-porcelana: $280.000 - $350.000
- Corona zirconio: $380.000 - $480.000
- Extracción simple: $45.000 - $65.000
- Extracción quirúrgica (ej. muela del juicio): $120.000 - $180.000
- Elevación de seno (lateral): $650.000 - $900.000
- Regeneración ósea guiada: $450.000 - $700.000
- Ortodoncia (tratamiento completo): $1.800.000 - $2.800.000
- Blanqueamiento: $150.000 - $220.000
- Limpieza profesional: $45.000 - $65.000
- Obturación (resina): $55.000 - $85.000
- Endodoncia molar: $180.000 - $250.000
- Prótesis parcial removible: $350.000 - $550.000
- Prótesis total: $450.000 - $680.000
- Carilla de porcelana: $280.000 - $420.000

Responde SOLO con JSON válido:
{
  "items": [
    {
      "treatment": "nombre del tratamiento",
      "external_price": número (precio del presupuesto externo),
      "miro_price": número (precio estimado en Clínica Miró),
      "notes": "nota breve si aplica"
    }
  ],
  "external_total": número,
  "miro_total": número,
  "savings": número,
  "savings_percent": número (redondeado),
  "notes": "observaciones generales del presupuesto",
  "disclaimer": "Los precios son aproximados y pueden variar según complejidad del caso. Solicita una evaluación presencial para un presupuesto exacto."
}`;

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: "text",
        text: `Contexto del caso: ${diagnosis}\nDuda del paciente: ${doubt}\n\n${budgetImageBase64 ? 'Analiza el presupuesto adjunto aplicando OCR y extrae cada ítem.' : 'No se adjuntó presupuesto. Proporciona estimados genéricos basados en el diagnóstico descrito.'}`,
      },
    ];

    if (budgetImageBase64) {
      userContent.push({ type: "image_url", image_url: { url: budgetImageBase64 } });
    }

    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      console.error('[Second Opinion] Budget AI error:', response.status);
      return generateFallbackBudgetReport();
    }

    const aiData = await response.json();
    const rawText = aiData.choices?.[0]?.message?.content || '';
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText;
    const parsed = JSON.parse(jsonStr.trim());

    const items: BudgetItem[] = (parsed.items || []).map((item: BudgetItem) => ({
      treatment: item.treatment,
      external_price: item.external_price || 0,
      miro_price: item.miro_price || 0,
      notes: item.notes,
    }));

    const extTotal = parsed.external_total || items.reduce((s: number, i: BudgetItem) => s + i.external_price, 0);
    const miroTotal = parsed.miro_total || items.reduce((s: number, i: BudgetItem) => s + i.miro_price, 0);
    const savings = extTotal - miroTotal;
    const savingsPercent = extTotal > 0 ? Math.round((savings / extTotal) * 100) : 0;

    return {
      items,
      external_total: extTotal,
      miro_total: miroTotal,
      savings: Math.max(0, savings),
      savings_percent: Math.max(0, savingsPercent),
      notes: parsed.notes,
      disclaimer: parsed.disclaimer || 'Los precios son aproximados. Solicita evaluación presencial para presupuesto exacto.',
    };
  } catch (error) {
    console.error('[Second Opinion] Budget comparison error:', error);
    return generateFallbackBudgetReport();
  }
}

function generateFallbackBudgetReport(): BudgetReport {
  return {
    items: [],
    external_total: 0,
    miro_total: 0,
    savings: 0,
    savings_percent: 0,
    notes: 'No fue posible procesar el presupuesto automáticamente. Un especialista de Clínica Miró lo revisará y te contactará.',
    disclaimer: 'Los precios son aproximados. Solicita evaluación presencial para un presupuesto exacto.',
  };
}

// ─── HTTP Handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: SecondOpinionRequest = await req.json();
    console.log('[Second Opinion]', body.action);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (body.action) {

      // ── CREATE ──────────────────────────────────────────────────────────────
      case 'create': {
        if (!body.name || !body.email || !body.phone || !body.diagnosis || !body.doubt) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: name, email, phone, diagnosis, doubt' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Upload RX image
        let rxStoragePaths: string[] = [];
        if (body.rx_data && body.rx_name) {
          try {
            const base64 = body.rx_data.includes(',') ? body.rx_data.split(',')[1] : body.rx_data;
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            const filePath = `second-opinion/rx_${Date.now()}_${body.rx_name}`;
            const { error: uploadError } = await supabase.storage
              .from('intake-files')
              .upload(filePath, bytes, { contentType: body.rx_mime || 'image/jpeg' });
            if (!uploadError) rxStoragePaths.push(filePath);
            else console.error('[Second Opinion] RX upload error:', uploadError);
          } catch (e) {
            console.error('[Second Opinion] RX processing error:', e);
          }
        }

        // Upload budget document
        let budgetStoragePath: string | null = null;
        if (body.budget_data && body.budget_name) {
          try {
            const base64 = body.budget_data.includes(',') ? body.budget_data.split(',')[1] : body.budget_data;
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            const filePath = `second-opinion/budget_${Date.now()}_${body.budget_name}`;
            const { error: uploadError } = await supabase.storage
              .from('intake-files')
              .upload(filePath, bytes, { contentType: body.budget_mime || 'application/pdf' });
            if (!uploadError) budgetStoragePath = filePath;
            else console.error('[Second Opinion] Budget upload error:', uploadError);
          } catch (e) {
            console.error('[Second Opinion] Budget processing error:', e);
          }
        }

        const { data: opinion, error } = await supabase
          .from('second_opinions')
          .insert({
            name: body.name.trim(),
            email: body.email.toLowerCase().trim(),
            phone: body.phone.replace(/\D/g, ''),
            reason: body.diagnosis.trim(), // stored in 'reason' column
            current_diagnosis: body.doubt?.trim(), // stored doubt in current_diagnosis
            flow_type: body.flow_type || 'ia_only',
            status: 'pending',
            rx_storage_paths: rxStoragePaths.length > 0 ? rxStoragePaths : [],
            budget_document_path: budgetStoragePath,
            has_rx: rxStoragePaths.length > 0,
          })
          .select()
          .single();

        if (error) {
          console.error('[Second Opinion] Create error:', error);
          throw error;
        }

        await supabase.from('analytics_events').insert({
          event_type: 'second_opinion_created',
          event_category: 'second_opinion',
          event_data: {
            flow_type: body.flow_type || 'ia_only',
            has_rx: rxStoragePaths.length > 0,
            has_budget: !!budgetStoragePath,
          },
        });

        console.log(`[Second Opinion] Created: ${opinion.id}`);
        return new Response(
          JSON.stringify({ success: true, data: { id: opinion.id, status: opinion.status, flow_type: opinion.flow_type } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ── IA REPORT ────────────────────────────────────────────────────────────
      case 'ia_report': {
        if (!body.second_opinion_id) {
          return new Response(
            JSON.stringify({ error: 'Missing second_opinion_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: opinion, error: fetchError } = await supabase
          .from('second_opinions')
          .select('*')
          .eq('id', body.second_opinion_id)
          .single();

        if (fetchError || !opinion) {
          return new Response(
            JSON.stringify({ error: 'Second opinion not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabase.from('second_opinions').update({ status: 'ia_processing' }).eq('id', body.second_opinion_id);

        // Download RX image if available
        let imageBase64: string | null = null;
        if (opinion.rx_storage_paths && Array.isArray(opinion.rx_storage_paths) && opinion.rx_storage_paths.length > 0) {
          try {
            const { data: fileData } = await supabase.storage.from('intake-files').download(opinion.rx_storage_paths[0]);
            if (fileData) {
              const buffer = await fileData.arrayBuffer();
              const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
              imageBase64 = `data:image/jpeg;base64,${base64}`;
            }
          } catch (e) {
            console.error('[Second Opinion] Image download error:', e);
          }
        }

        // Build medical history string
        const medicalHistory = `Última visita al dentista: ${opinion.reason || 'No indicado'}`;
        const doubt = opinion.current_diagnosis || 'No especificada';
        const diagnosis = opinion.reason || '';

        const iaReport = await generateIAReport(diagnosis, doubt, medicalHistory, imageBase64);

        await supabase.from('second_opinions').update({
          ia_report: iaReport,
          ia_completed_at: new Date().toISOString(),
          status: 'ia_done',
        }).eq('id', body.second_opinion_id);

        await supabase.from('analytics_events').insert({
          event_type: 'second_opinion_ia_done',
          event_category: 'second_opinion',
          event_data: { urgency: iaReport.urgency },
        });

        console.log(`[Second Opinion] IA report generated: ${body.second_opinion_id}`);
        return new Response(
          JSON.stringify({ success: true, data: { id: body.second_opinion_id, ia_report: iaReport } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ── BUDGET COMPARISON ────────────────────────────────────────────────────
      case 'budget_comparison': {
        if (!body.second_opinion_id) {
          return new Response(
            JSON.stringify({ error: 'Missing second_opinion_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: opinion, error: fetchError } = await supabase
          .from('second_opinions')
          .select('*')
          .eq('id', body.second_opinion_id)
          .single();

        if (fetchError || !opinion) {
          return new Response(
            JSON.stringify({ error: 'Second opinion not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await supabase.from('second_opinions').update({ status: 'ia_processing' }).eq('id', body.second_opinion_id);

        // Download budget document
        let budgetBase64: string | null = null;
        if (opinion.budget_document_path) {
          try {
            const { data: fileData } = await supabase.storage.from('intake-files').download(opinion.budget_document_path);
            if (fileData) {
              const buffer = await fileData.arrayBuffer();
              const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
              const mime = opinion.budget_document_path.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
              budgetBase64 = `data:${mime};base64,${base64}`;
            }
          } catch (e) {
            console.error('[Second Opinion] Budget download error:', e);
          }
        }

        const budgetReport = await generateBudgetComparison(
          opinion.reason || '',
          opinion.current_diagnosis || '',
          budgetBase64,
        );

        // Store budget report in ia_report field (reuse)
        await supabase.from('second_opinions').update({
          ia_report: budgetReport,
          ia_completed_at: new Date().toISOString(),
          status: 'ia_done',
        }).eq('id', body.second_opinion_id);

        await supabase.from('analytics_events').insert({
          event_type: 'second_opinion_budget_done',
          event_category: 'second_opinion',
          event_data: {
            savings: budgetReport.savings,
            savings_percent: budgetReport.savings_percent,
          },
        });

        console.log(`[Second Opinion] Budget comparison done: ${body.second_opinion_id}`);
        return new Response(
          JSON.stringify({ success: true, data: { id: body.second_opinion_id, budget_report: budgetReport } }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ── SPECIALIST CHECKOUT ──────────────────────────────────────────────────
      case 'specialist_checkout': {
        if (!body.second_opinion_id) {
          return new Response(
            JSON.stringify({ error: 'Missing second_opinion_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: opinion, error: fetchError } = await supabase
          .from('second_opinions')
          .select('*')
          .eq('id', body.second_opinion_id)
          .single();

        if (fetchError || !opinion) {
          return new Response(
            JSON.stringify({ error: 'Second opinion not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const flowApiKey = Deno.env.get('FLOW_API_KEY');
        const flowSecretKey = Deno.env.get('FLOW_SECRET_KEY');
        
        if (!flowApiKey || !flowSecretKey) {
          return new Response(
            JSON.stringify({ error: 'Payment gateway not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Build Flow.cl payment
        const baseUrl = 'https://miro-patient-portal.lovable.app';
        const params: Record<string, string> = {
          apiKey: flowApiKey,
          commerceOrder: `so_${opinion.id.slice(0, 8)}_${Date.now()}`,
          subject: 'Segunda Opinión con Especialista - Clínica Miró',
          currency: 'CLP',
          amount: String(SPECIALIST_PRICE),
          email: opinion.email,
          urlConfirmation: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago`,
          urlReturn: `${baseUrl}/segunda-opinion/confirmado`,
        };

        // Sort params and sign
        const sortedKeys = Object.keys(params).sort();
        const toSign = sortedKeys.map(k => `${k}${params[k]}`).join('');
        const keyBytes = new TextEncoder().encode(flowSecretKey);
        const msgBytes = new TextEncoder().encode(toSign);
        const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgBytes);
        const signature = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        params.s = signature;

        const formBody = Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
        const flowResponse = await fetch('https://www.flow.cl/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody,
        });

        if (!flowResponse.ok) {
          const errText = await flowResponse.text();
          console.error('[Second Opinion] Flow error:', errText);
          throw new Error('Payment creation failed');
        }

        const flowData = await flowResponse.json();
        const checkoutUrl = `${flowData.url}?token=${flowData.token}`;

        await supabase.from('second_opinions').update({
          payment_status: 'pending',
          status: 'specialist_pending',
        }).eq('id', body.second_opinion_id);

        console.log(`[Second Opinion] Specialist checkout created`);
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: body.second_opinion_id,
              checkout_url: checkoutUrl,
              sandbox_url: checkoutUrl,
              amount: SPECIALIST_PRICE,
              currency: 'CLP',
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Second Opinion] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
