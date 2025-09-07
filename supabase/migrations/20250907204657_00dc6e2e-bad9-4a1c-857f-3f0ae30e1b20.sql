-- Drop all old versions of create_unified_payment_transaction function
DROP FUNCTION IF EXISTS public.create_unified_payment_transaction(
  uuid, uuid, uuid, text, bigint, text, text, text, text, text, text, text, text, text, text, text
);

-- Drop the old create_tax_submission_with_payment function that has conflicting signature
DROP FUNCTION IF EXISTS public.create_tax_submission_with_payment(
  uuid, uuid, uuid, text, date, date, integer, bigint, jsonb, text, text, bigint, bigint, text, text, text, text, text, text, text, text, text, text, text, text, text
);

-- Keep only the correct version that works with payment_transactions table
-- (This is already created in the previous migration, so no need to recreate)