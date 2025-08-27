import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessTaxPaymentRequest {
  tax_type: string;
  tax_period_start: string;
  tax_period_end: string;
  tax_year: number;
  customer_id: string;
  merchant_id: string;
  payment_instrument_id: string;
  total_amount_cents: number;
  idempotency_id: string;
  fraud_session_id: string;
  calculation_notes: string;
  payer_first_name: string;
  payer_last_name: string;
  payer_email: string;
  payer_ein?: string;
  payer_phone?: string;
  payer_business_name?: string;
  payer_street_address: string;
  payer_city: string;
  payer_state: string;
  payer_zip_code: string;
}

interface FinixTransferRequest {
  merchant: string;
  currency: string;
  amount: number;
  source: string;
  fraud_session_id?: string;
  idempotency_id: string;
}

interface FinixTransferResponse {
  id: string;
  amount: number;
  state: string;
  currency: string;
  source: string;
  merchant: string;
  created_at: string;
  updated_at: string;
  failure_code?: string;
  failure_message?: string;
  fee?: number;
  statement_descriptor?: string;
  [key: string]: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Create service role client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const body: ProcessTaxPaymentRequest = await req.json();
    const { 
      tax_type,
      tax_period_start,
      tax_period_end,
      tax_year,
      customer_id,
      merchant_id,
      payment_instrument_id,
      total_amount_cents,
      idempotency_id,
      fraud_session_id,
      calculation_notes,
      payer_first_name,
      payer_last_name,
      payer_email,
      payer_ein,
      payer_phone,
      payer_business_name,
      payer_street_address,
      payer_city,
      payer_state,
      payer_zip_code
    } = body;

    console.log("Processing tax payment:", { 
      tax_type, 
      payment_instrument_id, 
      total_amount_cents, 
      user_id: user.id 
    });

    // Validate required input parameters
    const missingParams = [];
    if (!tax_type) missingParams.push("tax_type");
    if (!payment_instrument_id) missingParams.push("payment_instrument_id");
    if (!total_amount_cents) missingParams.push("total_amount_cents");
    if (!idempotency_id) missingParams.push("idempotency_id");
    
    if (missingParams.length > 0) {
      throw new Error(`Missing required parameters: ${missingParams.join(", ")}`);
    }

