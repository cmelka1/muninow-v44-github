-- First, create an immutable function to extract date from timestamp
CREATE OR REPLACE FUNCTION public.immutable_date(timestamp with time zone)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT $1::date;
$$;

-- Add unique constraints to prevent duplicate payments using the immutable function
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_permit_duplicate_prevention
ON public.payment_transactions (
  permit_id,
  payment_instrument_id,
  base_amount_cents,
  public.immutable_date(created_at)
)
WHERE permit_id IS NOT NULL 
  AND payment_status IN ('pending', 'succeeded', 'processing');

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_license_duplicate_prevention
ON public.payment_transactions (
  business_license_id,
  payment_instrument_id,
  base_amount_cents,
  public.immutable_date(created_at)
)
WHERE business_license_id IS NOT NULL 
  AND payment_status IN ('pending', 'succeeded', 'processing');

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_service_duplicate_prevention
ON public.payment_transactions (
  service_application_id,
  payment_instrument_id,
  base_amount_cents,
  public.immutable_date(created_at)
)
WHERE service_application_id IS NOT NULL 
  AND payment_status IN ('pending', 'succeeded', 'processing');

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_transactions_tax_duplicate_prevention
ON public.payment_transactions (
  tax_submission_id,
  payment_instrument_id,
  base_amount_cents,
  public.immutable_date(created_at)
)
WHERE tax_submission_id IS NOT NULL 
  AND payment_status IN ('pending', 'succeeded', 'processing');

-- Add comments explaining the constraints
COMMENT ON INDEX idx_payment_transactions_permit_duplicate_prevention IS 
'Prevents duplicate permit payments for the same permit, payment instrument, and amount on the same day';

COMMENT ON INDEX idx_payment_transactions_license_duplicate_prevention IS 
'Prevents duplicate license payments for the same license, payment instrument, and amount on the same day';

COMMENT ON INDEX idx_payment_transactions_service_duplicate_prevention IS 
'Prevents duplicate service payments for the same service, payment instrument, and amount on the same day';

COMMENT ON INDEX idx_payment_transactions_tax_duplicate_prevention IS 
'Prevents duplicate tax payments for the same tax submission, payment instrument, and amount on the same day';