-- Drop the old function signature before creating the new one
DROP FUNCTION IF EXISTS public.create_booking_with_conflict_check(UUID, UUID, UUID, DATE, TIME, TIME, TEXT, JSONB, BIGINT);

-- Create the updated function with optional p_application_id parameter
CREATE OR REPLACE FUNCTION public.create_booking_with_conflict_check(
  p_application_id UUID DEFAULT NULL,  -- Optional: if provided, update existing draft
  p_tile_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_customer_id UUID DEFAULT NULL,
  p_booking_date DATE DEFAULT NULL,
  p_booking_start_time TIME DEFAULT NULL,
  p_booking_end_time TIME DEFAULT NULL,
  p_booking_timezone TEXT DEFAULT NULL,
  p_form_data JSONB DEFAULT NULL,
  p_amount_cents BIGINT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_application_id UUID;
  v_has_conflict BOOLEAN;
  v_application_number TEXT;
  v_existing_app RECORD;
BEGIN
  -- Lock the tile row to prevent concurrent bookings
  PERFORM 1 FROM public.municipal_service_tiles
  WHERE id = p_tile_id
  FOR UPDATE;
  
  -- Check for booking conflicts (exclude the current draft if updating)
  SELECT EXISTS (
    SELECT 1 
    FROM public.municipal_service_applications
    WHERE tile_id = p_tile_id
      AND booking_date = p_booking_date
      AND status NOT IN ('denied', 'rejected', 'withdrawn', 'cancelled', 'expired')
      AND (p_application_id IS NULL OR id != p_application_id)  -- Exclude current draft
      AND (
        -- Time period overlap check
        (p_booking_end_time IS NOT NULL AND booking_end_time IS NOT NULL AND
         p_booking_start_time < booking_end_time AND p_booking_end_time > booking_start_time)
        OR
        -- Start time exact match check
        (p_booking_end_time IS NULL AND booking_end_time IS NULL AND
         p_booking_start_time = booking_start_time)
      )
  ) INTO v_has_conflict;
  
  IF v_has_conflict THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'conflict',
      'message', 'This time slot is no longer available. Please select a different time.'
    );
  END IF;
  
  -- If application_id provided, UPDATE existing draft
  IF p_application_id IS NOT NULL THEN
    -- Verify the application exists and is a draft
    SELECT * INTO v_existing_app
    FROM public.municipal_service_applications
    WHERE id = p_application_id AND status = 'draft';
    
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'not_found',
        'message', 'Draft application not found or already submitted.'
      );
    END IF;
    
    -- Update the existing draft with booking details
    UPDATE public.municipal_service_applications
    SET
      form_data = p_form_data,
      amount_cents = p_amount_cents,
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
    
    v_application_id := p_application_id;
    v_application_number := v_existing_app.application_number;
  ELSE
    -- Generate application number for new application
    v_application_number := generate_service_application_number();
    
    -- Create NEW application as draft (not submitted)
    INSERT INTO public.municipal_service_applications (
      tile_id,
      user_id,
      customer_id,
      application_number,
      form_data,
      amount_cents,
      status,
      payment_status,
      booking_date,
      booking_start_time,
      booking_end_time,
      booking_timezone
    ) VALUES (
      p_tile_id,
      p_user_id,
      p_customer_id,
      v_application_number,
      p_form_data,
      p_amount_cents,
      'draft',  -- Changed from 'submitted' to 'draft'
      CASE 
        WHEN p_amount_cents > 0 THEN 'unpaid'
        ELSE 'not_required'
      END,
      p_booking_date,
      p_booking_start_time,
      p_booking_end_time,
      p_booking_timezone
    )
    RETURNING id INTO v_application_id;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'application_id', v_application_id,
    'application_number', v_application_number
  );
END;
$$;

COMMENT ON FUNCTION public.create_booking_with_conflict_check IS 'Creates or updates service applications with time slot bookings. Handles both new applications and existing drafts. Creates applications in draft status until payment completes.';