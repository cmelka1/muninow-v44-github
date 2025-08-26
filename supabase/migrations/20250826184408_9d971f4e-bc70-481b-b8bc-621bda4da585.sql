-- Add merchant fee profile columns to business_license_applications table
-- Add fee calculation columns (matching permit_applications structure)
ALTER TABLE public.business_license_applications 
ADD COLUMN basis_points integer,
ADD COLUMN fixed_fee integer,
ADD COLUMN ach_basis_points integer,
ADD COLUMN ach_fixed_fee integer;

-- Add additional merchant/payment tracking fields
ALTER TABLE public.business_license_applications
ADD COLUMN merchant_name text,
ADD COLUMN finix_transfer_id text;

-- Fix merchant_fee_profile_id data type to match permits (from text to uuid)
ALTER TABLE public.business_license_applications 
ALTER COLUMN merchant_fee_profile_id TYPE uuid USING merchant_fee_profile_id::uuid;