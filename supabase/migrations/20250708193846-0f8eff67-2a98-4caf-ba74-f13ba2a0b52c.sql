-- Phase 1: Make bank account fields nullable for multi-step merchant creation
ALTER TABLE public.merchants 
  ALTER COLUMN bank_account_holder_name DROP NOT NULL,
  ALTER COLUMN bank_routing_number DROP NOT NULL,
  ALTER COLUMN bank_account_number DROP NOT NULL,
  ALTER COLUMN bank_account_number_confirmation DROP NOT NULL,
  ALTER COLUMN bank_account_type DROP NOT NULL;

-- Phase 2: Add missing Finix response fields (all nullable for step 3 population)
ALTER TABLE public.merchants 
  ADD COLUMN finix_merchant_profile_id TEXT,
  ADD COLUMN finix_verification_id TEXT,
  ADD COLUMN onboarding_state TEXT,
  ADD COLUMN processing_enabled BOOLEAN,
  ADD COLUMN settlement_enabled BOOLEAN,
  ADD COLUMN processor_type TEXT,
  ADD COLUMN processor_mid TEXT;

-- Add comments for clarity
COMMENT ON COLUMN public.merchants.finix_merchant_profile_id IS 'Finix merchant profile ID from final merchant creation response';
COMMENT ON COLUMN public.merchants.finix_verification_id IS 'Finix verification ID from final merchant creation response';
COMMENT ON COLUMN public.merchants.onboarding_state IS 'Current onboarding state from Finix (PROVISIONING, ENABLED, etc.)';
COMMENT ON COLUMN public.merchants.processing_enabled IS 'Whether merchant processing is enabled';
COMMENT ON COLUMN public.merchants.settlement_enabled IS 'Whether merchant settlement is enabled';
COMMENT ON COLUMN public.merchants.processor_type IS 'Processor type used by merchant';
COMMENT ON COLUMN public.merchants.processor_mid IS 'Processor-specific merchant ID';

-- Create indexes for performance on frequently queried fields
CREATE INDEX idx_merchants_finix_merchant_profile_id ON public.merchants(finix_merchant_profile_id);
CREATE INDEX idx_merchants_onboarding_state ON public.merchants(onboarding_state);
CREATE INDEX idx_merchants_processing_enabled ON public.merchants(processing_enabled);