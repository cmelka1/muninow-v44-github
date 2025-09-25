-- Drop the existing create_tax_submission_before_payment function completely
DROP FUNCTION IF EXISTS public.create_tax_submission_before_payment;

-- Create new create_tax_submission_before_payment function with correct parameters and logic
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
AS $$
DECLARE
  v_tax_submission_id uuid;
  result jsonb;
BEGIN
  -- Create tax submission record
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
    submission_status,
    payment_status,
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
    'draft',
    'unpaid',
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

  -- Return success with submission ID
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