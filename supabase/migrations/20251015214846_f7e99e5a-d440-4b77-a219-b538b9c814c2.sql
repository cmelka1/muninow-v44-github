-- Fix tax_submissions where total_amount_due_cents is incorrect
-- It should equal base_amount_cents + service_fee_cents

UPDATE tax_submissions
SET total_amount_due_cents = base_amount_cents + COALESCE(service_fee_cents, 0)
WHERE total_amount_due_cents != (base_amount_cents + COALESCE(service_fee_cents, 0))
  AND payment_status = 'paid';

-- Log the changes
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Fixed % tax submission records with incorrect total_amount_due_cents', updated_count;
END $$;