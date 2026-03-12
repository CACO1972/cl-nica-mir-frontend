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
  image_data?: string;
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
    return generateFallbackReport(reason, diagnosis, externalAmount);
  }

  try {
    const systemPrompt = `Eres un odontólogo especialista con 20 años de experiencia clínica, experto en diagnóstico dental integral. Un paciente solicita una segunda opinión sobre un tratamiento propuesto por otro dentista.

Tu rol es analizar toda la información proporcionada y generar un informe clínico detallado, útil y accionable.

INSTRUCCIONES DETALLADAS:
1. Lee cuidadosamente el motivo de consulta y el diagnóstico previo
2. Si hay imagen (radiografía o foto), analiza detalladamente: presencia de caries, estado periodontal, nivel óseo, posición dental, restauraciones existentes, anomalías visibles
3. Evalúa si el diagnóstico previo es consistente con lo que observas
4. Genera hallazgos específicos y detallados (mínimo 4-5 hallazgos)
5. Proporciona recomendaciones clínicas concretas (mínimo 3-4 recomendaciones)
6. Si hay presupuesto externo, analiza si los montos son razonables y estima un ahorro potencial realista (10-25%)
7. Determina el nivel de urgencia basándote en la evidencia clínica

IMPORTANTE: 
- Sé específico y detallado en cada punto, no uses frases genéricas
- Menciona zonas dentales específicas cuando sea posible (ej: "zona de premolares superiores derechos")
- Incluye alternativas de tratamiento cuando corresponda
- El assessment debe ser un párrafo completo de 3-5 oraciones con análisis real del caso`;

    const userMessage = `CASO CLÍNICO PARA SEGUNDA OPINIÓN:

MOTIVO DE CONSULTA: ${reason}

DIAGNÓSTICO PREVIO: ${diagnosis || 'No proporcionado por el paciente'}

CLÍNICA DE ORIGEN: ${clinicName || 'No especificada'}

PRESUPUESTO EXTERNO: ${externalAmount ? `$${externalAmount.toLocaleString('es-CL')} CLP` : 'No proporcionado'}

${imageBase64 ? 'Se adjunta imagen clínica/radiográfica para análisis visual.' : 'No se proporcionó imagen - basar análisis solo en información textual.'}

Por favor genera el informe de segunda opinión completo.`;

    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: userMessage },
    ];

    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: { url: imageBase64 },
      });
    }

    const requestBody: any = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.4,
      tools: [
        {
          type: "function",
          function: {
            name: "generate_second_opinion_report",
            description: "Genera un informe estructurado de segunda opinión dental basado en el análisis clínico del caso.",
            parameters: {
              type: "object",
              properties: {
                assessment: {
                  type: "string",
                  description: "Párrafo de 3-5 oraciones con el análisis clínico detallado del caso, incluyendo observaciones sobre el diagnóstico previo, estado general observado y contexto del tratamiento propuesto."
                },
                key_findings: {
                  type: "array",
                  items: { type: "string" },
                  description: "Lista de 4-6 hallazgos clínicos específicos y detallados. Cada hallazgo debe ser una oración completa con información clínica relevante, mencionando zonas dentales específicas cuando sea posible."
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" },
                  description: "Lista de 3-5 recomendaciones clínicas concretas y accionables. Incluir alternativas de tratamiento, exámenes complementarios sugeridos y pasos a seguir."
                },
                comparison_notes: {
                  type: "string",
                  description: "Análisis del presupuesto externo si fue proporcionado: si los montos son razonables, qué incluye vs qué podría faltar, y sugerencias para el paciente."
                },
                estimated_savings: {
                  type: "number",
                  description: "Estimación de ahorro potencial en CLP si se proporcionó presupuesto externo. Calcular entre 10-25% del monto original basado en alternativas de tratamiento."
                },
                urgency: {
                  type: "string",
                  enum: ["low", "moderate", "high"],
                  description: "Nivel de urgencia clínica: 'low' para casos estéticos o preventivos, 'moderate' para tratamientos necesarios sin urgencia inmediata, 'high' para dolor agudo, infección o riesgo de pérdida dental."
                },
              },
              required: ["assessment", "key_findings", "recommendations", "urgency"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "generate_second_opinion_report" } },
    };

    console.log('[Second Opinion] Calling AI gateway with tool_calls...');
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Second Opinion] AI gateway error:', response.status, errText);
      if (response.status === 429) {
        console.error('[Second Opinion] Rate limited');
      }
      return generateFallbackReport(reason, diagnosis, externalAmount);
    }

    const aiData = await response.json();
    console.log('[Second Opinion] AI response received');
    
    // Extract from tool_calls
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: any;
    
    if (toolCall?.function?.arguments) {
      parsed = JSON.parse(toolCall.function.arguments);
      console.log('[Second Opinion] Parsed tool_call arguments successfully');
    } else {
      // Fallback: try to parse from content
      const rawText = aiData.choices?.[0]?.message?.content || '';
      console.log('[Second Opinion] No tool_calls, trying content parse. Raw:', rawText.substring(0, 200));
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)```/) || rawText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText;
      parsed = JSON.parse(jsonStr);
    }
    
    return {
      assessment: parsed.assessment || 'Análisis completado.',
      key_findings: parsed.key_findings || [],
      recommendations: parsed.recommendations || [],
      comparison_notes: parsed.comparison_notes || undefined,
      estimated_savings: parsed.estimated_savings || undefined,
      urgency: parsed.urgency || 'moderate',
      cta_evaluation_premium: true,
      disclaimer: 'Este informe es orientativo y no constituye un diagnóstico clínico definitivo. Los resultados deben ser validados por un profesional de la salud dental en una evaluación presencial.',
    };
  } catch (error) {
    console.error('[Second Opinion] AI analysis error:', error);
    return generateFallbackReport(reason, diagnosis, externalAmount);
  }
}

function generateFallbackReport(
  reason: string,
  diagnosis: string | null,
  externalAmount: number | null
): IAReport {
  const findings: string[] = [];
  const recommendations: string[] = [];

  // Use reason to create relevant findings
  findings.push(`Motivo de consulta: ${reason}`);
  
  if (diagnosis) {
    findings.push(`Diagnóstico previo reportado: ${diagnosis}. Este diagnóstico requiere validación con examen clínico y radiográfico presencial.`);
    findings.push('Es importante considerar que un diagnóstico puede variar significativamente según la experiencia del profesional y las herramientas diagnósticas utilizadas.');
  } else {
    findings.push('No se proporcionó diagnóstico previo. Una evaluación presencial completa es fundamental para establecer un plan de tratamiento adecuado.');
  }

  findings.push('Se recomienda obtener radiografías panorámica y periapicales de la zona de interés para un diagnóstico más preciso.');

  if (externalAmount && externalAmount > 0) {
    const potentialSavings = Math.round(externalAmount * 0.15);
    findings.push(`Presupuesto externo de $${externalAmount.toLocaleString('es-CL')} CLP recibido para análisis comparativo.`);
    recommendations.push(`Ahorro potencial estimado de $${potentialSavings.toLocaleString('es-CL')} CLP al considerar alternativas de tratamiento y materiales.`);
  }

  recommendations.push('Agendar una Evaluación Presencial Premium con tecnología IA para diagnóstico definitivo con visualización sobre sus propias imágenes.');
  recommendations.push('Solicitar radiografías actualizadas (panorámica y periapicales) si no se han tomado en los últimos 6 meses.');
  recommendations.push('Considerar una evaluación periodontal completa antes de iniciar cualquier tratamiento restaurador.');

  return {
    assessment: `Basado en la información proporcionada sobre "${reason}", hemos realizado un análisis preliminar de su caso. ${diagnosis ? `Su diagnóstico previo de "${diagnosis}" es un punto de partida importante que requiere confirmación con examen clínico directo.` : 'Sin un diagnóstico previo, recomendamos una evaluación integral.'} Para una opinión más precisa, una evaluación presencial con tecnología de IA le permitirá visualizar las opciones de tratamiento directamente sobre sus imágenes.`,
    key_findings: findings,
    recommendations,
    comparison_notes: externalAmount
      ? `Su presupuesto externo de $${externalAmount.toLocaleString('es-CL')} CLP ha sido registrado para análisis comparativo. En la Evaluación Premium le mostraremos alternativas con desglose detallado y tecnología IA para visualización.`
      : undefined,
    estimated_savings: externalAmount ? Math.round(externalAmount * 0.15) : undefined,
    urgency: 'moderate',
    cta_evaluation_premium: true,
    disclaimer: 'Este informe es orientativo y no constituye un diagnóstico clínico definitivo. Los resultados deben ser validados por un profesional de la salud dental en una evaluación presencial.',
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
            findings_count: iaReport.key_findings.length,
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
