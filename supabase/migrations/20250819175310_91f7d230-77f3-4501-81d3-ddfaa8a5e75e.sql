-- Add allow_user_defined_amount column to municipal_service_tiles table
ALTER TABLE public.municipal_service_tiles 
ADD COLUMN allow_user_defined_amount BOOLEAN NOT NULL DEFAULT false;

-- Add amount_cents column to municipal_service_applications table  
ALTER TABLE public.municipal_service_applications 
ADD COLUMN amount_cents BIGINT;