-- Phase 2: First create the enum type and add reason fields to municipal_service_applications table
CREATE TYPE service_application_status AS ENUM (
  'draft',
  'submitted', 
  'under_review',
  'information_requested',
  'resubmitted',
  'approved',
  'denied',
  'rejected',
  'withdrawn',
  'expired',
  'issued'
);

-- Add reason fields to municipal_service_applications table for alignment with permits/licenses
ALTER TABLE public.municipal_service_applications 
ADD COLUMN denial_reason text,
ADD COLUMN withdrawal_reason text,
ADD COLUMN information_request_reason text;

-- Add comment for documentation
COMMENT ON COLUMN public.municipal_service_applications.denial_reason IS 'Reason provided when application is denied/rejected';
COMMENT ON COLUMN public.municipal_service_applications.withdrawal_reason IS 'Reason provided when application is withdrawn';
COMMENT ON COLUMN public.municipal_service_applications.information_request_reason IS 'Reason/details when additional information is requested';