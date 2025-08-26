-- Add missing payment tracking columns to business_license_applications table
ALTER TABLE public.business_license_applications 
ADD COLUMN payment_instrument_id text,
ADD COLUMN payment_method_type text,
ADD COLUMN payment_processed_at timestamp with time zone;