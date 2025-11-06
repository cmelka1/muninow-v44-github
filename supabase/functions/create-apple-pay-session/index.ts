import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';
import { corsHeaders } from '../shared/cors.ts';

Deno.serve(async (req) => {
  const requestStartTime = Date.now();
  console.log('🍎 ========================================');
  console.log('🍎 APPLE PAY SESSION VALIDATION REQUEST');
  console.log('🍎 ========================================');
  console.log('🍎 Timestamp:', new Date().toISOString());
  console.log('🍎 Request URL:', req.url);
  console.log('🍎 Request Method:', req.method);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('🍎 CORS preflight request handled');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth token (optional for guest checkout)
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    let userId: string | undefined;

    if (authHeader) {
      const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader);
      
      if (userError || !user) {
        console.warn('[create-apple-pay-session] Invalid auth token, proceeding as guest');
      } else {
        userId = user.id;
        console.log('[create-apple-pay-session] Authenticated user:', userId);
      }
    } else {
      console.log('[create-apple-pay-session] Guest checkout - no auth token');
    }

    // Parse request body
    const body = await req.json();
    const { validation_url, merchant_id, domain_name, display_name } = body;
    
    console.log('🍎 📦 Request Body:');
    console.log('🍎   - Validation URL:', validation_url);
    console.log('🍎   - Merchant ID:', merchant_id);
    console.log('🍎   - Domain Name:', domain_name);
    console.log('🍎   - Display Name:', display_name || 'Muni Now (default)');

    // Validate required fields
    if (!validation_url || !merchant_id || !domain_name) {
      console.error('🍎 ❌ VALIDATION ERROR - Missing required fields');
      console.error('🍎   - validation_url:', !!validation_url);
      console.error('🍎   - merchant_id:', !!merchant_id);
      console.error('🍎   - domain_name:', !!domain_name);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: validation_url, merchant_id, domain_name'
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('🍎 ✅ Request validation passed');

    // Fetch merchant's Finix identity from database
    console.log('🍎 📊 Querying merchant data from database...');
    const { data: merchantData, error: merchantError } = await supabase
      .from('merchants')
      .select('finix_merchant_id, finix_identity_id, merchant_name')
      .eq('id', merchant_id)
      .single();

    if (merchantError || !merchantData?.finix_identity_id) {
      console.error('🍎 ❌ MERCHANT LOOKUP ERROR');
      console.error('🍎   - Merchant ID:', merchant_id);
      console.error('🍎   - Error:', merchantError);
      console.error('🍎   - Data:', merchantData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Merchant not found or missing Finix identity'
        }),
        { status: 404, headers: corsHeaders }
      );
    }

    const finixMerchantIdentity = merchantData.finix_identity_id;
    console.log('🍎 ✅ Merchant data retrieved:');
    console.log('🍎   - Merchant Name:', merchantData.merchant_name);
    console.log('🍎   - Finix Merchant ID (MU):', merchantData.finix_merchant_id);
    console.log('🍎   - Finix Identity ID (ID):', finixMerchantIdentity);
    console.log('🍎   - Domain:', domain_name);

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

    console.log('🍎 🌐 Finix Environment:', finixEnv);
    console.log('🍎 🌐 Finix Base URL:', finixBaseUrl);

    // Call Finix API to create Apple Pay session
    const finixRequestBody = {
      display_name: display_name || 'Muni Now',
      domain: domain_name,
      merchant_identity: finixMerchantIdentity,
      validation_url: validation_url
    };
    
    console.log('🍎 📤 Calling Finix API...');
    console.log('🍎   - Endpoint:', `${finixBaseUrl}/apple_pay_sessions`);
    console.log('🍎   - Request Body:', JSON.stringify(finixRequestBody, null, 2));
    
    const finixCallStart = Date.now();
    const finixResponse = await fetch(`${finixBaseUrl}/apple_pay_sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${finixAppId}:${finixApiSecret}`)
      },
      body: JSON.stringify(finixRequestBody)
    });
    const finixCallDuration = Date.now() - finixCallStart;

    const finixData = await finixResponse.json();
    
    console.log('🍎 📥 Finix API Response:');
    console.log('🍎   - Status:', finixResponse.status);
    console.log('🍎   - Duration:', `${finixCallDuration}ms`);
    console.log('🍎   - Response Data:', JSON.stringify(finixData, null, 2));

    if (!finixResponse.ok) {
      console.error('🍎 ❌ FINIX API ERROR');
      console.error('🍎   - Status:', finixResponse.status);
      console.error('🍎   - Error Message:', finixData.message);
      console.error('🍎   - Full Response:', JSON.stringify(finixData, null, 2));
      console.error('🍎   - Domain:', domain_name);
      console.error('🍎   - Merchant Identity:', finixMerchantIdentity);
      console.error('🍎   - Validation URL:', validation_url);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: finixData.message || 'Failed to create Apple Pay session',
          details: finixData
        }),
        { status: finixResponse.status, headers: corsHeaders }
      );
    }

    const totalDuration = Date.now() - requestStartTime;
    console.log('🍎 ✅ ========================================');
    console.log('🍎 ✅ SESSION CREATED SUCCESSFULLY');
    console.log('🍎 ✅ ========================================');
    console.log('🍎 ✅ Total Duration:', `${totalDuration}ms`);
    console.log('🍎 ✅ Merchant:', merchantData.merchant_name);
    console.log('🍎 ✅ Domain:', domain_name);

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
    const totalDuration = Date.now() - requestStartTime;
    console.error('🍎 ❌ ========================================');
    console.error('🍎 ❌ CRITICAL ERROR IN APPLE PAY SESSION');
    console.error('🍎 ❌ ========================================');
    console.error('🍎 ❌ Duration:', `${totalDuration}ms`);
    console.error('🍎 ❌ Error Type:', error?.constructor?.name);
    console.error('🍎 ❌ Error Message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('🍎 ❌ Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('🍎 ❌ Full Error:', error);
    
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
