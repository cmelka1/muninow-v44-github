-- ============================================================================
-- Migration 002: Add raw_finix_response to remaining entity tables
-- Purpose: Add raw Finix API response storage for debugging and audit purposes
-- Breaking: NO - Column is nullable, no impact on existing records
-- ============================================================================

-- Add to permit_applications
ALTER TABLE permit_applications
  ADD COLUMN IF NOT EXISTS raw_finix_response jsonb;

COMMENT ON COLUMN permit_applications.raw_finix_response IS 
  'Raw response from Finix API for debugging and audit purposes';

-- Add to business_license_applications
ALTER TABLE business_license_applications
  ADD COLUMN IF NOT EXISTS raw_finix_response jsonb;

COMMENT ON COLUMN business_license_applications.raw_finix_response IS 
  'Raw response from Finix API for debugging and audit purposes';

-- Add to municipal_service_applications
ALTER TABLE municipal_service_applications
  ADD COLUMN IF NOT EXISTS raw_finix_response jsonb;

COMMENT ON COLUMN municipal_service_applications.raw_finix_response IS 
  'Raw response from Finix API for debugging and audit purposes';