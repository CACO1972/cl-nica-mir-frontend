import { supabase } from "@/integrations/supabase/client";

// Types
export interface LeadData {
  name: string;
  email: string;
  phone: string;
  rut?: string;
  reason?: string;
  origin?: string;
}

export interface LeadResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
    status: string;
    dentalink_patient_id?: string;
  };
  error?: string;
}

export interface UploadData {
  lead_id: string;
  file_type: 'selfie' | 'rx_panoramic' | 'rx_periapical' | 'photo_intraoral' | 'other';
  file: File;
  metadata?: Record<string, unknown>;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    upload_id: string;
    file_type: string;
    storage_path: string;
  };
  error?: string;
}

export interface IAScanResponse {
  success: boolean;
  data?: {
    lead_id: string;
    ia_result: {
      overall_risk: 'low' | 'moderate' | 'high';
      caries_risk: { level: string; score: number; findings: string[] };
      periodontal_risk: { level: string; score: number; findings: string[] };
      bone_loss_risk: { level: string; score: number; findings: string[] };
      alignment: { level: string; score: number; findings: string[] };
      suggested_treatments: string[];
      urgency: string;
      disclaimer: string;
    };
    completed_at: string;
  };
  error?: string;
}

export interface CheckoutResponse {
  success: boolean;
  data?: {
    preference_id: string;
    init_point: string;
    sandbox_init_point: string;
  };
  error?: string;
}

// API Functions

/**
 * Create a new lead in the funnel
 */
export async function createLead(data: LeadData): Promise<LeadResponse> {
  try {
    const { data: response, error } = await supabase.functions.invoke('funnel-lead', {
      body: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        rut: data.rut,
        reason: data.reason,
        origin: data.origin || 'web',
      },
    });

    if (error) {
      console.error('[FunnelAPI] Lead creation error:', error);
      return { success: false, error: error.message };
    }

    // Map backend response to expected format
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          id: response.data.lead_id, // Backend returns lead_id, frontend expects id
          name: data.name,
          email: data.email,
          status: response.data.status,
        },
      };
    }

    return { success: false, error: response.error || 'Unknown error' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[FunnelAPI] Lead creation exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Upload a file for a lead
 */
export async function uploadFile(data: UploadData): Promise<UploadResponse> {
  try {
    // Convert file to base64
    const base64Data = await fileToBase64(data.file);

    const { data: response, error } = await supabase.functions.invoke('funnel-upload', {
      body: {
        lead_id: data.lead_id,
        file_type: data.file_type,
        file_name: data.file.name,
        file_data: base64Data,
        mime_type: data.file.type,
        metadata: data.metadata,
      },
    });

    if (error) {
      console.error('[FunnelAPI] Upload error:', error);
      return { success: false, error: error.message };
    }

    return response as UploadResponse;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[FunnelAPI] Upload exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Trigger IA scan for a lead
 */
export async function triggerIAScan(leadId: string): Promise<IAScanResponse> {
  try {
    const { data: response, error } = await supabase.functions.invoke('funnel-ia-scan', {
      body: { lead_id: leadId },
    });

    if (error) {
      console.error('[FunnelAPI] IA scan error:', error);
      return { success: false, error: error.message };
    }

    // Map backend response to expected format
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          lead_id: response.data.lead_id,
          ia_result: response.data.scan_result, // Backend returns scan_result, frontend expects ia_result
          completed_at: new Date().toISOString(),
        },
      };
    }

    return { success: false, error: response.error || 'Unknown error' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[FunnelAPI] IA scan exception:', message);
    return { success: false, error: message };
  }
}

/**
 * Create checkout preference for payment
 */
export async function createCheckout(
  leadId: string,
  urls?: { success?: string; failure?: string; pending?: string }
): Promise<CheckoutResponse> {
  try {
    const baseUrl = window.location.origin;
    
    const { data: response, error } = await supabase.functions.invoke('funnel-checkout', {
      body: {
        lead_id: leadId,
        success_url: urls?.success || `${baseUrl}/evaluation?payment=success`,
        failure_url: urls?.failure || `${baseUrl}/evaluation?payment=failure`,
        pending_url: urls?.pending || `${baseUrl}/evaluation?payment=pending`,
      },
    });

    if (error) {
      console.error('[FunnelAPI] Checkout error:', error);
      return { success: false, error: error.message };
    }

    // Map backend response to expected format
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          preference_id: response.data.preference_id,
          init_point: response.data.checkout_url, // Backend returns checkout_url
          sandbox_init_point: response.data.sandbox_url, // Backend returns sandbox_url
        },
      };
    }

    return { success: false, error: response.error || 'Unknown error' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('[FunnelAPI] Checkout exception:', message);
    return { success: false, error: message };
  }
}

// Utility functions

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
