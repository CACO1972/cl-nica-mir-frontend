import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface MetricsRequest {
  action: 'track_event' | 'get_dashboard' | 'get_funnel_metrics';
  // For track_event
  event_type?: string;
  event_category?: string;
  event_data?: Record<string, unknown>;
  lead_id?: string;
  session_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  // For get_dashboard / get_funnel_metrics
  start_date?: string;
  end_date?: string;
}

interface FunnelMetrics {
  total_leads: number;
  leads_by_status: Record<string, number>;
  conversion_rates: {
    lead_to_ia: number;
    ia_to_checkout: number;
    checkout_to_paid: number;
    paid_to_scheduled: number;
    overall: number;
  };
  revenue: {
    total: number;
    average_per_lead: number;
  };
  top_sources: Array<{ source: string; count: number }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: MetricsRequest = await req.json();
    console.log('[Metrics]', body.action);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    switch (body.action) {
      case 'track_event': {
        if (!body.event_type) {
          return new Response(
            JSON.stringify({ error: 'Missing event_type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase.from('analytics_events').insert({
          lead_id: body.lead_id,
          session_id: body.session_id,
          event_type: body.event_type,
          event_category: body.event_category,
          event_data: body.event_data || {},
          utm_source: body.utm_source,
          utm_medium: body.utm_medium,
          utm_campaign: body.utm_campaign,
          referrer: body.referrer,
        });

        if (error) {
          console.error('[Metrics] Track error:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_funnel_metrics': {
        const startDate = body.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = body.end_date || new Date().toISOString().split('T')[0];

        // Get leads by status
        const { data: leads } = await supabase
          .from('funnel_leads')
          .select('status, origin, created_at')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59');

        const leadsByStatus: Record<string, number> = {};
        const sourceCount: Record<string, number> = {};

        (leads || []).forEach(lead => {
          leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
          const source = lead.origin || 'direct';
          sourceCount[source] = (sourceCount[source] || 0) + 1;
        });

        const totalLeads = leads?.length || 0;
        const iaDone = (leadsByStatus['IA_DONE'] || 0) + (leadsByStatus['CHECKOUT_CREATED'] || 0) + 
                       (leadsByStatus['PAID'] || 0) + (leadsByStatus['SCHEDULED'] || 0);
        const checkoutCreated = (leadsByStatus['CHECKOUT_CREATED'] || 0) + 
                                (leadsByStatus['PAID'] || 0) + (leadsByStatus['SCHEDULED'] || 0);
        const paid = (leadsByStatus['PAID'] || 0) + (leadsByStatus['SCHEDULED'] || 0);
        const scheduled = leadsByStatus['SCHEDULED'] || 0;

        // Get revenue
        const { data: payments } = await supabase
          .from('funnel_payments')
          .select('amount')
          .eq('status', 'approved')
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59');

        const totalRevenue = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

        const metrics: FunnelMetrics = {
          total_leads: totalLeads,
          leads_by_status: leadsByStatus,
          conversion_rates: {
            lead_to_ia: totalLeads > 0 ? (iaDone / totalLeads) * 100 : 0,
            ia_to_checkout: iaDone > 0 ? (checkoutCreated / iaDone) * 100 : 0,
            checkout_to_paid: checkoutCreated > 0 ? (paid / checkoutCreated) * 100 : 0,
            paid_to_scheduled: paid > 0 ? (scheduled / paid) * 100 : 0,
            overall: totalLeads > 0 ? (scheduled / totalLeads) * 100 : 0,
          },
          revenue: {
            total: totalRevenue,
            average_per_lead: totalLeads > 0 ? totalRevenue / totalLeads : 0,
          },
          top_sources: Object.entries(sourceCount)
            .map(([source, count]) => ({ source, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
        };

        return new Response(
          JSON.stringify({ success: true, data: metrics }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_dashboard': {
        const startDate = body.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = body.end_date || new Date().toISOString().split('T')[0];

        // Parallel queries
        const [
          { count: totalLeads },
          { count: totalAppointments },
          { count: totalPaidPayments },
          { data: recentEvents },
        ] = await Promise.all([
          supabase.from('funnel_leads').select('*', { count: 'exact', head: true })
            .gte('created_at', startDate),
          supabase.from('appointments').select('*', { count: 'exact', head: true })
            .gte('created_at', startDate),
          supabase.from('funnel_payments').select('*', { count: 'exact', head: true })
            .eq('status', 'approved')
            .gte('created_at', startDate),
          supabase.from('analytics_events')
            .select('event_type, event_category, created_at')
            .gte('created_at', startDate)
            .order('created_at', { ascending: false })
            .limit(100),
        ]);

        // Event breakdown
        const eventBreakdown: Record<string, number> = {};
        (recentEvents || []).forEach(e => {
          eventBreakdown[e.event_type] = (eventBreakdown[e.event_type] || 0) + 1;
        });

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              period: { start: startDate, end: endDate },
              summary: {
                total_leads: totalLeads || 0,
                total_appointments: totalAppointments || 0,
                total_paid_payments: totalPaidPayments || 0,
              },
              event_breakdown: eventBreakdown,
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
    console.error('[Metrics] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
