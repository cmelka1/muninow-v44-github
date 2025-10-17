-- Update the dog permit to expire within 30 days for testing renewal
UPDATE public.municipal_service_applications
SET 
  expires_at = '2025-11-11 00:00:00+00'::timestamptz,
  updated_at = NOW()
WHERE id = '2ba1c735-a54c-4a0c-bcff-ace322880b8b';