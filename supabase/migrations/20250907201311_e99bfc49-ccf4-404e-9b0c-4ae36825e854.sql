-- Fix create_unified_payment_transaction function to use correct payment_history columns
DROP FUNCTION IF EXISTS public.create_unified_payment_transaction(
  uuid, uuid, uuid, text, bigint, bigint, bigint, text, text, text, text, text, text, text, text, text, text, text, text
);

-- Create updated function with correct column mapping
CREATE OR REPLACE FUNCTION public.create_unified_payment_transaction(
  p_user_id uuid,
  p_customer_id uuid,
  p_merchant_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_base_amount_cents bigint,
  p_service_fee_cents bigint,
  p_total_amount_cents bigint,
  p_payment_type text,
  p_payment_instrument_id text,
  p_idempotency_id text,
  p_fraud_session_id text DEFAULT NULL,
  p_card_brand text DEFAULT NULL,
  p_card_last_four text DEFAULT NULL,
  p_bank_last_four text DEFAULT NULL,
  p_merchant_name text DEFAULT NULL,
  p_category text DEFAULT NULL,
  p_subcategory text DEFAULT NULL,
  p_statement_descriptor text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment_history_id uuid;
  v_merchant_fee_profile merchant_fee_profiles%ROWTYPE;
  v_calculated_service_fee_cents bigint;
  result jsonb;
BEGIN
  -- Get merchant fee profile for fee calculation
  SELECT * INTO v_merchant_fee_profile
  FROM public.merchant_fee_profiles mfp
  WHERE mfp.merchant_id = p_merchant_id;

  -- Calculate service fee based on payment type and merchant fee profile
  IF v_merchant_fee_profile.id IS NOT NULL THEN
    IF p_payment_type = 'card' THEN
      -- Card payment fee calculation
      v_calculated_service_fee_cents := ROUND(
        (p_base_amount_cents::numeric * COALESCE(v_merchant_fee_profile.basis_points, 250) / 10000.0) + 
        COALESCE(v_merchant_fee_profile.fixed_fee, 30)
      );
    ELSE
      -- ACH payment fee calculation  
      v_calculated_service_fee_cents := ROUND(
        (p_base_amount_cents::numeric * COALESCE(v_merchant_fee_profile.ach_basis_points, 75) / 10000.0) + 
        COALESCE(v_merchant_fee_profile.ach_fixed_fee, 30)
      );
    END IF;
  ELSE
    -- Fallback fee calculation if no merchant fee profile
    IF p_payment_type = 'card' THEN
      v_calculated_service_fee_cents := ROUND((p_base_amount_cents::numeric * 0.025) + 30); -- 2.5% + $0.30
    ELSE
      v_calculated_service_fee_cents := ROUND((p_base_amount_cents::numeric * 0.0075) + 30); -- 0.75% + $0.30
    END IF;
  END IF;

  -- Create payment history record with appropriate foreign key based on entity type
  INSERT INTO public.payment_history (
    user_id,
    customer_id,
    permit_application_id,
    business_license_application_id,
    tax_submission_id,
    bill_id,
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
    merchant_id,
    finix_merchant_id,
    merchant_name,
    category,
    subcategory,
    statement_descriptor,
    transfer_state,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_customer_id,
    CASE WHEN p_entity_type = 'permit' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'business_license' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'tax_submission' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'bill' THEN p_entity_id ELSE NULL END,
    p_base_amount_cents,
    v_calculated_service_fee_cents,
    p_base_amount_cents + v_calculated_service_fee_cents,
    p_payment_type,
    'unpaid',
    p_payment_type,
    p_payment_instrument_id,
    p_idempotency_id,
    p_fraud_session_id,
    p_card_brand,
    p_card_last_four,
    p_bank_last_four,
    p_merchant_id,
    (SELECT finix_merchant_id FROM merchants WHERE id = p_merchant_id),
    p_merchant_name,
    p_category,
    p_subcategory,
    p_statement_descriptor,
    'PENDING',
    now(),
    now()
  ) RETURNING id INTO v_payment_history_id;

  -- Return success with calculated fee and payment history ID
  result := jsonb_build_object(
    'success', true,
    'payment_history_id', v_payment_history_id,
    'service_fee_cents', v_calculated_service_fee_cents,
    'total_amount_cents', p_base_amount_cents + v_calculated_service_fee_cents
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
$$;