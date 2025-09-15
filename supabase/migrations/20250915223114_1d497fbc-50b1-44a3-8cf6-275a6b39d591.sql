-- Add issued_at column to municipal_service_applications to align with permits and business licenses
ALTER TABLE public.municipal_service_applications 
ADD COLUMN issued_at timestamp with time zone;