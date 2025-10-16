-- Create the create_license_renewal function
CREATE OR REPLACE FUNCTION public.create_license_renewal(p_original_license_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_license_id UUID;
  v_original_license RECORD;
BEGIN
  -- Get the original license data
  SELECT * INTO v_original_license
  FROM business_license_applications
  WHERE id = p_original_license_id
    AND application_status = 'issued';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Original license not found or not issued';
  END IF;
  
  -- Create the renewal application
  INSERT INTO business_license_applications (
    user_id,
    customer_id,
    merchant_id,
    license_type_id,
    application_status,
    business_legal_name,
    doing_business_as,
    business_type,
    business_description,
    federal_ein,
    state_tax_id,
    business_street_address,
    business_apt_number,
    business_city,
    business_state,
    business_zip_code,
    business_country,
    business_phone,
    business_email,
    owner_first_name,
    owner_last_name,
    owner_title,
    owner_phone,
    owner_email,
    owner_street_address,
    owner_apt_number,
    owner_city,
    owner_state,
    owner_zip_code,
    owner_country,
    base_amount_cents,
    is_renewal,
    parent_license_id,
    renewal_generation,
    original_issue_date,
    form_responses,
    additional_info
  )
  VALUES (
    v_original_license.user_id,
    v_original_license.customer_id,
    v_original_license.merchant_id,
    v_original_license.license_type_id,
    'draft',
    v_original_license.business_legal_name,
    v_original_license.doing_business_as,
    v_original_license.business_type,
    v_original_license.business_description,
    v_original_license.federal_ein,
    v_original_license.state_tax_id,
    v_original_license.business_street_address,
    v_original_license.business_apt_number,
    v_original_license.business_city,
    v_original_license.business_state,
    v_original_license.business_zip_code,
    v_original_license.business_country,
    v_original_license.business_phone,
    v_original_license.business_email,
    v_original_license.owner_first_name,
    v_original_license.owner_last_name,
    v_original_license.owner_title,
    v_original_license.owner_phone,
    v_original_license.owner_email,
    v_original_license.owner_street_address,
    v_original_license.owner_apt_number,
    v_original_license.owner_city,
    v_original_license.owner_state,
    v_original_license.owner_zip_code,
    v_original_license.owner_country,
    v_original_license.base_amount_cents,
    true,
    p_original_license_id,
    v_original_license.renewal_generation + 1,
    COALESCE(v_original_license.original_issue_date, v_original_license.issued_at),
    v_original_license.form_responses,
    v_original_license.additional_info
  )
  RETURNING id INTO v_new_license_id;
  
  -- Update the original license to mark it as renewed
  UPDATE business_license_applications
  SET renewal_status = 'renewed'
  WHERE id = p_original_license_id;
  
  -- Record in renewal history
  INSERT INTO business_license_renewal_history (
    original_license_id,
    renewed_license_id,
    renewal_generation,
    renewed_by
  )
  VALUES (
    p_original_license_id,
    v_new_license_id,
    v_original_license.renewal_generation + 1,
    auth.uid()
  );
  
  RETURN v_new_license_id;
END;
$$;

-- Enable pg_cron extension for automated scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule check_expiring_licenses to run daily at 8 AM UTC
SELECT cron.schedule(
  'check-expiring-business-licenses',
  '0 8 * * *',
  $$SELECT check_expiring_licenses()$$
);

-- Execute check_expiring_licenses immediately to update all current licenses
SELECT check_expiring_licenses();