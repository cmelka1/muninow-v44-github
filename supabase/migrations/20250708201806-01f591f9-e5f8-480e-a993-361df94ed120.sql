-- Add columns for masked bank account data and remove full account numbers for PCI compliance
ALTER TABLE public.merchants 
  ADD COLUMN bank_last_four TEXT,
  ADD COLUMN bank_masked_account_number TEXT;

-- Remove the full account number columns for security
ALTER TABLE public.merchants 
  DROP COLUMN bank_account_number,
  DROP COLUMN bank_account_number_confirmation;

-- Add comments for clarity
COMMENT ON COLUMN public.merchants.bank_last_four IS 'Last 4 digits of bank account number from Finix (secure)';
COMMENT ON COLUMN public.merchants.bank_masked_account_number IS 'Fully masked account number from Finix (e.g., ****1234)';

-- Create index for performance on the last four digits
CREATE INDEX idx_merchants_bank_last_four ON public.merchants(bank_last_four);