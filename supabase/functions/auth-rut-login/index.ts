import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DENTALINK_API_URL = "https://api.dentalink.healthatom.com/api/v1";

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

async function dentalinkSearchByRut(rut: string): Promise<Record<string, unknown> | null> {
  const apiKey = Deno.env.get('DENTALINK_API_KEY');
  if (!apiKey) {
    console.error('[Auth RUT Login] DENTALINK_API_KEY not configured');
    return null;
  }

  try {
    const query = JSON.stringify({ rut: { eq: rut } });
    const response = await fetch(`${DENTALINK_API_URL}/pacientes?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`[Auth RUT Login] Dentalink search error: ${response.status}`);
      return null;
    }

    const result = await response.json();
    const patients = result?.data || result?.results || [];

    if (Array.isArray(patients) && patients.length > 0) {
      console.log(`[Auth RUT Login] Found ${patients.length} patient(s) in Dentalink for RUT: ${rut}`);
      return patients[0];
    }

    console.log(`[Auth RUT Login] No Dentalink patient found for RUT: ${rut}`);
    return null;
  } catch (error) {
    console.error('[Auth RUT Login] Dentalink search error:', error instanceof Error ? error.message : error);
    return null;
  }
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

    // 1. Find profile by RUT in local DB
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, email, full_name')
      .eq('rut', normalizedRut)
      .single();

    let userEmail: string;
    let userName: string;

    if (profile) {
      // Found locally
      console.log('[Auth RUT Login] Found local profile:', profile.email);
      userEmail = profile.email;
      userName = profile.full_name;
    } else {
      // 2. Not found locally → search Dentalink
      console.log('[Auth RUT Login] RUT not in local DB, searching Dentalink...');
      const dentalinkPatient = await dentalinkSearchByRut(normalizedRut);

      if (!dentalinkPatient) {
        return new Response(
          JSON.stringify({ error: 'RUT no encontrado. Completa tu evaluación para crear tu ficha.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Extract patient info from Dentalink
      const patientEmail = String(dentalinkPatient.email || dentalinkPatient.correo || '');
      const patientName = [
        dentalinkPatient.nombre || dentalinkPatient.nombres || '',
        dentalinkPatient.apellidos || dentalinkPatient.apellido || '',
      ].filter(Boolean).join(' ').trim();
      const patientPhone = String(dentalinkPatient.telefono || dentalinkPatient.celular || '');
      const dentalinkId = String(dentalinkPatient.id_paciente || dentalinkPatient.id || '');

      if (!patientEmail) {
        return new Response(
          JSON.stringify({ error: 'Paciente encontrado en Dentalink pero sin email registrado. Contacta a la clínica.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[Auth RUT Login] Dentalink patient found: ${patientName} (${patientEmail}), ID: ${dentalinkId}`);

      // 3. Check if a user with this email already exists in auth
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === patientEmail);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        console.log(`[Auth RUT Login] Existing auth user found: ${userId}`);

        // Update profile with RUT and Dentalink ID if needed
        await supabase
          .from('profiles')
          .update({ rut: normalizedRut, dentalink_patient_id: dentalinkId || null })
          .eq('user_id', userId);
      } else {
        // 4. Create new auth user
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: patientEmail,
          email_confirm: true,
          user_metadata: { full_name: patientName },
        });

        if (createError || !newUser?.user) {
          console.error('[Auth RUT Login] Create user error:', createError?.message);
          return new Response(
            JSON.stringify({ error: 'Error al crear cuenta. Intenta nuevamente.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        userId = newUser.user.id;
        console.log(`[Auth RUT Login] Created new auth user: ${userId}`);

        // Profile is auto-created by handle_new_user trigger, update it with RUT + Dentalink
        // Small delay to let trigger execute
        await new Promise(resolve => setTimeout(resolve, 500));

        await supabase
          .from('profiles')
          .update({
            rut: normalizedRut,
            dentalink_patient_id: dentalinkId || null,
            full_name: patientName || patientEmail,
            phone: patientPhone || null,
          })
          .eq('user_id', userId);
      }

      userEmail = patientEmail;
      userName = patientName || patientEmail;
    }

    // 5. Generate session via magic link verification
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
    });

    if (authError || !authData) {
      console.error('[Auth RUT Login] Generate link error:', authError?.message);
      throw authError || new Error('Failed to generate auth link');
    }

    const otpToken = authData.properties?.hashed_token;

    if (!otpToken) {
      return new Response(
        JSON.stringify({ error: 'Error al crear sesión. Intenta nuevamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    console.log('[Auth RUT Login] Session created for:', userEmail);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
          user: {
            email: userEmail,
            full_name: userName,
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
