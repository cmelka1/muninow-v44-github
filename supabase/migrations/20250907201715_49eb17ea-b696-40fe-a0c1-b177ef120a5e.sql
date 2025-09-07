-- Drop all versions of the create_unified_payment_transaction function
DROP FUNCTION IF EXISTS public.create_unified_payment_transaction CASCADE;

-- Create the correct unified payment transaction function
CREATE OR REPLACE FUNCTION public.create_unified_payment_transaction(
  p_entity_type text,
  p_entity_id uuid,
  p_base_amount_cents bigint,
  p_payment_instrument_id text,
  p_payment_type text,
  p_fraud_session_id text DEFAULT NULL,
  p_idempotency_id text DEFAULT NULL,
  p_card_brand text DEFAULT NULL,
  p_card_last_four text DEFAULT NULL,
  p_bank_last_four text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_user_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_service_fee_cents bigint := 0;
  v_total_amount_cents bigint;
  v_payment_history_id uuid;
  v_merchant_id uuid;
  v_customer_id uuid;
  v_user_id uuid := auth.uid();
  v_fee_profile merchant_fee_profiles%ROWTYPE;
BEGIN
  -- Get merchant and customer info based on entity type
  CASE p_entity_type
    WHEN 'permit' THEN
      SELECT pa.merchant_id, pa.customer_id, pa.user_id
      INTO v_merchant_id, v_customer_id, v_user_id
      FROM permit_applications pa
      WHERE pa.permit_id = p_entity_id;
      
    WHEN 'business_license' THEN
      SELECT bla.merchant_id, bla.customer_id, bla.user_id
      INTO v_merchant_id, v_customer_id, v_user_id
      FROM business_license_applications bla
      WHERE bla.id = p_entity_id;
      
    WHEN 'tax' THEN
      SELECT ts.merchant_id, ts.customer_id, ts.user_id
      INTO v_merchant_id, v_customer_id, v_user_id
      FROM tax_submissions ts
      WHERE ts.id = p_entity_id;
      
    WHEN 'bill' THEN
      SELECT mb.merchant_id, mb.customer_id, mb.user_id
      INTO v_merchant_id, v_customer_id, v_user_id
      FROM master_bills mb
      WHERE mb.bill_id = p_entity_id;
      
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Invalid entity type: ' || p_entity_type
      );
  END CASE;

  -- Check if entity exists
  IF v_merchant_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Entity not found: ' || p_entity_type || ' with ID ' || p_entity_id
    );
  END IF;

  -- Get merchant fee profile for service fee calculation
  SELECT * INTO v_fee_profile
  FROM merchant_fee_profiles
  WHERE merchant_id = v_merchant_id
  LIMIT 1;

  -- Calculate service fee based on payment type
  IF v_fee_profile.id IS NOT NULL THEN
    IF p_payment_type = 'card' THEN
      -- Card payment: basis points + fixed fee
      v_service_fee_cents := COALESCE(
        (p_base_amount_cents * COALESCE(v_fee_profile.basis_points, 0) / 10000) + 
        COALESCE(v_fee_profile.fixed_fee, 0),
        0
      );
    ELSIF p_payment_type = 'ach' THEN
      -- ACH payment: ach basis points + ach fixed fee
      v_service_fee_cents := COALESCE(
        (p_base_amount_cents * COALESCE(v_fee_profile.ach_basis_points, 0) / 10000) + 
        COALESCE(v_fee_profile.ach_fixed_fee, 0),
        0
      );
    END IF;
  END IF;

  -- Calculate total amount
  v_total_amount_cents := p_base_amount_cents + v_service_fee_cents;

  -- Insert payment history record with proper foreign key mapping
  INSERT INTO payment_history (
    user_id,
    customer_id,
    merchant_id,
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
    transfer_state,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_customer_id,
    v_merchant_id,
    CASE WHEN p_entity_type = 'permit' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'business_license' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'tax' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'bill' THEN p_entity_id ELSE NULL END,
    p_base_amount_cents,
    v_service_fee_cents,
    v_total_amount_cents,
    p_payment_type,
    'unpaid',
    p_payment_type,
    p_payment_instrument_id,
    p_idempotency_id,
    p_fraud_session_id,
    p_card_brand,
    p_card_last_four,
    p_bank_last_four,
    'PENDING',
    now(),
    now()
  ) RETURNING id INTO v_payment_history_id;

  -- Return success with calculated values
  RETURN jsonb_build_object(
    'success', true,
    'service_fee_cents', v_service_fee_cents,
    'total_amount_cents', v_total_amount_cents,
    'payment_history_id', v_payment_history_id
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;