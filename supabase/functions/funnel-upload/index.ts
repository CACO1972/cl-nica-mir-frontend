import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf', // For RX PDFs
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadRequest {
  lead_id: string;
  file_type: 'selfie' | 'rx_panoramic' | 'rx_periapical' | 'photo_intraoral' | 'other';
  file_name: string;
  file_data: string; // Base64 encoded
  mime_type: string;
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: UploadRequest = await req.json();
    console.log('[Funnel Upload] Processing upload:', { 
      lead_id: body.lead_id, 
      file_type: body.file_type,
      file_name: body.file_name 
    });

    // Validate required fields
    if (!body.lead_id || !body.file_type || !body.file_name || !body.file_data || !body.mime_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.lead_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid lead_id format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(body.mime_type)) {
      return new Response(
        JSON.stringify({ error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode base64 and check size
    let fileBuffer: Uint8Array;
    try {
      const base64Data = body.file_data.replace(/^data:[^;]+;base64,/, '');
      fileBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid base64 file data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (fileBuffer.length > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify lead exists
    const { data: lead, error: leadError } = await supabase
      .from('funnel_leads')
      .select('id, status')
      .eq('id', body.lead_id)
      .single();

    if (leadError || !lead) {
      console.error('[Funnel Upload] Lead not found:', body.lead_id);
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique storage path
    const timestamp = Date.now();
    const fileExt = body.file_name.split('.').pop() || 'jpg';
    const storagePath = `${body.lead_id}/${body.file_type}_${timestamp}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('intake-files')
      .upload(storagePath, fileBuffer, {
        contentType: body.mime_type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Funnel Upload] Storage error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record upload in database
    const { data: upload, error: dbError } = await supabase
      .from('funnel_uploads')
      .insert({
        lead_id: body.lead_id,
        file_type: body.file_type,
        storage_path: storagePath,
        file_name: body.file_name,
        file_size: fileBuffer.length,
        mime_type: body.mime_type,
        metadata: body.metadata || {},
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Funnel Upload] Database error:', dbError);
      // Try to clean up uploaded file
      await supabase.storage.from('intake-files').remove([storagePath]);
      return new Response(
        JSON.stringify({ error: 'Failed to record upload' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Funnel Upload] Upload complete: ${upload.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          upload_id: upload.id,
          file_type: upload.file_type,
          storage_path: upload.storage_path,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Funnel Upload] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
