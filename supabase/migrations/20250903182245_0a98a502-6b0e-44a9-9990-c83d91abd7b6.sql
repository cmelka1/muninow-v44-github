-- Phase 1: Delete business license comments for Hinsdale applications
-- This removes comments that reference Hinsdale license applications
DELETE FROM public.business_license_comments 
WHERE license_id IN (
  SELECT id FROM public.business_license_applications 
  WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);