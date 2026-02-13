import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface VerifyRequest {
  rut: string;
  otp_code: string;
}

function normalizeRut(rut: string): string {
  const cleaned = rut.replace(/[.\s-]/g, '').toUpperCase();
  if (cleaned.length < 2) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return `${body}-${dv}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: VerifyRequest = await req.json();
    console.log('[Auth Verify OTP] Request for RUT:', body.rut);

    if (!body.rut || !body.otp_code) {
      return new Response(
        JSON.stringify({ error: 'Missing rut or otp_code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalizedRut = normalizeRut(body.rut);

    // Look up the email associated with this RUT
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('rut', normalizedRut)
      .single();

    if (profileError || !profile) {
      console.error('[Auth Verify OTP] Profile not found for RUT:', normalizedRut);
      return new Response(
        JSON.stringify({ error: 'RUT no registrado.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Auth Verify OTP] Verifying OTP for email:', profile.email);

    // Verify the OTP
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email: profile.email,
      token: body.otp_code,
      type: 'email',
    });

    if (authError) {
      console.error('[Auth Verify OTP] Verification failed:', authError.message);
      return new Response(
        JSON.stringify({ error: 'Código inválido o expirado.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.session) {
      return new Response(
        JSON.stringify({ error: 'No session created' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Auth Verify OTP] Success for:', profile.email);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth Verify OTP] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
