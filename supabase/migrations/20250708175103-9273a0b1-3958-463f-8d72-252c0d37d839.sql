-- Create merchants table for Finix seller onboarding
CREATE TABLE public.merchants (
  -- Core Identity & Finix Integration
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  finix_identity_id TEXT,
  finix_application_id TEXT,
  finix_merchant_id TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Step 1: Business Name & Statement Descriptor
  business_name TEXT NOT NULL,
  statement_descriptor TEXT NOT NULL,
  
  -- Step 2: Customer Data (Auto-populated from profile, user confirms)
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_street_address TEXT NOT NULL,
  customer_apt_number TEXT,
  customer_city TEXT NOT NULL,
  customer_state TEXT NOT NULL,
  customer_zip_code TEXT NOT NULL,
  customer_country TEXT NOT NULL DEFAULT 'USA',
  
  -- Step 3: Bank Account Details
  bank_account_holder_name TEXT NOT NULL,
  bank_routing_number TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_account_number_confirmation TEXT NOT NULL,
  bank_account_type TEXT NOT NULL CHECK (bank_account_type IN ('CHECKING', 'SAVINGS')),
  
  -- Business Information Section
  business_type TEXT NOT NULL,
  doing_business_as TEXT NOT NULL,
  business_tax_id TEXT NOT NULL,
  business_phone TEXT NOT NULL,
  business_website TEXT,
  business_description TEXT NOT NULL,
  incorporation_date DATE,
  ownership_type TEXT NOT NULL CHECK (ownership_type IN ('private', 'public')),
  business_address_line1 TEXT NOT NULL,
  business_address_line2 TEXT,
  business_address_city TEXT NOT NULL,
  business_address_state TEXT NOT NULL,
  business_address_zip_code TEXT NOT NULL,
  business_address_country TEXT NOT NULL DEFAULT 'USA',
  
  -- Owner Information Section
  owner_first_name TEXT NOT NULL,
  owner_last_name TEXT NOT NULL,
  owner_job_title TEXT NOT NULL,
  owner_work_email TEXT NOT NULL,
  owner_personal_phone TEXT NOT NULL,
  owner_personal_address_line1 TEXT NOT NULL,
  owner_personal_address_line2 TEXT,
  owner_personal_address_city TEXT NOT NULL,
  owner_personal_address_state TEXT NOT NULL,
  owner_personal_address_zip_code TEXT NOT NULL,
  owner_personal_address_country TEXT NOT NULL DEFAULT 'USA',
  owner_date_of_birth DATE,
  owner_personal_tax_id TEXT,
  owner_ownership_percentage NUMERIC,
  
  -- Processing Information Section
  annual_ach_volume BIGINT NOT NULL DEFAULT 0,
  annual_card_volume BIGINT NOT NULL DEFAULT 0,
  average_ach_amount BIGINT NOT NULL DEFAULT 0,
  average_card_amount BIGINT NOT NULL DEFAULT 0,
  max_ach_amount BIGINT NOT NULL DEFAULT 0,
  max_card_amount BIGINT NOT NULL DEFAULT 0,
  card_present_percentage INTEGER NOT NULL DEFAULT 0,
  moto_percentage INTEGER NOT NULL DEFAULT 0,
  ecommerce_percentage INTEGER NOT NULL DEFAULT 100,
  b2b_percentage INTEGER NOT NULL DEFAULT 0,
  b2c_percentage INTEGER NOT NULL DEFAULT 100,
  p2p_percentage INTEGER NOT NULL DEFAULT 0,
  mcc_code TEXT NOT NULL, -- No default, always filled from form
  has_accepted_cards_previously BOOLEAN NOT NULL DEFAULT false,
  refund_policy TEXT NOT NULL,
  
  -- Legal Agreement Tracking
  merchant_agreement_accepted BOOLEAN NOT NULL,
  merchant_agreement_ip_address TEXT NOT NULL,
  merchant_agreement_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  merchant_agreement_user_agent TEXT NOT NULL,
  credit_check_consent BOOLEAN NOT NULL DEFAULT false,
  credit_check_ip_address TEXT,
  credit_check_timestamp TIMESTAMP WITH TIME ZONE,
  credit_check_user_agent TEXT,
  
  -- Finix Response & Metadata Storage
  finix_raw_response JSONB,
  finix_entity_data JSONB,
  finix_tags JSONB,
  submission_metadata JSONB,
  processing_status TEXT NOT NULL DEFAULT 'submitted',
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

-- Create policies for merchants table
CREATE POLICY "Super admins can view all merchants" 
ON public.merchants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'superAdmin'
  )
);

CREATE POLICY "Super admins can insert merchants" 
ON public.merchants 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'superAdmin'
  )
);

CREATE POLICY "Super admins can update merchants" 
ON public.merchants 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'superAdmin'
  )
);

CREATE POLICY "Users can view their own merchants" 
ON public.merchants 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own merchants" 
ON public.merchants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own merchants" 
ON public.merchants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_merchants_user_id ON public.merchants(user_id);
CREATE INDEX idx_merchants_finix_identity_id ON public.merchants(finix_identity_id);
CREATE INDEX idx_merchants_processing_status ON public.merchants(processing_status);
CREATE INDEX idx_merchants_verification_status ON public.merchants(verification_status);
CREATE INDEX idx_merchants_created_at ON public.merchants(created_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_merchants_updated_at
BEFORE UPDATE ON public.merchants
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();