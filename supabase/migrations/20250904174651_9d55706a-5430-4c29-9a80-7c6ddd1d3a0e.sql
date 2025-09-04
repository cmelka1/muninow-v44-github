-- Step 1: Update all pending payment statuses to unpaid
UPDATE permit_applications 
SET payment_status = 'unpaid' 
WHERE payment_status = 'pending';

-- Step 2: Update any partially_paid statuses to unpaid
UPDATE permit_applications 
SET payment_status = 'unpaid' 
WHERE payment_status = 'partially_paid';

-- Step 3: Remove the default value temporarily
ALTER TABLE permit_applications ALTER COLUMN payment_status DROP DEFAULT;

-- Step 4: Create new enum with only paid and unpaid
CREATE TYPE payment_status_enum_new AS ENUM ('paid', 'unpaid');

-- Step 5: Update the column to use the new enum
ALTER TABLE permit_applications 
ALTER COLUMN payment_status TYPE payment_status_enum_new 
USING payment_status::text::payment_status_enum_new;

-- Step 6: Drop old enum and rename new one
DROP TYPE payment_status_enum;
ALTER TYPE payment_status_enum_new RENAME TO payment_status_enum;

-- Step 7: Set the default back to unpaid
ALTER TABLE permit_applications ALTER COLUMN payment_status SET DEFAULT 'unpaid';