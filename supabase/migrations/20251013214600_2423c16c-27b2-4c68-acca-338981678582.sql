-- Fix stuck service application record
UPDATE municipal_service_applications
SET 
  payment_status = 'paid',
  transfer_state = 'SUCCEEDED',
  service_fee_cents = 125,
  total_amount_cents = 2625,
  payment_type = 'PAYMENT_CARD',
  payment_processed_at = '2025-10-13 21:38:58.32907+00',
  finix_transfer_id = 'TRK3P5pzDBYEurTuPMYM3wQ',
  payment_instrument_id = 'PI4DkZxrC7Wq3mK9r8hVDAsP',
  idempotency_uuid = '3777d22b-4ba3-445e-bdd3-1b62ff2ae792',
  updated_at = now()
WHERE id = '02c9848c-c93f-475c-b99d-a94e28393d06';

-- Check for other affected service applications
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO affected_count
  FROM municipal_service_applications
  WHERE payment_status = 'paid' 
    AND payment_type IS NULL;
  
  IF affected_count > 0 THEN
    RAISE NOTICE 'Found % service applications with missing payment_type', affected_count;
  END IF;
END $$;

-- Check for affected business licenses
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO affected_count
  FROM business_license_applications
  WHERE payment_status = 'paid' 
    AND payment_type IS NULL;
  
  IF affected_count > 0 THEN
    RAISE NOTICE 'Found % business licenses with missing payment_type', affected_count;
  END IF;
END $$;

-- Check for affected permits
DO $$
DECLARE
  affected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO affected_count
  FROM permit_applications
  WHERE payment_status = 'paid' 
    AND payment_type IS NULL;
  
  IF affected_count > 0 THEN
    RAISE NOTICE 'Found % permits with missing payment_type', affected_count;
  END IF;
END $$;