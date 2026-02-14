import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SecondOpinionRequest {
  action: 'create' | 'ia_report' | 'specialist_checkout';
  name?: string;
  email?: string;
  phone?: string;
  reason?: string;
  current_diagnosis?: string;
  external_budget_amount?: number;
  external_clinic_name?: string;
  flow_type?: 'ia_only' | 'ia_plus_specialist';
  second_opinion_id?: string;
  // Image upload support
  image_data?: string; // base64
  image_name?: string;
  image_mime?: string;
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

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function generateIAReport(
  reason: string,
  diagnosis: string | null,
  externalAmount: number | null,
  clinicName: string | null,
  imageBase64: string | null,
): Promise<IAReport> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    console.error('[Second Opinion] LOVABLE_API_KEY not configured');
    return generateFallbackReport(diagnosis, externalAmount);
  }

  try {
    const systemPrompt = `Eres un asistente clínico dental especializado en segundas opiniones. Analiza el caso y genera un informe estructurado.

INSTRUCCIONES:
- Evalúa el motivo de consulta, diagnóstico previo y presupuesto externo
- Si hay imagen, analiza signos visibles (caries, inflamación gingival, pérdida ósea, alineación)
- Determina urgencia: low, moderate, high
- Sugiere hallazgos clave y recomendaciones
- Si hay presupuesto externo, estima un ahorro potencial (10-25%)
- Siempre recomienda la Evaluación Presencial Premium

Responde SOLO con JSON válido con esta estructura:
{
  "assessment": "Resumen del análisis en 2-3 oraciones",
  "key_findings": ["hallazgo 1", "hallazgo 2", ...],
  "recommendations": ["recomendación 1", ...],
  "comparison_notes": "Notas sobre presupuesto externo si aplica",
  "estimated_savings": number o null,
  "urgency": "low" | "moderate" | "high",
  "cta_evaluation_premium": true,
  "disclaimer": "Este informe es orientativo y no constituye un diagnóstico clínico."
}`;

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: "text",
        text: `Motivo: ${reason}\nDiagnóstico previo: ${diagnosis || 'No proporcionado'}\nClínica externa: ${clinicName || 'No proporcionada'}\nPresupuesto externo: ${externalAmount ? `$${externalAmount.toLocaleString('es-CL')} CLP` : 'No proporcionado'}`,
      },
    ];

    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageBase64 },
      });
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
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      console.error('[Second Opinion] AI gateway error:', response.status);
      return generateFallbackReport(diagnosis, externalAmount);
    }

    const aiData = await response.json();
    const rawText = aiData.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText;
    
    const parsed = JSON.parse(jsonStr);
    
    return {
      assessment: parsed.assessment || 'Análisis completado.',
      key_findings: parsed.key_findings || [],
      recommendations: parsed.recommendations || [],
      comparison_notes: parsed.comparison_notes,
      estimated_savings: parsed.estimated_savings,
      urgency: parsed.urgency || 'moderate',
      cta_evaluation_premium: parsed.cta_evaluation_premium !== false,
      disclaimer: parsed.disclaimer || 'Este informe es orientativo y no constituye un diagnóstico clínico.',
    };
  } catch (error) {
    console.error('[Second Opinion] AI analysis error:', error);
    return generateFallbackReport(diagnosis, externalAmount);
  }
}

function generateFallbackReport(
  diagnosis: string | null,
  externalAmount: number | null
): IAReport {
  const findings: string[] = [];
  const recommendations: string[] = [];

  if (diagnosis) {
    findings.push(`Diagnóstico reportado: ${diagnosis}`);
    findings.push('Se requiere validación clínica presencial para confirmar hallazgos');
  } else {
    findings.push('Sin diagnóstico previo proporcionado');
    findings.push('Recomendamos una evaluación completa');
  }

  if (externalAmount && externalAmount > 0) {
    const potentialSavings = Math.round(externalAmount * 0.15);
    findings.push(`Presupuesto externo: $${externalAmount.toLocaleString('es-CL')} CLP`);
    recommendations.push(`Potencial ahorro estimado: $${potentialSavings.toLocaleString('es-CL')} CLP`);
  }

  recommendations.push('Evaluación Presencial Premium para diagnóstico definitivo con IA en vivo');
  recommendations.push('Visualización de alternativas de tratamiento sobre sus propias imágenes');
  recommendations.push('Plan de tratamiento personalizado con financiamiento flexible');

  return {
    assessment: 'Basado en la información proporcionada, hemos analizado su caso.',
    key_findings: findings,
    recommendations,
    comparison_notes: externalAmount
      ? 'Su presupuesto externo ha sido analizado. En la Evaluación Premium le mostraremos alternativas con tecnología IA.'
      : undefined,
    estimated_savings: externalAmount ? Math.round(externalAmount * 0.15) : undefined,
    urgency: 'moderate',
    cta_evaluation_premium: true,
    disclaimer: 'Este informe es orientativo y no constituye un diagnóstico clínico. Los resultados deben ser validados por un profesional de la salud dental.',
  };
}

