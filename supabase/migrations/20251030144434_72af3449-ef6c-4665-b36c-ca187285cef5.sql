-- ============================================
-- Migration: Remove deprecated license number generation
-- Description: Clean up old triggers/functions that reference deleted business_license_number_sequences table
-- ============================================

-- Drop the two duplicate triggers that are causing errors
DROP TRIGGER IF EXISTS set_business_license_number ON public.business_license_applications;
DROP TRIGGER IF EXISTS set_license_number_trigger ON public.business_license_applications;

-- Drop the old trigger functions
DROP FUNCTION IF EXISTS public.set_business_license_number() CASCADE;
DROP FUNCTION IF EXISTS public.set_license_number() CASCADE;

-- Drop the old generate function that references deleted table
DROP FUNCTION IF EXISTS public.generate_license_number(UUID) CASCADE;

-- Verify no more references exist to the deleted table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE pronamespace = 'public'::regnamespace
    AND pg_get_functiondef(oid) ILIKE '%business_license_number_sequences%'
  ) THEN
    RAISE EXCEPTION 'Functions still reference business_license_number_sequences table';
  END IF;
  
  RAISE NOTICE '✅ Successfully removed all deprecated license number generation functions';
END $$;