-- Phase 2.1: Add foreign key relationship between permit_applications and municipal_permit_types

-- Step 1: Add new column for foreign key reference
ALTER TABLE permit_applications
ADD COLUMN municipal_permit_type_id UUID REFERENCES municipal_permit_types(id);

-- Step 2: Backfill the foreign key by matching permit_type text to municipal_label
-- This handles cases where the text matches exactly
UPDATE permit_applications pa
SET municipal_permit_type_id = mpt.id
FROM municipal_permit_types mpt
WHERE pa.customer_id = mpt.customer_id
  AND pa.permit_type = mpt.municipal_label
  AND mpt.is_active = true
  AND pa.municipal_permit_type_id IS NULL;

-- Step 3: Create index for query performance
CREATE INDEX idx_permit_applications_municipal_permit_type_id 
ON permit_applications(municipal_permit_type_id);

-- Step 4: Add index on municipal_permit_types for common query pattern
CREATE INDEX IF NOT EXISTS idx_municipal_permit_types_customer_active 
ON municipal_permit_types(customer_id, is_active);

-- Step 5: Add helpful comments
COMMENT ON COLUMN permit_applications.permit_type IS 
'Denormalized field for display/reporting. Should match municipal_permit_types.municipal_label via municipal_permit_type_id foreign key. This field is kept for backward compatibility and quick filtering.';

COMMENT ON COLUMN permit_applications.municipal_permit_type_id IS 
'Foreign key to municipal_permit_types table. Use this for joins to get current fee structure, processing times, and other permit type configuration.';