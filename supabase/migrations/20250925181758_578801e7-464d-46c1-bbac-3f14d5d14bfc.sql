-- Create function to handle tax submission creation before payment
CREATE OR REPLACE FUNCTION public.create_tax_submission_before_payment(
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
  p_staging_id text DEFAULT NULL,
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
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tax_submission_id uuid;
  result jsonb;
BEGIN
  -- Create tax submission with draft status
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
    submission_status,
    payment_status,
    transfer_state,
    submission_date,
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
    'draft',
    'pending',
    'PENDING',
    now(),
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

  -- If staging_id is provided, confirm the staged documents
  IF p_staging_id IS NOT NULL THEN
    UPDATE public.tax_submission_documents
    SET 
      status = 'confirmed',
      tax_submission_id = v_tax_submission_id,
      updated_at = now()
    WHERE staging_id = p_staging_id
      AND status = 'staged';
  END IF;

  -- Return success with tax submission ID
  result := jsonb_build_object(
    'success', true,
    'tax_submission_id', v_tax_submission_id
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