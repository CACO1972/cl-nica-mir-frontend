import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function normalizeRut(rut: string): string {
  const cleaned = rut.replace(/[.\s-]/g, '').toUpperCase();
  if (cleaned.length < 2) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return `${body}-${dv}`;
}

function isValidRUT(rut: string): boolean {
  const cleaned = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleaned.length < 8 || cleaned.length > 9) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expected = 11 - (sum % 11);
  const calculated = expected === 11 ? '0' : expected === 10 ? 'K' : expected.toString();
  return dv === calculated;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { rut } = await req.json();

    if (!rut || !isValidRUT(rut)) {
      return new Response(
        JSON.stringify({ error: 'RUT inválido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedRut = normalizeRut(rut);
    console.log('[Auth RUT Login] Looking up:', normalizedRut);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find profile by RUT
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email, full_name')
      .eq('rut', normalizedRut)
      .single();

    if (profileError || !profile) {
      console.log('[Auth RUT Login] RUT not found:', normalizedRut);
      return new Response(
        JSON.stringify({ error: 'RUT no registrado. Completa tu evaluación para crear tu ficha.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a session for this user using admin API
    // We use generateLink to create a magic link, then extract the token
    // Actually, the simplest approach: use admin.createUser or signInWithOtp
    // Best approach for instant login: generate a session directly
    
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: profile.email,
    });

    if (authError || !authData) {
      console.error('[Auth RUT Login] Generate link error:', authError?.message);
      throw authError || new Error('Failed to generate auth link');
    }

    // Verify the OTP from the generated link to get a session
    const otpToken = authData.properties?.hashed_token;
    
    if (!otpToken) {
      // Fallback: use signInWithOtp and auto-verify
      // Generate a deterministic OTP-like flow
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: profile.email,
        options: { shouldCreateUser: false },
      });

      if (otpError) {
        console.error('[Auth RUT Login] OTP error:', otpError.message);
        throw otpError;
      }

      // We can't auto-verify without the token, so use admin API
      // Let's try admin.generateLink with type 'magiclink' and verify immediately
      return new Response(
        JSON.stringify({ error: 'Unable to create session. Try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the generated token to create a session
    const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: otpToken,
      type: 'magiclink',
    });

    if (verifyError || !sessionData.session) {
      console.error('[Auth RUT Login] Verify error:', verifyError?.message);
      return new Response(
        JSON.stringify({ error: 'Error al crear sesión.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Auth RUT Login] Session created for:', profile.email);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
          user: {
            email: profile.email,
            full_name: profile.full_name,
          },
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth RUT Login] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
