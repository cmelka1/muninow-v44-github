-- Drop the old function
DROP FUNCTION IF EXISTS create_booking_with_conflict_check(uuid, uuid, uuid, jsonb, bigint, date, time, time, text);

-- Recreate function with correct column mappings
CREATE OR REPLACE FUNCTION create_booking_with_conflict_check(
  p_tile_id uuid,
  p_user_id uuid,
  p_customer_id uuid,
  p_form_data jsonb,
  p_amount_cents bigint,
  p_booking_date date,
  p_booking_start_time time,
  p_booking_end_time time DEFAULT NULL,
  p_booking_timezone text DEFAULT 'America/New_York',
  p_application_id uuid DEFAULT NULL
)
RETURNS TABLE (
  application_id uuid,
  conflict boolean,
  message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conflict boolean := false;
  v_application_id uuid;
  v_application_number text;
  v_existing_draft uuid;
BEGIN
  -- Check for booking conflicts (excluding draft and terminal statuses)
  SELECT EXISTS(
    SELECT 1
    FROM municipal_service_applications
    WHERE tile_id = p_tile_id
      AND booking_date = p_booking_date
      AND booking_start_time = p_booking_start_time
      AND status NOT IN ('draft', 'denied', 'rejected', 'withdrawn', 'cancelled', 'expired')
  ) INTO v_conflict;

  -- If there's a conflict, return early
  IF v_conflict THEN
    RETURN QUERY SELECT NULL::uuid, true, 'This time slot is already taken.'::text;
    RETURN;
  END IF;

  -- If application_id is provided, update the existing draft
  IF p_application_id IS NOT NULL THEN
    UPDATE municipal_service_applications
    SET
      applicant_name = p_form_data->>'applicant_name',
      applicant_email = p_form_data->>'applicant_email',
      applicant_phone = p_form_data->>'applicant_phone',
      business_legal_name = p_form_data->>'business_legal_name',
      street_address = p_form_data->>'street_address',
      apt_number = p_form_data->>'apt_number',
      city = p_form_data->>'city',
      state = p_form_data->>'state',
      zip_code = p_form_data->>'zip_code',
      country = COALESCE(p_form_data->>'country', 'USA'),
      service_specific_data = p_form_data,
      base_amount_cents = p_amount_cents,
      booking_date = p_booking_date,
      booking_start_time = p_booking_start_time,
      booking_end_time = p_booking_end_time,
      booking_timezone = p_booking_timezone,
      payment_status = CASE 
        WHEN p_amount_cents > 0 THEN 'unpaid'
        ELSE 'not_required'
      END,
      updated_at = now()
    WHERE id = p_application_id;

    RETURN QUERY SELECT p_application_id, false, 'Booking updated successfully.'::text;
    RETURN;
  END IF;

  -- Check if user already has a draft for this tile
  SELECT id INTO v_existing_draft
  FROM municipal_service_applications
  WHERE tile_id = p_tile_id
    AND user_id = p_user_id
    AND status = 'draft'
  LIMIT 1;

  -- If existing draft found, update it
  IF v_existing_draft IS NOT NULL THEN
    UPDATE municipal_service_applications
    SET
      applicant_name = p_form_data->>'applicant_name',
      applicant_email = p_form_data->>'applicant_email',
      applicant_phone = p_form_data->>'applicant_phone',
      business_legal_name = p_form_data->>'business_legal_name',
      street_address = p_form_data->>'street_address',
      apt_number = p_form_data->>'apt_number',
      city = p_form_data->>'city',
      state = p_form_data->>'state',
      zip_code = p_form_data->>'zip_code',
      country = COALESCE(p_form_data->>'country', 'USA'),
      service_specific_data = p_form_data,
      base_amount_cents = p_amount_cents,
      booking_date = p_booking_date,
      booking_start_time = p_booking_start_time,
      booking_end_time = p_booking_end_time,
      booking_timezone = p_booking_timezone,
      payment_status = CASE 
        WHEN p_amount_cents > 0 THEN 'unpaid'
        ELSE 'not_required'
      END,
      updated_at = now()
    WHERE id = v_existing_draft;

    RETURN QUERY SELECT v_existing_draft, false, 'Booking updated successfully.'::text;
    RETURN;
  END IF;

  -- Generate application number
  v_application_number := 'APP-' || to_char(now(), 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 8);
  v_application_id := gen_random_uuid();

  -- Create new application
  INSERT INTO municipal_service_applications (
    id,
    tile_id,
    user_id,
    customer_id,
    application_number,
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
    service_specific_data,
    base_amount_cents,
    status,
    payment_status,
    booking_date,
    booking_start_time,
    booking_end_time,
    booking_timezone
  ) VALUES (
    v_application_id,
    p_tile_id,
    p_user_id,
    p_customer_id,
    v_application_number,
    p_form_data->>'applicant_name',
    p_form_data->>'applicant_email',
    p_form_data->>'applicant_phone',
    p_form_data->>'business_legal_name',
    p_form_data->>'street_address',
    p_form_data->>'apt_number',
    p_form_data->>'city',
    p_form_data->>'state',
    p_form_data->>'zip_code',
    COALESCE(p_form_data->>'country', 'USA'),
    p_form_data,
    p_amount_cents,
    'draft',
    CASE 
      WHEN p_amount_cents > 0 THEN 'unpaid'
      ELSE 'not_required'
    END,
    p_booking_date,
    p_booking_start_time,
    p_booking_end_time,
    p_booking_timezone
  );

  RETURN QUERY SELECT v_application_id, false, 'Booking created successfully.'::text;
END;
$$;