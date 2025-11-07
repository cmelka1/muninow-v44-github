-- Phase 1B: Database schema changes (now that enum values are committed)

-- 1. Extend municipal_service_tiles with booking configuration
ALTER TABLE public.municipal_service_tiles
ADD COLUMN IF NOT EXISTS has_time_slots BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS booking_mode TEXT CHECK (booking_mode IN ('time_period', 'start_time')),
ADD COLUMN IF NOT EXISTS time_slot_config JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.municipal_service_tiles.has_time_slots IS 'Whether this service requires time slot booking';
COMMENT ON COLUMN public.municipal_service_tiles.booking_mode IS 'Booking mode: time_period (with duration) or start_time (just start time)';
COMMENT ON COLUMN public.municipal_service_tiles.time_slot_config IS 'JSON config: {slot_duration_minutes, available_days, start_time, end_time, max_advance_days, blackout_dates, timezone}';

-- 2. Add booking-related fields to municipal_service_applications
ALTER TABLE public.municipal_service_applications
ADD COLUMN IF NOT EXISTS booking_date DATE,
ADD COLUMN IF NOT EXISTS booking_start_time TIME,
ADD COLUMN IF NOT EXISTS booking_end_time TIME,
ADD COLUMN IF NOT EXISTS booking_timezone TEXT DEFAULT 'America/New_York',
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN public.municipal_service_applications.booking_date IS 'Date of the reserved time slot';
COMMENT ON COLUMN public.municipal_service_applications.booking_start_time IS 'Start time of the reserved slot';
COMMENT ON COLUMN public.municipal_service_applications.booking_end_time IS 'End time of the reserved slot (for time_period mode)';
COMMENT ON COLUMN public.municipal_service_applications.booking_timezone IS 'Timezone for the booking (municipal facility timezone)';

-- 3. Create index for booking conflict checks
CREATE INDEX IF NOT EXISTS idx_service_applications_booking_lookup 
ON public.municipal_service_applications(tile_id, booking_date, status)
WHERE booking_date IS NOT NULL AND status NOT IN ('denied', 'rejected', 'withdrawn', 'cancelled', 'expired');

-- 4. Create RPC function for atomic booking with conflict check
CREATE OR REPLACE FUNCTION public.create_booking_with_conflict_check(
  p_tile_id UUID,
  p_user_id UUID,
  p_customer_id UUID,
  p_booking_date DATE,
  p_booking_start_time TIME,
  p_booking_end_time TIME,
  p_booking_timezone TEXT,
  p_form_data JSONB,
  p_amount_cents BIGINT
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
BEGIN
  -- Lock the tile row to prevent concurrent bookings
  PERFORM 1 FROM public.municipal_service_tiles
  WHERE id = p_tile_id
  FOR UPDATE;
  
  -- Check for booking conflicts (submitted or later status, not denied/rejected/withdrawn/cancelled/expired)
  SELECT EXISTS (
    SELECT 1 
    FROM public.municipal_service_applications
    WHERE tile_id = p_tile_id
      AND booking_date = p_booking_date
      AND status NOT IN ('denied', 'rejected', 'withdrawn', 'cancelled', 'expired')
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
  
  -- Generate application number
  v_application_number := generate_service_application_number();
  
  -- Create the application with booking details
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
    'submitted',
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
  
  RETURN jsonb_build_object(
    'success', true,
    'application_id', v_application_id,
    'application_number', v_application_number
  );
END;
$$;

-- 5. Update trigger to handle 'reserved' status for bookable services
CREATE OR REPLACE FUNCTION public.enable_payment_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_tile RECORD;
BEGIN
  -- When a service application is approved, check if payment is needed
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    -- Get tile information
    SELECT amount_cents, allow_user_defined_amount, has_time_slots
    INTO v_tile
    FROM municipal_service_tiles 
    WHERE id = NEW.tile_id;
    
    -- Check if the service tile has a fee
    IF v_tile.amount_cents > 0 OR v_tile.allow_user_defined_amount = true THEN
      -- Enable payment for this application
      NEW.payment_status := 'unpaid';
    ELSE
      -- No payment required, set final status based on service type
      IF v_tile.has_time_slots = true THEN
        NEW.status := 'reserved';
      ELSE
        NEW.status := 'issued';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;