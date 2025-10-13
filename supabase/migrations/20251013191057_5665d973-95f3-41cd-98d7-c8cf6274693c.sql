-- Remove idempotency_id column from all tables (replaced by idempotency_uuid)

-- Drop idempotency_id from business_license_applications
ALTER TABLE public.business_license_applications 
DROP COLUMN IF EXISTS idempotency_id;

-- Drop idempotency_id from permit_applications
ALTER TABLE public.permit_applications 
DROP COLUMN IF EXISTS idempotency_id;

-- Drop idempotency_id from tax_submissions
ALTER TABLE public.tax_submissions 
DROP COLUMN IF EXISTS idempotency_id;

-- Drop idempotency_id from municipal_service_applications
ALTER TABLE public.municipal_service_applications 
DROP COLUMN IF EXISTS idempotency_id;

-- Drop idempotency_id from payment_transactions
ALTER TABLE public.payment_transactions 
DROP COLUMN IF EXISTS idempotency_id;

-- Add comment documenting the migration
COMMENT ON COLUMN public.payment_transactions.idempotency_uuid IS 
'Deterministic UUID v5 generated from entity details, user, session, and amount. Ensures true idempotency with UNIQUE constraint.';