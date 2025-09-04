-- Step 1: Update permit_applications - change pending to unpaid
UPDATE permit_applications 
SET payment_status = 'unpaid' 
WHERE payment_status = 'pending';

-- Step 2: Update permit_applications - change partially_paid to unpaid  
UPDATE permit_applications 
SET payment_status = 'unpaid' 
WHERE payment_status = 'partially_paid';

-- Step 3: Update master_bills - change partially_paid to unpaid
UPDATE master_bills 
SET payment_status = 'unpaid' 
WHERE payment_status = 'partially_paid';

-- Step 4: Remove default values temporarily from both tables
ALTER TABLE permit_applications ALTER COLUMN payment_status DROP DEFAULT;
ALTER TABLE master_bills ALTER COLUMN payment_status DROP DEFAULT;

-- Step 5: Create new enum with only paid and unpaid
CREATE TYPE payment_status_enum_new AS ENUM ('paid', 'unpaid');

-- Step 6: Update both tables to use the new enum
ALTER TABLE permit_applications 
ALTER COLUMN payment_status TYPE payment_status_enum_new 
USING payment_status::text::payment_status_enum_new;

ALTER TABLE master_bills 
ALTER COLUMN payment_status TYPE payment_status_enum_new 
USING payment_status::text::payment_status_enum_new;

-- Step 7: Drop old enum and rename new one
DROP TYPE payment_status_enum;
ALTER TYPE payment_status_enum_new RENAME TO payment_status_enum;

-- Step 8: Restore default values
ALTER TABLE permit_applications ALTER COLUMN payment_status SET DEFAULT 'unpaid';
ALTER TABLE master_bills ALTER COLUMN payment_status SET DEFAULT 'unpaid';