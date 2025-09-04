-- Step 1: Update all pending payment statuses to unpaid
UPDATE permit_applications 
SET payment_status = 'unpaid' 
WHERE payment_status = 'pending';

-- Step 2: Remove 'partially_paid' from the enum to only allow 'paid' and 'unpaid'
-- First, ensure no records use 'partially_paid'
UPDATE permit_applications 
SET payment_status = 'unpaid' 
WHERE payment_status = 'partially_paid';

-- Create a new enum with only paid and unpaid
CREATE TYPE payment_status_enum_new AS ENUM ('paid', 'unpaid');

-- Update the table to use the new enum
ALTER TABLE permit_applications 
ALTER COLUMN payment_status TYPE payment_status_enum_new 
USING payment_status::text::payment_status_enum_new;

-- Drop the old enum and rename the new one
DROP TYPE payment_status_enum;
ALTER TYPE payment_status_enum_new RENAME TO payment_status_enum;