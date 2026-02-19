import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
export type FlowType = 'ia_only' | 'ia_plus_specialist' | 'budget_comparison';

export interface SecondOpinionData {
  name: string;
  email: string;
  phone: string;
  rut?: string;
  medical_history?: {
    last_visit: string;
    conditions: string[];
    current_treatment?: string;
  };
  diagnosis: string;
  doubt: string;
  flow_type: FlowType;
  // RX (required)
  rx_data?: string;
  rx_name?: string;
  rx_mime?: string;
  // Budget document (budget_comparison flow)
  budget_data?: string;
  budget_name?: string;
  budget_mime?: string;
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

export interface BudgetItem {
  treatment: string;
  external_price: number;
  miro_price: number;
  notes?: string;
}

export interface BudgetComparisonReport {
  external_total: number;
  miro_total: number;
  savings: number;
  savings_percent: number;
  items: BudgetItem[];
  notes?: string;
  disclaimer: string;
}

export interface BudgetComparisonResponse {
  success: boolean;
  data?: {
    id: string;
    budget_report: BudgetComparisonReport;
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

// ─── API Functions ────────────────────────────────────────────────────────────

export async function createSecondOpinion(data: SecondOpinionData): Promise<CreateResponse> {
  try {
    const { data: response, error } = await supabase.functions.invoke('second-opinion', {
      body: {
        action: 'create',
        name: data.name,
        email: data.email,
        phone: data.phone,
        rut: data.rut,
        medical_history: data.medical_history,
        diagnosis: data.diagnosis,
        doubt: data.doubt,
        flow_type: data.flow_type,
        rx_data: data.rx_data,
        rx_name: data.rx_name,
        rx_mime: data.rx_mime,
        budget_data: data.budget_data,
        budget_name: data.budget_name,
        budget_mime: data.budget_mime,
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

export async function requestBudgetComparison(secondOpinionId: string): Promise<BudgetComparisonResponse> {
  try {
    const { data: response, error } = await supabase.functions.invoke('second-opinion', {
      body: {
        action: 'budget_comparison',
        second_opinion_id: secondOpinionId,
      },
    });

    if (error) {
      console.error('[SecondOpinionAPI] Budget comparison error:', error);
      return { success: false, error: error.message };
    }

    if (response.success && response.data) {
      return {
        success: true,
        data: {
          id: response.data.id,
          budget_report: response.data.budget_report,
        },
      };
    }

    return { success: false, error: response.error || 'Unknown error' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[SecondOpinionAPI] Budget comparison exception:', message);
    return { success: false, error: message };
  }
}

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
