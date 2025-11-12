-- Create database function to cleanup abandoned bookings
CREATE OR REPLACE FUNCTION public.cleanup_abandoned_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update abandoned draft bookings older than 30 minutes to expired status
  UPDATE municipal_service_applications
  SET 
    status = 'expired',
    updated_at = now()
  WHERE status = 'draft'
    AND booking_date IS NOT NULL
    AND booking_start_time IS NOT NULL
    AND created_at < now() - INTERVAL '30 minutes';
    
  -- Log the cleanup operation
  RAISE NOTICE 'Cleaned up abandoned bookings older than 30 minutes';
END;
$$;

-- Schedule the cleanup function to run every 15 minutes
SELECT cron.schedule(
  'cleanup-abandoned-bookings-every-15-min',
  '*/15 * * * *',  -- Every 15 minutes
  $$SELECT public.cleanup_abandoned_bookings()$$
);