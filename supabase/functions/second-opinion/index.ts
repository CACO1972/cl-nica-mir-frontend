import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SecondOpinionRequest {
  action: 'create' | 'ia_report' | 'specialist_checkout';
  // For create
  name?: string;
  email?: string;
  phone?: string;
  reason?: string;
  current_diagnosis?: string;
  external_budget_amount?: number;
  external_clinic_name?: string;
  flow_type?: 'ia_only' | 'ia_plus_specialist';
  // For ia_report and specialist_checkout
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

function generateMockIAReport(
  diagnosis: string | null,
  externalAmount: number | null
): IAReport {
  const findings: string[] = [];
  const recommendations: string[] = [];
  let assessment = 'Basado en la información proporcionada, hemos analizado su caso.';

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
    recommendations.push('Comparamos opciones de tratamiento con tecnología de última generación');
  }

  recommendations.push('Evaluación Presencial Premium para diagnóstico definitivo con IA en vivo');
  recommendations.push('Visualización de alternativas de tratamiento sobre sus propias imágenes');
  recommendations.push('Plan de tratamiento personalizado con financiamiento flexible');

  return {
    assessment,
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

const SPECIALIST_PRICE = 19000; // CLP

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
          })
          .select()
          .single();

        if (error) {
          console.error('[Second Opinion] Create error:', error);
          throw error;
        }

        // Track event
        await supabase.from('analytics_events').insert({
          event_type: 'second_opinion_created',
          event_category: 'second_opinion',
          event_data: {
            flow_type: body.flow_type || 'ia_only',
            has_external_budget: !!body.external_budget_amount,
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

        // Update status
        await supabase
          .from('second_opinions')
          .update({ status: 'ia_processing' })
          .eq('id', body.second_opinion_id);

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate mock IA report
        const iaReport = generateMockIAReport(
          opinion.current_diagnosis,
          opinion.external_budget_amount
        );

        // Save report
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

        // Track event
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

        // Create MercadoPago preference
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

        // Update second opinion
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
