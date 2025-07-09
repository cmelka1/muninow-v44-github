
-- Create merchant fee profiles table
CREATE TABLE public.merchant_fee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  merchant_name TEXT,
  finix_merchant_id TEXT,
  finix_fee_profile_id TEXT,
  
  -- Fee structure fields
  fixed_fee_cents BIGINT DEFAULT 0,
  percentage_fee DECIMAL(5,4) DEFAULT 0.0000,
  
  -- Card processing fees
  card_present_fixed_fee_cents BIGINT DEFAULT 0,
  card_present_percentage_fee DECIMAL(5,4) DEFAULT 0.0000,
  card_not_present_fixed_fee_cents BIGINT DEFAULT 0,
  card_not_present_percentage_fee DECIMAL(5,4) DEFAULT 0.0000,
  
  -- ACH fees
  ach_debit_fixed_fee_cents BIGINT DEFAULT 0,
  ach_debit_percentage_fee DECIMAL(5,4) DEFAULT 0.0000,
  ach_credit_fixed_fee_cents BIGINT DEFAULT 0,
  ach_credit_percentage_fee DECIMAL(5,4) DEFAULT 0.0000,
  
  -- Additional fees
  chargeback_fixed_fee_cents BIGINT DEFAULT 0,
  refund_fixed_fee_cents BIGINT DEFAULT 0,
  monthly_fee_cents BIGINT DEFAULT 0,
  
  -- Metadata and tracking
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'error')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  finix_raw_response JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one fee profile per merchant
  UNIQUE(merchant_id)
);

-- Add update timestamp trigger
CREATE TRIGGER update_merchant_fee_profiles_timestamp
  BEFORE UPDATE ON public.merchant_fee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.merchant_fee_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Super admins can view all fee profiles
CREATE POLICY "Super admins can view all merchant fee profiles"
  ON public.merchant_fee_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'superAdmin'
    )
  );

-- Merchant owners can view their own fee profiles
CREATE POLICY "Users can view their own merchant fee profiles"
  ON public.merchant_fee_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.merchants
      WHERE merchants.id = merchant_fee_profiles.merchant_id
      AND merchants.user_id = auth.uid()
    )
  );

-- Super admins can insert fee profiles
CREATE POLICY "Super admins can insert merchant fee profiles"
  ON public.merchant_fee_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'superAdmin'
    )
  );

-- Super admins can update fee profiles
CREATE POLICY "Super admins can update merchant fee profiles"
  ON public.merchant_fee_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'superAdmin'
    )
  );

-- Super admins can delete fee profiles
CREATE POLICY "Super admins can delete merchant fee profiles"
  ON public.merchant_fee_profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'superAdmin'
    )
  );
