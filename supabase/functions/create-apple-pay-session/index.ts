import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { corsHeaders } from '../shared/cors.ts';

Deno.serve(async (req) => {
  console.log('=== APPLE PAY SESSION VALIDATION REQUEST ===');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth token
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    console.log('[create-apple-pay-session] Authenticated user:', user.id);

    // Parse request body
    const body = await req.json();
    const { validation_url, merchant_id, domain_name, display_name } = body;

    // Validate required fields
    if (!validation_url || !merchant_id || !domain_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: validation_url, merchant_id, domain_name'
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('[create-apple-pay-session] Validating merchant session:', {
      merchant_id,
      domain_name,
      validation_url
    });

    // Fetch merchant's Finix identity from database
    const { data: merchantData, error: merchantError } = await supabase
      .from('merchants')
      .select('finix_merchant_id, finix_identity_id')
      .eq('id', merchant_id)
      .single();

    if (merchantError || !merchantData?.finix_identity_id) {
      console.error('[create-apple-pay-session] Merchant not found:', merchantError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Merchant not found or missing Finix identity'
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    const finixMerchantIdentity = merchantData.finix_identity_id;
    console.log('[create-apple-pay-session] Finix merchant identity:', finixMerchantIdentity);

    // Get Finix credentials
    const finixAppId = Deno.env.get('FINIX_APPLICATION_ID');
    const finixApiSecret = Deno.env.get('FINIX_API_SECRET');
    const finixEnv = Deno.env.get('FINIX_ENVIRONMENT') || 'sandbox';
    
    if (!finixAppId || !finixApiSecret) {
      console.error('[create-apple-pay-session] Missing Finix credentials');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Finix credentials not configured'
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    const finixBaseUrl = finixEnv === 'live' 
      ? 'https://finix.live'
      : 'https://finix.sandbox-payments-api.com';

    // Call Finix API to create Apple Pay session
    const finixResponse = await fetch(`${finixBaseUrl}/apple_pay_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${finixAppId}:${finixApiSecret}`)
      },
      body: JSON.stringify({
        display_name: display_name || 'Muni Now',
        domain: domain_name,
        merchant_identity: finixMerchantIdentity,
        validation_url: validation_url
      })
    });

    const finixData = await finixResponse.json();

    if (!finixResponse.ok) {
      console.error('[create-apple-pay-session] Finix API error:', finixData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: finixData.message || 'Failed to create Apple Pay session',
          details: finixData
        }),
        { status: finixResponse.status, headers: corsHeaders }
      );
    }

    console.log('[create-apple-pay-session] Session created successfully');

    return new Response(
      JSON.stringify({
        success: true,
        session_details: finixData.session_details
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[create-apple-pay-session] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Apple Pay session'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
