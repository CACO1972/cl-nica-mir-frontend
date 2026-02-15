const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const apiKey = Deno.env.get('DENTALINK_API_KEY');
  console.log(`[Test] API Key exists: ${!!apiKey}, length: ${apiKey?.length}, first 5 chars: ${apiKey?.substring(0, 5)}`);

  try {
    const response = await fetch('https://api.dentalink.healthatom.com/api/v1/sucursales', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const status = response.status;
    const body = await response.text();
    console.log(`[Test] Dentalink response status: ${status}`);
    console.log(`[Test] Dentalink response body: ${body.substring(0, 500)}`);

    return new Response(
      JSON.stringify({ status, body: JSON.parse(body) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
