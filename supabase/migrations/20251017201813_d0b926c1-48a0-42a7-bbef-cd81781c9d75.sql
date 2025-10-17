-- Update create_service_application_renewal function to enforce renewal window
CREATE OR REPLACE FUNCTION public.create_service_application_renewal(
  p_original_application_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_application_id UUID;
  v_original_application RECORD;
  v_tile_record RECORD;
  v_days_until_expiration INTEGER;
  v_renewal_reminder_days INTEGER;
  v_renewal_available_date DATE;
BEGIN
  -- Get the original application details
  SELECT * INTO v_original_application
  FROM public.municipal_service_applications
  WHERE id = p_original_application_id
    AND user_id = auth.uid()
    AND status = 'issued';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Original application not found, not issued, or does not belong to you';
  END IF;
  
  -- Verify the service tile is renewable
  SELECT is_renewable, renewal_frequency, renewal_reminder_days INTO v_tile_record
  FROM public.municipal_service_tiles
  WHERE id = v_original_application.tile_id;
  
  IF v_tile_record.is_renewable = false THEN
    RAISE EXCEPTION 'This service is not renewable';
  END IF;
  
  -- Check if application has an expiration date
  IF v_original_application.expires_at IS NULL THEN
    RAISE EXCEPTION 'Application does not have an expiration date';
  END IF;
  
  -- Calculate days until expiration
  v_days_until_expiration := EXTRACT(DAY FROM (v_original_application.expires_at::date - CURRENT_DATE));
  
  -- Get renewal reminder days (default to 30 if not set)
  v_renewal_reminder_days := COALESCE(v_tile_record.renewal_reminder_days, 30);
  
  -- Check if within renewal window
  IF v_days_until_expiration > v_renewal_reminder_days THEN
    v_renewal_available_date := v_original_application.expires_at::date - (v_renewal_reminder_days || ' days')::INTERVAL;
    RAISE EXCEPTION 'Renewal not yet available. You can renew starting on % (% days before expiration)', 
      v_renewal_available_date, v_renewal_reminder_days;
  END IF;
  
  -- Create the renewal application with approved status
  INSERT INTO public.municipal_service_applications (
    user_id,
    customer_id,
    tile_id,
    merchant_id,
    status,
    approved_at,
    assigned_reviewer_id,
    applicant_name,
    applicant_email,
    applicant_phone,
    business_legal_name,
    street_address,
    apt_number,
    city,
    state,
    zip_code,
    country,
    base_amount_cents,
    service_specific_data,
    additional_information,
    is_renewal,
    parent_application_id,
    renewal_generation,
    original_issue_date,
    service_name,
    merchant_name,
    finix_merchant_id,
    merchant_finix_identity_id,
    merchant_fee_profile_id
  ) VALUES (
    v_original_application.user_id,
    v_original_application.customer_id,
    v_original_application.tile_id,
    v_original_application.merchant_id,
    'approved', -- Auto-approve renewals
    NOW(), -- Set approved timestamp
    v_original_application.assigned_reviewer_id,
    v_original_application.applicant_name,
    v_original_application.applicant_email,
    v_original_application.applicant_phone,
    v_original_application.business_legal_name,
    v_original_application.street_address,
    v_original_application.apt_number,
    v_original_application.city,
    v_original_application.state,
    v_original_application.zip_code,
    v_original_application.country,
    v_original_application.base_amount_cents,
    v_original_application.service_specific_data,
    v_original_application.additional_information,
    true, -- is_renewal
    p_original_application_id, -- parent_application_id
    COALESCE(v_original_application.renewal_generation, 0) + 1,
    COALESCE(v_original_application.original_issue_date, v_original_application.issued_at),
    v_original_application.service_name,
    v_original_application.merchant_name,
    v_original_application.finix_merchant_id,
    v_original_application.merchant_finix_identity_id,
    v_original_application.merchant_fee_profile_id
  )
  RETURNING id INTO v_new_application_id;
  
  -- Record the renewal in history
  INSERT INTO public.service_application_renewal_history (
    original_application_id,
    renewed_application_id,
    renewal_generation,
    renewed_by
  ) VALUES (
    p_original_application_id,
    v_new_application_id,
    COALESCE(v_original_application.renewal_generation, 0) + 1,
    auth.uid()
  );
  
  RETURN v_new_application_id;
END;
$$;