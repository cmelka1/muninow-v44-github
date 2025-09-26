import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Import the shared fee calculation utility
const calculateServiceFeeUtil = (params: {
  baseAmountCents: number;
  isCard: boolean;
  cardBasisPoints?: number;
  cardFixedFeeCents?: number;
  achBasisPoints?: number;
  achFixedFeeCents?: number;
  achBasisPointsFeeLimitCents?: number;
}) => {
  const {
    baseAmountCents,
    isCard,
    cardBasisPoints = 300,
    cardFixedFeeCents = 50,
    achBasisPoints = 150,
    achFixedFeeCents = 50,
    achBasisPointsFeeLimitCents
  } = params;

  const basisPoints = isCard ? cardBasisPoints : achBasisPoints;
  const fixedFeeCents = isCard ? cardFixedFeeCents : achFixedFeeCents;

  let serviceFeePercentageCents = Math.round((baseAmountCents * basisPoints) / 10000);
  
  // Apply ACH basis points fee limit if applicable
  if (!isCard && achBasisPointsFeeLimitCents && serviceFeePercentageCents > achBasisPointsFeeLimitCents) {
    serviceFeePercentageCents = achBasisPointsFeeLimitCents;
  }
  
  const totalServiceFeeCents = serviceFeePercentageCents + fixedFeeCents;
  const totalChargeCents = baseAmountCents + totalServiceFeeCents;

  return {
    baseAmountCents,
    serviceFeePercentageCents,
    serviceFeeFixedCents: fixedFeeCents,
    totalServiceFeeCents,
    totalChargeCents,
    basisPoints,
    isCard
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== SERVICE FEE CALCULATION REQUEST ===');
    
    const { baseAmountCents, paymentMethodType, paymentInstrumentId } = await req.json();
    
    console.log('Request params:', {
      baseAmountCents,
      paymentMethodType,
      paymentInstrumentId
    });

    // Validate inputs
    if (!baseAmountCents || baseAmountCents <= 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid base amount' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determine if it's a card payment
    let isCard = true; // Default to card
    
    if (paymentMethodType) {
      // Direct payment method type provided
      isCard = paymentMethodType === 'card' || paymentMethodType === 'PAYMENT_CARD';
    } else if (paymentInstrumentId) {
      // Query payment instrument to determine type
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: instrument, error } = await supabase
        .from('user_payment_instruments')
        .select('instrument_type')
        .eq('id', paymentInstrumentId)
        .single();

      if (error) {
        console.error('Error fetching payment instrument:', error);
        // Fall back to card assumption
        isCard = true;
      } else {
        isCard = instrument.instrument_type === 'PAYMENT_CARD';
      }
    }

    // Get fee profile for merchant if we have payment instrument context
    let achBasisPointsFeeLimitCents;
    if (paymentInstrumentId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Try to get merchant fee profile through the payment instrument user
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('customer_id')
        .eq('id', (await supabase.from('user_payment_instruments').select('user_id').eq('id', paymentInstrumentId).single()).data?.user_id)
        .single();

      if (userProfile?.customer_id) {
        const { data: feeProfile } = await supabase
          .from('merchant_fee_profiles')
          .select('ach_basis_points_fee_limit')
          .eq('merchant_id', (await supabase.from('merchants').select('id').eq('customer_id', userProfile.customer_id).eq('subcategory', 'Other').single()).data?.id)
          .single();
        
        achBasisPointsFeeLimitCents = feeProfile?.ach_basis_points_fee_limit;
      }
    }

    // Calculate service fee using unified formula
    const feeCalculation = calculateServiceFeeUtil({
      baseAmountCents,
      isCard,
      achBasisPointsFeeLimitCents
    });

    console.log('Fee calculation result:', feeCalculation);

    return new Response(
      JSON.stringify({
        success: true,
        baseAmount: feeCalculation.baseAmountCents,
        serviceFee: feeCalculation.totalServiceFeeCents,
        totalAmount: feeCalculation.totalChargeCents,
        isCard: feeCalculation.isCard,
        basisPoints: feeCalculation.basisPoints
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Service fee calculation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to calculate service fee'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});