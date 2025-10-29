-- =====================================================
-- Migration: Update permit_applications to reference permit_types_v2
-- =====================================================

-- Step 1: Add new foreign key column
ALTER TABLE public.permit_applications 
ADD COLUMN IF NOT EXISTS permit_type_id_v2 UUID;

-- Step 2: Populate permit_type_id_v2 from existing municipal_permit_type_id
UPDATE public.permit_applications pa
SET permit_type_id_v2 = (
  SELECT ptv2.id 
  FROM public.permit_types_v2 ptv2
  JOIN public.municipal_permit_types mpt ON (
    mpt.customer_id = ptv2.customer_id 
    AND mpt.municipal_label = ptv2.name
  )
  WHERE mpt.id = pa.municipal_permit_type_id
  LIMIT 1
)
WHERE pa.municipal_permit_type_id IS NOT NULL
AND pa.permit_type_id_v2 IS NULL;

-- Step 3: For any orphaned records, try to match by permit_type TEXT field
UPDATE public.permit_applications pa
SET permit_type_id_v2 = (
  SELECT id FROM public.permit_types_v2 
  WHERE customer_id = pa.customer_id 
  AND name = pa.permit_type
  LIMIT 1
)
WHERE pa.permit_type_id_v2 IS NULL;

-- Step 4: Verify all applications have been migrated
DO $$
DECLARE
  unmigrated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmigrated_count
  FROM public.permit_applications
  WHERE permit_type_id_v2 IS NULL;
  
  IF unmigrated_count > 0 THEN
    RAISE WARNING 'Warning: % permit applications could not be migrated to permit_type_id_v2', unmigrated_count;
  ELSE
    RAISE NOTICE 'Success: All permit applications migrated to permit_type_id_v2';
  END IF;
END $$;

-- Step 5: Make the new column NOT NULL (after data migration)
ALTER TABLE public.permit_applications 
ALTER COLUMN permit_type_id_v2 SET NOT NULL;

-- Step 6: Add foreign key constraint
ALTER TABLE public.permit_applications
ADD CONSTRAINT fk_permit_applications_permit_type_v2 
FOREIGN KEY (permit_type_id_v2) 
REFERENCES public.permit_types_v2(id) 
ON DELETE RESTRICT;

-- Step 7: Create index for performance
CREATE INDEX idx_permit_applications_permit_type_v2 
ON public.permit_applications(permit_type_id_v2);

-- Step 8: Drop old columns
ALTER TABLE public.permit_applications DROP COLUMN IF EXISTS permit_type;
ALTER TABLE public.permit_applications DROP COLUMN IF EXISTS municipal_permit_type_id;

-- Step 9: Rename new column to final name
ALTER TABLE public.permit_applications 
RENAME COLUMN permit_type_id_v2 TO permit_type_id;

-- Step 10: Rename constraint for clarity
ALTER TABLE public.permit_applications 
RENAME CONSTRAINT fk_permit_applications_permit_type_v2 
TO fk_permit_applications_permit_type;

-- Step 11: Rename index for clarity
ALTER INDEX idx_permit_applications_permit_type_v2 
RENAME TO idx_permit_applications_permit_type;

COMMENT ON COLUMN public.permit_applications.permit_type_id IS 'References permit_types_v2 table. Replaced permit_type (TEXT) and municipal_permit_type_id (UUID).';