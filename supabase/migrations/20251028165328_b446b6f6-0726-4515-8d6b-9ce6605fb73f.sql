-- Add requires_payment column to municipal_service_tiles table
ALTER TABLE public.municipal_service_tiles 
ADD COLUMN requires_payment boolean DEFAULT true NOT NULL;

-- Add column comment for clarity
COMMENT ON COLUMN public.municipal_service_tiles.requires_payment IS 
  'Whether this service requires payment processing. If false, the service is free and no merchant/payment is needed.';

-- Update existing service tiles to require payment (backward compatibility)
UPDATE public.municipal_service_tiles 
SET requires_payment = true;