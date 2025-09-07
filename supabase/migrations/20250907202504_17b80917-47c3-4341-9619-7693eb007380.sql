-- Drop ALL existing versions of create_unified_payment_transaction function
DROP FUNCTION IF EXISTS create_unified_payment_transaction(uuid, uuid, uuid, text, uuid, bigint, text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS create_unified_payment_transaction(text, uuid, bigint, text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS create_unified_payment_transaction(uuid, uuid, text, uuid, bigint, text, text, text, text, text, text, text, text, text, text);

-- Create the single, correct version of create_unified_payment_transaction
CREATE OR REPLACE FUNCTION create_unified_payment_transaction(
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
  v_user_id uuid;
  v_customer_id uuid;
  v_merchant_id uuid;
  v_finix_merchant_id text;
  v_merchant_name text;
  v_category text;
  v_subcategory text;
  v_statement_descriptor text;
  v_service_fee_cents bigint := 0;
  v_total_amount_cents bigint;
  v_payment_history_id uuid;
  v_fee_profile merchant_fee_profiles%ROWTYPE;
  v_fixed_fee integer := 0;
  v_basis_points integer := 0;
BEGIN
  -- Get entity details based on type
  CASE p_entity_type
    WHEN 'permit' THEN
      SELECT user_id, customer_id, merchant_id 
      INTO v_user_id, v_customer_id, v_merchant_id
      FROM permit_applications 
      WHERE permit_id = p_entity_id;
      
    WHEN 'business_license' THEN
      SELECT user_id, customer_id, merchant_id 
      INTO v_user_id, v_customer_id, v_merchant_id
      FROM business_license_applications 
      WHERE id = p_entity_id;
      
    WHEN 'tax_submission' THEN
      SELECT user_id, customer_id, merchant_id 
      INTO v_user_id, v_customer_id, v_merchant_id
      FROM tax_submissions 
      WHERE id = p_entity_id;
      
    WHEN 'service_application' THEN
      SELECT user_id, customer_id, merchant_id 
      INTO v_user_id, v_customer_id, v_merchant_id
      FROM municipal_service_applications 
      WHERE id = p_entity_id;
      
    WHEN 'bill' THEN
      SELECT user_id, customer_id, merchant_id 
      INTO v_user_id, v_customer_id, v_merchant_id
      FROM master_bills 
      WHERE bill_id = p_entity_id;
      
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Invalid entity type: ' || p_entity_type,
        'error_code', 'INVALID_ENTITY_TYPE'
      );
  END CASE;

  -- Check if entity was found
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Entity not found for type: ' || p_entity_type,
      'error_code', 'ENTITY_NOT_FOUND'
    );
  END IF;

  -- Get merchant details and fee profile
  SELECT 
    m.finix_merchant_id,
    m.merchant_name,
    m.category,
    m.subcategory,
    m.statement_descriptor
  INTO 
    v_finix_merchant_id,
    v_merchant_name,
    v_category,
    v_subcategory,
    v_statement_descriptor
  FROM merchants m
  WHERE m.id = v_merchant_id;

  -- Get fee profile for service fee calculation
  SELECT * INTO v_fee_profile
  FROM merchant_fee_profiles
  WHERE merchant_id = v_merchant_id;

  -- Calculate service fee based on payment type
  IF v_fee_profile.id IS NOT NULL THEN
    IF p_payment_type = 'PAYMENT_CARD' THEN
      v_fixed_fee := COALESCE(v_fee_profile.fixed_fee, 0);
      v_basis_points := COALESCE(v_fee_profile.basis_points, 0);
    ELSIF p_payment_type = 'BANK_ACCOUNT' THEN
      v_fixed_fee := COALESCE(v_fee_profile.ach_fixed_fee, 0);
      v_basis_points := COALESCE(v_fee_profile.ach_basis_points, 0);
    END IF;
    
    -- Calculate service fee: (amount * basis_points / 10000) + fixed_fee
    v_service_fee_cents := ((p_base_amount_cents * v_basis_points) / 10000) + v_fixed_fee;
  END IF;

  -- Calculate total amount
  v_total_amount_cents := p_base_amount_cents + v_service_fee_cents;

  -- Insert payment history record
  INSERT INTO payment_history (
    user_id,
    customer_id,
    merchant_id,
    permit_id,
    business_license_id,
    service_application_id,
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
    finix_merchant_id,
    merchant_name,
    category,
    subcategory,
    statement_descriptor,
    transfer_state,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_customer_id,
    v_merchant_id,
    CASE WHEN p_entity_type = 'permit' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'business_license' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'service_application' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'tax_submission' THEN p_entity_id ELSE NULL END,
    CASE WHEN p_entity_type = 'bill' THEN p_entity_id ELSE NULL END,
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
    v_finix_merchant_id,
    v_merchant_name,
    v_category,
    v_subcategory,
    v_statement_descriptor,
    'PENDING',
    now(),
    now()
  ) RETURNING id INTO v_payment_history_id;

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'payment_history_id', v_payment_history_id,
    'service_fee_cents', v_service_fee_cents,
    'total_amount_cents', v_total_amount_cents,
    'user_id', v_user_id,
    'customer_id', v_customer_id,
    'merchant_id', v_merchant_id,
    'finix_merchant_id', v_finix_merchant_id
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