const SPECIALIST_PRICE = 19000;

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
      case 'create': {
        if (!body.name || !body.email || !body.phone || !body.reason) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: name, email, phone, reason' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Store image if provided
        let rxStoragePaths: string[] = [];
        if (body.image_data && body.image_name) {
          try {
            const base64 = body.image_data.includes(',') ? body.image_data.split(',')[1] : body.image_data;
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            const filePath = `second-opinion/${Date.now()}_${body.image_name}`;
            
            const { error: uploadError } = await supabase.storage
              .from('intake-files')
              .upload(filePath, bytes, {
                contentType: body.image_mime || 'image/jpeg',
              });

            if (!uploadError) {
              rxStoragePaths.push(filePath);
            } else {
              console.error('[Second Opinion] Image upload error:', uploadError);
            }
          } catch (e) {
            console.error('[Second Opinion] Image processing error:', e);
          }
        }

        const { data: opinion, error } = await supabase
          .from('second_opinions')
          .insert({
            name: body.name.trim(),
            email: body.email.toLowerCase().trim(),
            phone: body.phone.replace(/\D/g, ''),
            reason: body.reason.trim(),
            current_diagnosis: body.current_diagnosis?.trim(),
            external_budget_amount: body.external_budget_amount,
            external_clinic_name: body.external_clinic_name?.trim(),
            flow_type: body.flow_type || 'ia_only',
            status: 'pending',
            rx_storage_paths: rxStoragePaths.length > 0 ? rxStoragePaths : null,
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
            has_external_budget: !!body.external_budget_amount,
            has_image: rxStoragePaths.length > 0,
          },
        });

        console.log(`[Second Opinion] Created: ${opinion.id}`);

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: opinion.id,
              status: opinion.status,
              flow_type: opinion.flow_type,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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

        await supabase
          .from('second_opinions')
          .update({ status: 'ia_processing' })
          .eq('id', body.second_opinion_id);

        // Get image data if available
        let imageBase64: string | null = null;
        if (opinion.rx_storage_paths && Array.isArray(opinion.rx_storage_paths) && opinion.rx_storage_paths.length > 0) {
          try {
            const { data: fileData } = await supabase.storage
              .from('intake-files')
              .download(opinion.rx_storage_paths[0]);
            
            if (fileData) {
              const buffer = await fileData.arrayBuffer();
              const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
              imageBase64 = `data:image/jpeg;base64,${base64}`;
            }
          } catch (e) {
            console.error('[Second Opinion] Image download error:', e);
          }
        }

        // Generate real IA report
        const iaReport = await generateIAReport(
          opinion.reason,
          opinion.current_diagnosis,
          opinion.external_budget_amount,
          opinion.external_clinic_name,
          imageBase64,
        );

        const { error: updateError } = await supabase
          .from('second_opinions')
          .update({
            ia_report: iaReport,
            ia_completed_at: new Date().toISOString(),
            status: 'ia_done',
          })
          .eq('id', body.second_opinion_id);

        if (updateError) {
          console.error('[Second Opinion] Update error:', updateError);
          throw updateError;
        }

        await supabase.from('analytics_events').insert({
          event_type: 'second_opinion_ia_done',
          event_category: 'second_opinion',
          event_data: {
            urgency: iaReport.urgency,
            has_savings: !!iaReport.estimated_savings,
          },
        });

        console.log(`[Second Opinion] IA report generated: ${body.second_opinion_id}`);

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: body.second_opinion_id,
              ia_report: iaReport,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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

        const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
        if (!accessToken) {
          return new Response(
            JSON.stringify({ error: 'Payment gateway not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const baseUrl = supabaseUrl.replace('.supabase.co', '.lovable.app');

        const preferenceData = {
          items: [{
            title: 'Segunda Opinión con Especialista',
            description: 'Videollamada con especialista + informe IA detallado',
            quantity: 1,
            unit_price: SPECIALIST_PRICE,
            currency_id: 'CLP',
          }],
          payer: {
            name: opinion.name,
            email: opinion.email,
            phone: { number: opinion.phone },
          },
          external_reference: `second_opinion_${opinion.id}`,
          back_urls: {
            success: `${baseUrl}/segunda-opinion/confirmado`,
            failure: `${baseUrl}/segunda-opinion/error`,
            pending: `${baseUrl}/segunda-opinion/pendiente`,
          },
          auto_return: 'approved',
        };

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferenceData),
        });

        if (!mpResponse.ok) {
          const errorText = await mpResponse.text();
          console.error('[Second Opinion] MercadoPago error:', errorText);
          throw new Error('Payment creation failed');
        }

        const mpPreference = await mpResponse.json();

        await supabase
          .from('second_opinions')
          .update({
            payment_status: 'pending',
            status: 'specialist_pending',
          })
          .eq('id', body.second_opinion_id);

        console.log(`[Second Opinion] Specialist checkout created: ${mpPreference.id}`);

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: body.second_opinion_id,
              checkout_url: mpPreference.init_point,
              sandbox_url: mpPreference.sandbox_init_point,
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
