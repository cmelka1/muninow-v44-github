-- Drop ALL existing versions of create_unified_payment_transaction
DROP FUNCTION IF EXISTS public.create_unified_payment_transaction(p_bank_last_four text, p_base_amount_cents bigint, p_card_brand text, p_card_last_four text, p_entity_id uuid, p_entity_type text, p_first_name text, p_fraud_session_id text, p_idempotency_id text, p_last_name text, p_payment_instrument_id text, p_payment_type text, p_user_email text);

DROP FUNCTION IF EXISTS public.create_unified_payment_transaction(p_bank_last_four text, p_base_amount_cents bigint, p_card_brand text, p_card_last_four text, p_customer_id uuid, p_entity_id uuid, p_entity_type text, p_first_name text, p_fraud_session_id text, p_idempotency_id text, p_last_name text, p_merchant_id uuid, p_payment_instrument_id text, p_payment_type text, p_user_email text, p_user_id uuid);

DROP FUNCTION IF EXISTS public.create_unified_payment_transaction(p_user_id uuid, p_customer_id uuid, p_merchant_id uuid, p_entity_type text, p_entity_id uuid, p_base_amount_cents bigint, p_payment_instrument_id text, p_payment_type text, p_fraud_session_id text, p_idempotency_id text, p_card_brand text, p_card_last_four text, p_bank_last_four text, p_first_name text, p_last_name text, p_user_email text);

-- Create the function with EXACT signature that edge function is calling
CREATE OR REPLACE FUNCTION public.create_unified_payment_transaction(
  p_user_id uuid,
  p_customer_id uuid,
  p_merchant_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_base_amount_cents bigint,
  p_payment_instrument_id text,
  p_payment_type text,
  p_fraud_session_id text,
  p_idempotency_id text,
  p_card_brand text,
  p_card_last_four text,
  p_bank_last_four text,
  p_first_name text,
  p_last_name text,
  p_user_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_payment_history_id uuid;
  v_service_fee_cents bigint := 0;
  v_total_amount_cents bigint;
  v_merchant_name text;
  v_basis_points integer := 290; -- Default 2.9%
  v_fixed_fee integer := 30; -- Default $0.30
  result jsonb;
BEGIN
  -- Get merchant details and fee structure
  SELECT 
    m.merchant_name,
    COALESCE(mfp.basis_points, 290) as basis_points,
    COALESCE(mfp.fixed_fee, 30) as fixed_fee
  INTO v_merchant_name, v_basis_points, v_fixed_fee
  FROM merchants m
  LEFT JOIN merchant_fee_profiles mfp ON mfp.merchant_id = m.id
  WHERE m.id = p_merchant_id;

  -- Calculate service fee based on payment type
  IF p_payment_type = 'card' THEN
    v_service_fee_cents := (p_base_amount_cents * v_basis_points / 10000) + v_fixed_fee;
  ELSE
    -- ACH typically has lower fees
    v_service_fee_cents := LEAST((p_base_amount_cents * 50 / 10000) + 25, 500); -- Max $5.00
  END IF;

  -- Calculate total amount
  v_total_amount_cents := p_base_amount_cents + v_service_fee_cents;

  -- Create payment history record with proper foreign key columns
  INSERT INTO public.payment_history (
    user_id,
    customer_id,
    merchant_id,
    amount_cents,
    service_fee_cents,
    total_amount_cents,
    payment_type,
    payment_status,
    payment_method_type,
    payment_instrument_id,
    idempotency_id,
    fraud_session_id,
    card_brand,
    card_last_four,
    bank_last_four,
    finix_merchant_id,
    merchant_name,
    transfer_state,
    -- Entity-specific foreign key columns
    permit_id,
    business_license_id,
    service_application_id,
    tax_submission_id,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_customer_id,
    p_merchant_id,
    p_base_amount_cents,
    v_service_fee_cents,
    v_total_amount_cents,
    p_payment_type,
    'pending',
    p_payment_type,
    p_payment_instrument_id,
    p_idempotency_id,
    p_fraud_session_id,
    p_card_brand,
    p_card_last_four,
    p_bank_last_four,
    (SELECT finix_merchant_id FROM merchants WHERE id = p_merchant_id),
    v_merchant_name,
    'PENDING',
    -- Set the appropriate foreign key based on entity type
    CASE WHEN p_entity_type = 'permit' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'business_license' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'service_application' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'tax_submission' THEN p_entity_id ELSE NULL END,
    now(),
    now()
  ) RETURNING id INTO v_payment_history_id;

  -- Return success with calculated values
  result := jsonb_build_object(
    'success', true,
    'payment_history_id', v_payment_history_id,
    'service_fee_cents', v_service_fee_cents,
    'total_amount_cents', v_total_amount_cents
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