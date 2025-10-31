-- Fix business license renewal window to only allow renewals within 30 days of expiration

-- Update the create_license_renewal function to only allow renewals for expiring_soon or expired licenses
CREATE OR REPLACE FUNCTION create_license_renewal(p_original_license_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_original_license business_license_applications%ROWTYPE;
  v_renewal_license_id UUID;
  v_new_generation INTEGER;
BEGIN
  -- Get the original license
  SELECT * INTO v_original_license
  FROM business_license_applications
  WHERE id = p_original_license_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Original license not found: %', p_original_license_id;
  END IF;
  
  -- Verify the license is issued and eligible for renewal
  IF v_original_license.application_status != 'issued' THEN
    RAISE EXCEPTION 'Cannot renew a license that is not issued';
  END IF;
  
  -- Only allow renewal if license is expiring soon (<=30 days) or expired
  IF v_original_license.renewal_status NOT IN ('expiring_soon', 'expired') THEN
    RAISE EXCEPTION 'License is not eligible for renewal (status: %). Renewals can only be initiated within 30 days of expiration or after expiration.', v_original_license.renewal_status;
  END IF;
  
  -- Calculate the new generation
  v_new_generation := COALESCE(v_original_license.renewal_generation, 0) + 1;
  
  -- Create the renewal license application
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
    merchant_name,
    is_renewal,
    parent_license_id,
    renewal_generation,
    original_issue_date,
    payment_status
  )
  SELECT
    user_id,
    customer_id,
    merchant_id,
    license_type_id,
    'draft'::business_license_status_enum,
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
    merchant_name,
    true, -- is_renewal
    p_original_license_id, -- parent_license_id
    v_new_generation,
    COALESCE(v_original_license.original_issue_date, v_original_license.issued_at, v_original_license.approved_at),
    'unpaid'::text
  FROM business_license_applications
  WHERE id = p_original_license_id
  RETURNING id INTO v_renewal_license_id;
  
  -- Log the renewal in history
  INSERT INTO business_license_renewal_history (
    original_license_id,
    renewed_license_id,
    renewal_generation,
    renewed_by
  )
  VALUES (
    p_original_license_id,
    v_renewal_license_id,
    v_new_generation,
    auth.uid()
  );
  
  -- Mark the original license as renewed
  UPDATE business_license_applications
  SET renewal_status = 'renewed'
  WHERE id = p_original_license_id;
  
  RETURN v_renewal_license_id;
END;
$$;

-- Update the function comment to reflect the 30-day renewal window
COMMENT ON FUNCTION create_license_renewal(UUID) IS 
  'Creates a renewal application for an issued business license. Renewals can only be initiated within 30 days of expiration (renewal_status = expiring_soon) or after expiration (renewal_status = expired). Copies data from original license and sets up renewal tracking.';