-- ============================================
-- Migration: Remove is_custom column from business_license_types_v2
-- Description: Simplify schema - all types are now municipality-managed
-- Safe to run: is_custom no longer used in business logic
-- ============================================

-- Drop is_custom column
ALTER TABLE business_license_types_v2 
DROP COLUMN IF EXISTS is_custom;

-- Verify column is gone
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'business_license_types_v2' 
      AND column_name = 'is_custom'
  ) THEN
    RAISE EXCEPTION 'is_custom column still exists after drop';
  END IF;
  
  RAISE NOTICE 'Successfully removed is_custom column from business_license_types_v2';
END $$;

-- Update function comment to reflect current state
COMMENT ON FUNCTION public.initialize_standard_business_license_types(UUID) IS 
'Initializes baseline business license types for a new municipality. All types are now municipality-managed in business_license_types_v2 unified schema.';