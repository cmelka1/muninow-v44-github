-- Drop the old function that references payment_history
DROP FUNCTION IF EXISTS public.create_tax_submission_with_payment(uuid, uuid, uuid, text, date, date, integer, bigint, text, bigint, text, text, bigint, bigint, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text);

-- Recreate function to use payment_transactions table instead
CREATE OR REPLACE FUNCTION public.create_tax_submission_with_payment(
  p_user_id uuid,
  p_customer_id uuid,
  p_merchant_id uuid,
  p_tax_type text,
  p_tax_period_start date,
  p_tax_period_end date,
  p_tax_year integer,
  p_amount_cents bigint,
  p_calculation_notes text,
  p_total_amount_due_cents bigint,
  p_payment_instrument_id text,
  p_finix_merchant_id text,
  p_service_fee_cents bigint,
  p_total_amount_cents bigint,
  p_payment_type text,
  p_idempotency_id text,
  p_fraud_session_id text DEFAULT NULL,
  p_card_brand text DEFAULT NULL,
  p_card_last_four text DEFAULT NULL,
  p_bank_last_four text DEFAULT NULL,
  p_merchant_name text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_subcategory text DEFAULT NULL,
  p_statement_descriptor text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_user_email text DEFAULT NULL,
  p_payer_ein text DEFAULT NULL,
  p_payer_phone text DEFAULT NULL,
  p_payer_street_address text DEFAULT NULL,
  p_payer_city text DEFAULT NULL,
  p_payer_state text DEFAULT NULL,
  p_payer_zip_code text DEFAULT NULL,
  p_payer_business_name text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_tax_submission_id uuid;
  v_payment_transaction_id uuid;
  result jsonb;
BEGIN
  -- Create tax submission with simplified approach
  INSERT INTO public.tax_submissions (
    user_id,
    customer_id,
    merchant_id,
    tax_type,
    tax_period_start,
    tax_period_end,
    tax_year,
    amount_cents,
    calculation_notes,
    total_amount_due_cents,
    total_amount_cents,
    service_fee_cents,
    finix_merchant_id,
    merchant_name,
    category,
    subcategory,
    statement_descriptor,
    submission_status,
    payment_status,
    transfer_state,
    submission_date,
    idempotency_id,
    fraud_session_id,
    payment_type,
    first_name,
    last_name,
    email,
    payer_ein,
    payer_phone,
    payer_street_address,
    payer_city,
    payer_state,
    payer_zip_code,
    payer_business_name
  ) VALUES (
    p_user_id,
    p_customer_id,
    p_merchant_id,
    p_tax_type,
    p_tax_period_start,
    p_tax_period_end,
    p_tax_year,
    p_amount_cents,
    p_calculation_notes,
    p_total_amount_due_cents,
    p_total_amount_cents,
    p_service_fee_cents,
    p_finix_merchant_id,
    p_merchant_name,
    p_category,
    p_subcategory,
    p_statement_descriptor,
    'draft',
    'pending',
    'PENDING',
    now(),
    p_idempotency_id,
    p_fraud_session_id,
    p_payment_type,
    p_first_name,
    p_last_name,
    p_user_email,
    p_payer_ein,
    p_payer_phone,
    p_payer_street_address,
    p_payer_city,
    p_payer_state,
    p_payer_zip_code,
    p_payer_business_name
  ) RETURNING id INTO v_tax_submission_id;

  -- Create payment transaction record with tax_submission_id
  INSERT INTO public.payment_transactions (
    user_id,
    customer_id,
    merchant_id,
    tax_submission_id,
    base_amount_cents,
    service_fee_cents,
    total_amount_cents,
    payment_type,
    payment_instrument_id,
    card_brand,
    card_last_four,
    bank_last_four,
    finix_merchant_id,
    payment_status,
    transfer_state,
    idempotency_id,
    fraud_session_id
  ) VALUES (
    p_user_id,
    p_customer_id,
    p_merchant_id,
    v_tax_submission_id,
    p_amount_cents,
    p_service_fee_cents,
    p_total_amount_cents,
    p_payment_type,
    p_payment_instrument_id,
    p_card_brand,
    p_card_last_four,
    p_bank_last_four,
    p_finix_merchant_id,
    'pending',
    'PENDING',
    p_idempotency_id,
    p_fraud_session_id
  ) RETURNING id INTO v_payment_transaction_id;

  -- Return success with IDs
  result := jsonb_build_object(
    'success', true,
    'tax_submission_id', v_tax_submission_id,
    'payment_transaction_id', v_payment_transaction_id
  );

  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
    RETURN result;
END;
$function$;