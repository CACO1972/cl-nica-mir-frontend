import { supabase } from "@/integrations/supabase/client";

// Types
export interface SecondOpinionData {
  name: string;
  email: string;
  phone: string;
  reason: string;
  current_diagnosis?: string;
  external_budget_amount?: number;
  external_clinic_name?: string;
  flow_type: 'ia_only' | 'ia_plus_specialist';
}

export interface CreateResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    flow_type: string;
  };
  error?: string;
}

export interface IAReport {
  assessment: string;
  key_findings: string[];
  recommendations: string[];
  comparison_notes?: string;
  estimated_savings?: number;
  urgency: 'low' | 'moderate' | 'high';
  cta_evaluation_premium: boolean;
  disclaimer: string;
}

export interface IAReportResponse {
  success: boolean;
  data?: {
    id: string;
    ia_report: IAReport;
  };
  error?: string;
}

export interface SpecialistCheckoutResponse {
  success: boolean;
  data?: {
    id: string;
    checkout_url: string;
    sandbox_url: string;
    amount: number;
    currency: string;
  };
  error?: string;
}

/**
 * Create a new second opinion request
 */
export async function createSecondOpinion(data: SecondOpinionData): Promise<CreateResponse> {
  try {
    const { data: response, error } = await supabase.functions.invoke('second-opinion', {
      body: {
        action: 'create',
        name: data.name,
        email: data.email,
        phone: data.phone,
        reason: data.reason,
        current_diagnosis: data.current_diagnosis,
        external_budget_amount: data.external_budget_amount,
        external_clinic_name: data.external_clinic_name,
        flow_type: data.flow_type,
      },
    });

    if (error) {
      console.error('[SecondOpinionAPI] Create error:', error);
      return { success: false, error: error.message };
    }

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          id: response.data.id,
          status: response.data.status,
          flow_type: response.data.flow_type,
        },
      };
    }

    return { success: false, error: response.error || 'Unknown error' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[SecondOpinionAPI] Create exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Request IA analysis report for a second opinion
 */
export async function requestIAReport(secondOpinionId: string): Promise<IAReportResponse> {
  try {
    const { data: response, error } = await supabase.functions.invoke('second-opinion', {
      body: {
        action: 'ia_report',
        second_opinion_id: secondOpinionId,
      },
    });

    if (error) {
      console.error('[SecondOpinionAPI] IA report error:', error);
      return { success: false, error: error.message };
    }

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          id: response.data.id,
          ia_report: response.data.ia_report,
        },
      };
    }

    return { success: false, error: response.error || 'Unknown error' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[SecondOpinionAPI] IA report exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Create checkout for specialist consultation
 */
export async function createSpecialistCheckout(secondOpinionId: string): Promise<SpecialistCheckoutResponse> {
  try {
    const { data: response, error } = await supabase.functions.invoke('second-opinion', {
      body: {
        action: 'specialist_checkout',
        second_opinion_id: secondOpinionId,
      },
    });

    if (error) {
      console.error('[SecondOpinionAPI] Specialist checkout error:', error);
      return { success: false, error: error.message };
    }

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          id: response.data.id,
          checkout_url: response.data.checkout_url,
          sandbox_url: response.data.sandbox_url,
          amount: response.data.amount,
          currency: response.data.currency,
        },
      };
    }

    return { success: false, error: response.error || 'Unknown error' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[SecondOpinionAPI] Specialist checkout exception:', message);
    return { success: false, error: message };
  }
}
