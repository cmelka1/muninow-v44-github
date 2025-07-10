import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key to bypass RLS
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase service role key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      supabaseServiceKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has superAdmin role
    const { data: userRoles, error: roleError } = await supabaseClient.rpc('get_user_roles', {
      _user_id: user.id
    });

    if (roleError || !userRoles?.some((r: any) => r.role === 'superAdmin')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. SuperAdmin role required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { merchantId, feeProfileData } = await req.json();

    if (!merchantId || !feeProfileData) {
      return new Response(
        JSON.stringify({ error: 'Missing merchantId or feeProfileData' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get merchant details
    const { data: merchant, error: merchantError } = await supabaseClient
      .from('merchants')
      .select('finix_merchant_id, merchant_name')
      .eq('id', merchantId)
      .single();

    if (merchantError || !merchant) {
      return new Response(
        JSON.stringify({ error: 'Merchant not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!merchant.finix_merchant_id) {
      return new Response(
        JSON.stringify({ error: 'Merchant does not have a Finix merchant ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Finix credentials
    const finixApplicationId = Deno.env.get('FINIX_APPLICATION_ID');
    const finixApiSecret = Deno.env.get('FINIX_API_SECRET');
    const finixBaseUrl = Deno.env.get('FINIX_BASE_URL') || 'https://finix.sandbox-payments-api.com/v2';

    if (!finixApplicationId || !finixApiSecret) {
      return new Response(
        JSON.stringify({ error: 'Finix credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create fee profile in Finix
    const finixAuth = btoa(`${finixApplicationId}:${finixApiSecret}`);
    
    const finixResponse = await fetch(`${finixBaseUrl}/fee_profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${finixAuth}`,
        'Content-Type': 'application/vnd.api+json'
      },
      body: JSON.stringify({
        basis_points: Math.round(feeProfileData.percentage_fee * 100), // Convert percentage to basis points
        fixed_fee: feeProfileData.fixed_fee_cents,
        ach_basis_points: Math.round((feeProfileData.ach_debit_percentage_fee || 0) * 100),
        ach_fixed_fee: feeProfileData.ach_debit_fixed_fee_cents || 0,
        dispute_fixed_fee: feeProfileData.chargeback_fixed_fee_cents || 0,
        dispute_inquiry_fixed_fee: feeProfileData.chargeback_fixed_fee_cents || 0,
        ach_basis_points_fee_limit: 500,
        ach_credit_return_fixed_fee: feeProfileData.ach_credit_fixed_fee_cents || 0,
        ach_debit_return_fixed_fee: feeProfileData.ach_debit_fixed_fee_cents || 0
      })
    });

    if (!finixResponse.ok) {
      const errorText = await finixResponse.text();
      console.error('Finix API Error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to create fee profile in Finix', details: errorText }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const finixFeeProfile = await finixResponse.json();

    // Save fee profile to database
    const { data: dbFeeProfile, error: dbError } = await supabaseClient
      .from('merchant_fee_profiles')
      .insert({
        merchant_id: merchantId,
        merchant_name: merchant.merchant_name,
        finix_merchant_id: merchant.finix_merchant_id,
        finix_fee_profile_id: finixFeeProfile.id,
        fixed_fee_cents: feeProfileData.fixed_fee_cents || 0,
        percentage_fee: feeProfileData.percentage_fee || 0,
        card_present_fixed_fee_cents: feeProfileData.card_present_fixed_fee_cents || 0,
        card_present_percentage_fee: feeProfileData.card_present_percentage_fee || 0,
        card_not_present_fixed_fee_cents: feeProfileData.card_not_present_fixed_fee_cents || 0,
        card_not_present_percentage_fee: feeProfileData.card_not_present_percentage_fee || 0,
        ach_debit_fixed_fee_cents: feeProfileData.ach_debit_fixed_fee_cents || 0,
        ach_debit_percentage_fee: feeProfileData.ach_debit_percentage_fee || 0,
        ach_credit_fixed_fee_cents: feeProfileData.ach_credit_fixed_fee_cents || 0,
        ach_credit_percentage_fee: feeProfileData.ach_credit_percentage_fee || 0,
        chargeback_fixed_fee_cents: feeProfileData.chargeback_fixed_fee_cents || 0,
        refund_fixed_fee_cents: feeProfileData.refund_fixed_fee_cents || 0,
        monthly_fee_cents: feeProfileData.monthly_fee_cents || 0,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
        finix_raw_response: finixFeeProfile
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save fee profile to database', details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        feeProfile: dbFeeProfile,
        finixResponse: finixFeeProfile 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating fee profile:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});