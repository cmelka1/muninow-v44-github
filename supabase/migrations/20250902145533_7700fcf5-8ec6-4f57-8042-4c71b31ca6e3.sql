-- Add Enhanced Merchant & Financial Integration and Payment Processing fields to municipal_service_applications
ALTER TABLE public.municipal_service_applications 
ADD COLUMN payment_instrument_id text,
ADD COLUMN payment_method_type text,
ADD COLUMN payment_processed_at timestamp with time zone,
ADD COLUMN transfer_state text DEFAULT 'PENDING',
ADD COLUMN basis_points integer,
ADD COLUMN fixed_fee integer,
ADD COLUMN ach_basis_points integer,
ADD COLUMN ach_fixed_fee integer,
ADD COLUMN merchant_fee_profile_id uuid,
ADD COLUMN finix_identity_id text,
ADD COLUMN finix_merchant_id text,
ADD COLUMN merchant_finix_identity_id text,
ADD COLUMN merchant_id uuid,
ADD COLUMN merchant_name text;