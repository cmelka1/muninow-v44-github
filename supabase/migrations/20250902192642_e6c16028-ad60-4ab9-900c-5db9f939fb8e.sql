-- Add missing columns to municipal_service_applications table
ALTER TABLE public.municipal_service_applications 
ADD COLUMN finix_payment_instrument_id TEXT,
ADD COLUMN service_name TEXT;

-- Add helpful comments
COMMENT ON COLUMN public.municipal_service_applications.finix_payment_instrument_id IS 'Finix payment instrument ID (PIxxx format)';
COMMENT ON COLUMN public.municipal_service_applications.service_name IS 'The actual service name like "Alarm System Permit" or "Liquor License Application"';