-- Update payment_status_enum to only allow 'paid' and 'unpaid'
-- Remove 'partially_paid' and 'pending' options since partial payments are not allowed

-- First, update any existing 'partially_paid' or 'pending' records to 'unpaid'
UPDATE master_bills SET payment_status = 'unpaid' 
WHERE payment_status NOT IN ('paid', 'unpaid');

-- Check other tables that might use payment_status
UPDATE payment_history SET payment_status = 'unpaid' 
WHERE payment_status NOT IN ('paid', 'unpaid');

UPDATE business_license_applications SET payment_status = 'unpaid' 
WHERE payment_status NOT IN ('paid', 'unpaid');

UPDATE permit_applications SET payment_status = 'unpaid' 
WHERE payment_status NOT IN ('paid', 'unpaid');

UPDATE municipal_service_applications SET payment_status = 'unpaid' 
WHERE payment_status NOT IN ('paid', 'unpaid');

UPDATE tax_submissions SET payment_status = 'unpaid' 
WHERE payment_status NOT IN ('paid', 'unpaid');

-- Drop the existing enum and recreate with only paid/unpaid
DROP TYPE IF EXISTS payment_status_enum CASCADE;
CREATE TYPE payment_status_enum AS ENUM ('paid', 'unpaid');

-- Recreate the columns that use this enum
ALTER TABLE master_bills 
  ALTER COLUMN payment_status TYPE payment_status_enum 
  USING payment_status::text::payment_status_enum,
  ALTER COLUMN payment_status SET DEFAULT 'unpaid'::payment_status_enum;