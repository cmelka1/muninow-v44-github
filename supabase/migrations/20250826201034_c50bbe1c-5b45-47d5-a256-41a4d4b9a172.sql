-- Drop the existing constraint that was causing business license payment failures
ALTER TABLE public.payment_history DROP CONSTRAINT IF EXISTS payment_history_bill_or_permit_or_tax_check;

-- Add the updated constraint that includes business_license_id as a valid option
ALTER TABLE public.payment_history ADD CONSTRAINT payment_history_bill_or_permit_or_tax_check 
CHECK ((
  (bill_id IS NOT NULL AND permit_id IS NULL AND tax_submission_id IS NULL AND business_license_id IS NULL) OR
  (bill_id IS NULL AND permit_id IS NOT NULL AND tax_submission_id IS NULL AND business_license_id IS NULL) OR  
  (bill_id IS NULL AND permit_id IS NULL AND tax_submission_id IS NOT NULL AND business_license_id IS NULL) OR
  (bill_id IS NULL AND permit_id IS NULL AND tax_submission_id IS NULL AND business_license_id IS NOT NULL)
));