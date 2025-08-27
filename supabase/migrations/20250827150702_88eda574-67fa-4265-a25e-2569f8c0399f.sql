-- Simplify tax_submissions table for user-input approach
-- Add fields for simplified tax calculation approach
ALTER TABLE public.tax_submissions 
ADD COLUMN calculation_notes TEXT,
ADD COLUMN total_amount_due_cents BIGINT;

-- Set default values for existing records
UPDATE public.tax_submissions 
SET 
  calculation_notes = 'No calculation details provided',
  total_amount_due_cents = COALESCE(amount_cents, 0)
WHERE calculation_notes IS NULL OR total_amount_due_cents IS NULL;

-- Make the new fields required for new submissions
ALTER TABLE public.tax_submissions 
ALTER COLUMN calculation_notes SET NOT NULL,
ALTER COLUMN total_amount_due_cents SET NOT NULL;