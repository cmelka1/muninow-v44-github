-- Step 1: Update invalid values using text comparison (bypass enum validation)
-- Fix permit_applications first
UPDATE permit_applications 
SET payment_status = 'unpaid'::payment_status_enum
WHERE payment_status::text = 'pending';

UPDATE permit_applications 
SET payment_status = 'unpaid'::payment_status_enum
WHERE payment_status = 'partially_paid'::payment_status_enum;

-- Step 2: Fix master_bills 
UPDATE master_bills 
SET payment_status = 'unpaid'::payment_status_enum
WHERE payment_status = 'partially_paid'::payment_status_enum;

-- Step 3: Now modify the enum to only allow paid and unpaid
-- Remove defaults temporarily
ALTER TABLE permit_applications ALTER COLUMN payment_status DROP DEFAULT;
ALTER TABLE master_bills ALTER COLUMN payment_status DROP DEFAULT;

-- Create new enum
CREATE TYPE payment_status_enum_new AS ENUM ('paid', 'unpaid');

-- Update columns to use new enum
ALTER TABLE permit_applications 
ALTER COLUMN payment_status TYPE payment_status_enum_new 
USING payment_status::text::payment_status_enum_new;

ALTER TABLE master_bills 
ALTER COLUMN payment_status TYPE payment_status_enum_new 
USING payment_status::text::payment_status_enum_new;

-- Replace old enum
DROP TYPE payment_status_enum;
ALTER TYPE payment_status_enum_new RENAME TO payment_status_enum;

-- Restore defaults
ALTER TABLE permit_applications ALTER COLUMN payment_status SET DEFAULT 'unpaid';
ALTER TABLE master_bills ALTER COLUMN payment_status SET DEFAULT 'unpaid';