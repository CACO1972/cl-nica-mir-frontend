import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SignupRequest {
  email: string;
  password?: string;
  full_name: string;
  rut?: string;
  phone?: string;
  redirect_to?: string;
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: SignupRequest = await req.json();
    console.log('[Auth Signup] Request:', { email: body.email, name: body.full_name });

    // Validaciones
    if (!body.email || !body.full_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, full_name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.rut && !isValidRUT(body.rut)) {
      return new Response(
        JSON.stringify({ error: 'Invalid RUT format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verifica si el RUT ya existe
    if (body.rut) {
      const formattedRut = formatRUT(body.rut);
      const { data: existingRut } = await supabase
        .from('profiles')
        .select('id')
        .eq('rut', formattedRut)
        .single();

      if (existingRut) {
        return new Response(
          JSON.stringify({ error: 'This RUT is already registered' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Construye redirect URL
    const baseUrl = supabaseUrl.replace('.supabase.co', '.lovable.app');
    const redirectTo = body.redirect_to || `${baseUrl}/portal`;

    // Crea usuario con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email.toLowerCase().trim(),
      password: body.password || undefined,
      email_confirm: false, // Requiere verificación
      user_metadata: {
        full_name: body.full_name.trim(),
        rut: body.rut ? formatRUT(body.rut) : null,
        phone: body.phone,
      },
    });

    if (authError) {
      console.error('[Auth Signup] Create user error:', authError.message);
      if (authError.message.includes('already registered')) {
        return new Response(
          JSON.stringify({ error: 'This email is already registered' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw authError;
    }

    const userId = authData.user.id;
    console.log(`[Auth Signup] User created: ${userId}`);

    // Actualiza el perfil con datos adicionales
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: body.full_name.trim(),
        rut: body.rut ? formatRUT(body.rut) : null,
        phone: body.phone?.replace(/\D/g, '') || null,
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('[Auth Signup] Profile update error:', profileError);
    }

    // Envía email de verificación (magic link)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: body.email.toLowerCase().trim(),
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (otpError) {
      console.error('[Auth Signup] OTP error:', otpError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user_id: userId,
          email: body.email,
          message: 'Account created. Check your email to verify your account.',
          redirect_to: redirectTo,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth Signup] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
