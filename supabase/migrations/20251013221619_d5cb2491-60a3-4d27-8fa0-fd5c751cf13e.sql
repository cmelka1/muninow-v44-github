-- Fix stuck service application that was paid but not auto-issued
UPDATE municipal_service_applications
SET 
  status = 'issued',
  issued_at = payment_processed_at
WHERE id = '273c65fa-8c7c-4fd5-a562-af93ca1778c6'
  AND status = 'draft'
  AND payment_status = 'paid'
  AND payment_processed_at IS NOT NULL;