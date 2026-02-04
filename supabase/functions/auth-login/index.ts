import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface LoginRequest {
  identifier: string; // email o RUT
  method?: 'otp' | 'magic_link'; // default: magic_link
  redirect_to?: string;
}

function isValidRUT(rut: string): boolean {
  // Limpia el RUT
  const cleaned = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleaned.length < 8 || cleaned.length > 9) return false;
  
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  
  // Calcula dígito verificador
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
  
  return dv === calculatedDV;
}

function formatRUT(rut: string): string {
  const cleaned = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  return `${body}-${dv}`;
}

function isEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: LoginRequest = await req.json();
    console.log('[Auth Login] Request:', { identifier: body.identifier, method: body.method });

    if (!body.identifier) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: identifier (email or RUT)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let email: string;
    let isRutLogin = false;

    // Determina si es email o RUT
    if (isEmail(body.identifier)) {
      email = body.identifier.toLowerCase().trim();
    } else {
      // Asume que es RUT
      if (!isValidRUT(body.identifier)) {
        return new Response(
          JSON.stringify({ error: 'Invalid RUT format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const formattedRut = formatRUT(body.identifier);
      isRutLogin = true;

      // Busca el email asociado al RUT
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('rut', formattedRut)
        .single();

      if (profileError || !profile) {
        console.log('[Auth Login] RUT not found:', formattedRut);
        return new Response(
          JSON.stringify({ error: 'RUT not registered. Please sign up first.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      email = profile.email;
    }

    console.log(`[Auth Login] Sending ${body.method || 'magic_link'} to: ${email}`);

    // Construye redirect URL
    const baseUrl = supabaseUrl.replace('.supabase.co', '.lovable.app');
    const redirectTo = body.redirect_to || `${baseUrl}/portal`;

    let result;

    if (body.method === 'otp') {
      // Envía OTP por email
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Solo usuarios existentes
        },
      });

      if (error) {
        console.error('[Auth Login] OTP error:', error.message);
        if (error.message.includes('User not found')) {
          return new Response(
            JSON.stringify({ error: 'Email not registered. Please sign up first.' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw error;
      }

      result = {
        method: 'otp',
        message: `OTP sent to ${email}. Check your inbox.`,
        email_masked: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      };
    } else {
      // Magic link (default)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        console.error('[Auth Login] Magic link error:', error.message);
        if (error.message.includes('User not found')) {
          return new Response(
            JSON.stringify({ error: 'Email not registered. Please sign up first.' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw error;
      }

      result = {
        method: 'magic_link',
        message: `Magic link sent to ${email}. Check your inbox.`,
        email_masked: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
        redirect_to: redirectTo,
      };
    }

    console.log('[Auth Login] Success');
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth Login] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