    // Validate amount is reasonable
    if (total_amount_cents <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    // fraud_session_id is optional - if empty, we'll still proceed but log a warning
    if (!fraud_session_id || fraud_session_id.trim() === '') {
      console.warn("No fraud session ID provided for tax payment");
    }

    // Check for duplicate idempotency_id
    const { data: existingPayment } = await supabaseService
      .from("payment_history")
      .select("id, transfer_state")
      .eq("idempotency_id", idempotency_id)
      .single();

    if (existingPayment) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          payment_history_id: existingPayment.id,
          message: "Payment already processed",
          transfer_state: existingPayment.transfer_state
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get payment instrument and validate ownership
    const { data: paymentInstrument, error: piError } = await supabaseService
      .from("user_payment_instruments")
      .select("*")
      .eq("id", payment_instrument_id)
      .eq("user_id", user.id)
      .eq("enabled", true)
      .single();

    if (piError || !paymentInstrument) {
      throw new Error("Payment instrument not found or access denied");
    }

    // Get merchant details
    const { data: merchant, error: merchantError } = await supabaseService
      .from("merchants")
      .select("*")
      .eq("id", merchant_id)
      .single();

    if (merchantError || !merchant) {
      throw new Error("Merchant not found");
    }

    // Validate finix_merchant_id is present
    if (!merchant.finix_merchant_id) {
      throw new Error("Merchant is not configured for Finix payment processing");
    }

    // Calculate base amount and service fee using the same logic as permits
    const isCard = paymentInstrument.instrument_type === 'PAYMENT_CARD';
    const basisPoints = isCard ? 300 : 150; // 3% for cards, 1.5% for ACH
    const fixedFee = 50; // $0.50 fixed fee for both
    
    // Calculate base amount from total (reverse grossed-up calculation)
    const percentageDecimal = basisPoints / 10000;
    const baseAmount = Math.round((total_amount_cents * (1 - percentageDecimal)) - fixedFee);
    const calculatedServiceFee = total_amount_cents - baseAmount;

    console.log("Fee calculation:", { 
      baseAmount, 
      serviceFee: calculatedServiceFee, 
      totalAmount: total_amount_cents, 
      basisPoints, 
      fixedFee 
    });

    // Determine payment type
    const paymentType = paymentInstrument.instrument_type === 'PAYMENT_CARD' ? 'Card' : 'Bank Account';

    // Create tax submission record
    const { data: taxSubmission, error: tsError } = await supabaseService
      .from("tax_submissions")
      .insert({
        user_id: user.id,
        customer_id: customer_id,
        merchant_id: merchant_id,
        tax_type: tax_type,
        tax_period_start: tax_period_start,
        tax_period_end: tax_period_end,
        tax_year: tax_year,
        amount_cents: baseAmount,
        calculation_notes: calculation_notes,
        total_amount_due_cents: baseAmount,
        total_amount_cents: total_amount_cents,
        service_fee_cents: calculatedServiceFee,
        finix_merchant_id: merchant.finix_merchant_id,
        merchant_name: merchant.merchant_name,
        category: merchant.category,
        subcategory: merchant.subcategory,
        statement_descriptor: merchant.statement_descriptor,
        submission_status: 'draft',
        payment_status: 'pending',
        transfer_state: 'PENDING',
        submission_date: new Date().toISOString(),
        idempotency_id: idempotency_id,
        fraud_session_id: fraud_session_id,
        payment_type: paymentType,
        first_name: payer_first_name,
        last_name: payer_last_name,
        email: payer_email,
        payer_ein: payer_ein,
        payer_phone: payer_phone,
        payer_street_address: payer_street_address,
        payer_city: payer_city,
        payer_state: payer_state,
        payer_zip_code: payer_zip_code,
        payer_business_name: payer_business_name
      })
      .select()
      .single();

    if (tsError) {
      console.error("Error creating tax submission:", tsError);
      throw new Error("Failed to create tax submission record");
    }

    // Create payment history record
    const { data: paymentHistory, error: phError } = await supabaseService
      .from("payment_history")
      .insert({
        user_id: user.id,
        customer_id: customer_id,
        tax_submission_id: taxSubmission.id,
        finix_payment_instrument_id: paymentInstrument.finix_payment_instrument_id,
        finix_merchant_id: merchant.finix_merchant_id,
        amount_cents: baseAmount,
        service_fee_cents: calculatedServiceFee,
        total_amount_cents: total_amount_cents,
        currency: 'USD',
        payment_type: paymentType,
        idempotency_id: idempotency_id,
        fraud_session_id: fraud_session_id,
        transfer_state: 'PENDING',
        card_brand: paymentInstrument.card_brand,
        card_last_four: paymentInstrument.card_last_four,
        bank_last_four: paymentInstrument.bank_last_four,
        merchant_id: merchant_id,
        merchant_name: merchant.merchant_name,
        category: merchant.category,
        subcategory: merchant.subcategory,
        statement_descriptor: merchant.statement_descriptor,
        // Customer information
        customer_first_name: payer_first_name,
        customer_last_name: payer_last_name,
        customer_email: payer_email,
        customer_street_address: payer_street_address,
        customer_city: payer_city,
        customer_state: payer_state,
        customer_zip_code: payer_zip_code,
        // Tax-specific information
        bill_type: 'tax',
        payment_status: 'pending',
        bill_status: 'unpaid',
        payment_method_type: paymentType,
        payment_instrument_id: payment_instrument_id
      })
      .select()
      .single();

    if (phError) {
      console.error("Error creating payment history:", phError);
      // Cleanup tax submission
      await supabaseService.from("tax_submissions").delete().eq("id", taxSubmission.id);
      throw new Error("Failed to create payment record");
    }

    // Prepare Finix transfer request
    const finixRequest: FinixTransferRequest = {
      merchant: merchant.finix_merchant_id,
      currency: "USD",
      amount: total_amount_cents,
      source: paymentInstrument.finix_payment_instrument_id,
      idempotency_id: idempotency_id
    };

    if (fraud_session_id) {
      finixRequest.fraud_session_id = fraud_session_id;
    }

    // Get Finix credentials
    const finixApplicationId = Deno.env.get("FINIX_APPLICATION_ID");
    const finixApiSecret = Deno.env.get("FINIX_API_SECRET");
    const finixEnvironment = Deno.env.get("FINIX_ENVIRONMENT") || "sandbox";
    
    if (!finixApplicationId || !finixApiSecret) {
      throw new Error("Finix API credentials not configured");
    }

    // Determine Finix API URL based on environment
    const finixBaseUrl = finixEnvironment === "live" 
      ? "https://finix.payments-api.com"
      : "https://finix.sandbox-payments-api.com";

    // Create Finix transfer
    const finixResponse = await fetch(`${finixBaseUrl}/transfers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Finix-Version": "2022-02-01",
        "Authorization": `Basic ${btoa(finixApplicationId + ":" + finixApiSecret)}`
      },
      body: JSON.stringify(finixRequest)
    });

    const finixData: FinixTransferResponse = await finixResponse.json();

    console.log("Finix transfer response:", { 
      status: finixResponse.status, 
      transfer_id: finixData.id,
      state: finixData.state 
    });

    // Update payment history with Finix response
    const updateData: any = {
      raw_finix_response: finixData,
      updated_at: new Date().toISOString()
    };

    if (finixResponse.ok && finixData.id) {
      updateData.finix_transfer_id = finixData.id;
      updateData.transfer_state = finixData.state || 'PENDING';
      updateData.finix_created_at = finixData.created_at;
      updateData.finix_updated_at = finixData.updated_at;
      updateData.payment_status = 'paid';
    } else {
      updateData.transfer_state = 'FAILED';
      updateData.failure_code = finixData.failure_code || 'API_ERROR';
      updateData.failure_message = finixData.failure_message || 'Finix API request failed';
      updateData.payment_status = 'failed';
    }

    await supabaseService
      .from("payment_history")
      .update(updateData)
      .eq("id", paymentHistory.id);

    // If transfer succeeded, update the tax submission
    if (finixResponse.ok && finixData.state === 'SUCCEEDED') {
      try {
        const { error: taxUpdateError } = await supabaseService
          .from("tax_submissions")
          .update({
            payment_status: 'paid',
            transfer_state: 'SUCCEEDED',
            finix_transfer_id: finixData.id,
            paid_at: new Date().toISOString(),
            submission_status: 'submitted',
            updated_at: new Date().toISOString()
          })
          .eq("id", taxSubmission.id);

        if (taxUpdateError) {
          console.error("Error updating tax submission:", taxUpdateError);
          throw new Error("Failed to update tax submission status");
        }

        console.log("Tax submission updated successfully for payment:", finixData.id);
      } catch (error) {
        console.error("Tax submission update failed:", error);
        // Note: Payment was successful, but tax submission update failed
        // This should be handled by manual review
      }
    }

    // Return response
    if (!finixResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: updateData.failure_message,
          payment_history_id: paymentHistory.id
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_history_id: paymentHistory.id,
        tax_submission_id: taxSubmission.id,
        transfer_id: finixData.id,
        transfer_state: finixData.state,
        amount_cents: total_amount_cents,
        redirect_url: `/taxes`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Tax payment error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});