-- Phase 1: Add idempotency_uuid and idempotency_metadata columns to payment-related tables

-- Add columns to payment_transactions
ALTER TABLE public.payment_transactions 
ADD COLUMN IF NOT EXISTS idempotency_uuid UUID,
ADD COLUMN IF NOT EXISTS idempotency_metadata JSONB DEFAULT '{}'::jsonb;

-- Add columns to tax_submissions
ALTER TABLE public.tax_submissions 
ADD COLUMN IF NOT EXISTS idempotency_uuid UUID,
ADD COLUMN IF NOT EXISTS idempotency_metadata JSONB DEFAULT '{}'::jsonb;

-- Add columns to permit_applications
ALTER TABLE public.permit_applications 
ADD COLUMN IF NOT EXISTS idempotency_uuid UUID,
ADD COLUMN IF NOT EXISTS idempotency_metadata JSONB DEFAULT '{}'::jsonb;

-- Add columns to business_license_applications
ALTER TABLE public.business_license_applications 
ADD COLUMN IF NOT EXISTS idempotency_uuid UUID,
ADD COLUMN IF NOT EXISTS idempotency_metadata JSONB DEFAULT '{}'::jsonb;

-- Add columns to municipal_service_applications
ALTER TABLE public.municipal_service_applications 
ADD COLUMN IF NOT EXISTS idempotency_uuid UUID,
ADD COLUMN IF NOT EXISTS idempotency_metadata JSONB DEFAULT '{}'::jsonb;

-- Create indexes for performance on idempotency_uuid
CREATE INDEX IF NOT EXISTS idx_payment_transactions_idempotency_uuid 
ON public.payment_transactions(idempotency_uuid) WHERE idempotency_uuid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tax_submissions_idempotency_uuid 
ON public.tax_submissions(idempotency_uuid) WHERE idempotency_uuid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_permit_applications_idempotency_uuid 
ON public.permit_applications(idempotency_uuid) WHERE idempotency_uuid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_business_license_applications_idempotency_uuid 
ON public.business_license_applications(idempotency_uuid) WHERE idempotency_uuid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_municipal_service_applications_idempotency_uuid 
ON public.municipal_service_applications(idempotency_uuid) WHERE idempotency_uuid IS NOT NULL;

-- Create unique constraints for deduplication on payment_transactions
CREATE UNIQUE INDEX IF NOT EXISTS unique_payment_transactions_idempotency_uuid 
ON public.payment_transactions(idempotency_uuid) WHERE idempotency_uuid IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.payment_transactions.idempotency_uuid IS 'Deterministic UUID for payment deduplication using uuidv5';
COMMENT ON COLUMN public.payment_transactions.idempotency_metadata IS 'JSONB metadata containing session_id, entity_type, user_id, payment_method, etc. for debugging';

COMMENT ON COLUMN public.tax_submissions.idempotency_uuid IS 'Deterministic UUID for tax submission deduplication';
COMMENT ON COLUMN public.tax_submissions.idempotency_metadata IS 'JSONB metadata for debugging and tracking';

COMMENT ON COLUMN public.permit_applications.idempotency_uuid IS 'Deterministic UUID for permit application deduplication';
COMMENT ON COLUMN public.permit_applications.idempotency_metadata IS 'JSONB metadata for debugging and tracking';

COMMENT ON COLUMN public.business_license_applications.idempotency_uuid IS 'Deterministic UUID for business license deduplication';
COMMENT ON COLUMN public.business_license_applications.idempotency_metadata IS 'JSONB metadata for debugging and tracking';

COMMENT ON COLUMN public.municipal_service_applications.idempotency_uuid IS 'Deterministic UUID for service application deduplication';
COMMENT ON COLUMN public.municipal_service_applications.idempotency_metadata IS 'JSONB metadata for debugging and tracking';