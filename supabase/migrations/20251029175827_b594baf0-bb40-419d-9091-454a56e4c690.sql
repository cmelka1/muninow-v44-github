-- Phase 1 Cleanup: Deprecate old permit tables
-- Rename old tables to _deprecated suffix for 30-day backup period

-- Rename municipal_permit_types to deprecated
ALTER TABLE IF EXISTS public.municipal_permit_types 
  RENAME TO municipal_permit_types_deprecated;

-- Rename permit_types to deprecated  
ALTER TABLE IF EXISTS public.permit_types 
  RENAME TO permit_types_deprecated;

-- Add deprecation notice comments
COMMENT ON TABLE public.municipal_permit_types_deprecated IS 
  'DEPRECATED: Replaced by permit_types_v2. Scheduled for deletion after 2025-11-28. Do not use.';

COMMENT ON TABLE public.permit_types_deprecated IS 
  'DEPRECATED: Replaced by permit_types_v2. Scheduled for deletion after 2025-11-28. Do not use.';