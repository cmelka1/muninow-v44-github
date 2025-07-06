-- Create user_payment_instruments table for resident and business users
CREATE TABLE public.user_payment_instruments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Core Finix fields
  finix_payment_instrument_id TEXT NOT NULL UNIQUE,
  finix_identity_id TEXT NOT NULL,
  finix_application_id TEXT,
  instrument_type TEXT NOT NULL CHECK (instrument_type IN ('PAYMENT_CARD', 'BANK_ACCOUNT')),
  currency TEXT NOT NULL DEFAULT 'USD',
  enabled BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active',
  created_via TEXT DEFAULT 'API',
  
  -- User experience fields
  nickname TEXT, -- User-defined custom name
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Card-specific fields (prefixed with card_)
  card_brand TEXT, -- VISA, MASTERCARD, AMEX, etc.
  card_type TEXT, -- DEBIT, CREDIT
  card_last_four TEXT,
  card_expiration_month INTEGER,
  card_expiration_year INTEGER,
  card_name TEXT, -- Cardholder name
  card_bin TEXT,
  card_issuer_country TEXT,
  card_network_token_enabled BOOLEAN DEFAULT false,
  card_network_token_state TEXT,
  card_address_verification TEXT,
  card_security_code_verification TEXT,
  card_account_updater_enabled BOOLEAN DEFAULT false,
  
  -- Bank account-specific fields (prefixed with bank_)
  bank_account_type TEXT, -- PERSONAL_CHECKING, BUSINESS_CHECKING, etc.
  bank_last_four TEXT,
  bank_name TEXT, -- Account holder name
  bank_code TEXT, -- Routing number
  bank_masked_account_number TEXT,
  bank_account_validation_check TEXT,
  bank_institution_number TEXT,
  bank_transit_number TEXT,
  bank_country TEXT DEFAULT 'USA',
  
  -- Billing address fields (used for both cards and bank accounts)
  billing_address_line1 TEXT,
  billing_address_line2 TEXT,
  billing_city TEXT,
  billing_region TEXT,
  billing_postal_code TEXT,
  billing_country TEXT DEFAULT 'USA',
  
  -- Finix metadata and raw response
  finix_fingerprint TEXT,
  finix_created_at TIMESTAMP WITH TIME ZONE,
  finix_updated_at TIMESTAMP WITH TIME ZONE,
  raw_finix_response JSONB,
  finix_links JSONB,
  finix_tags JSONB DEFAULT '{}',
  
  -- Third party integration fields
  third_party TEXT,
  third_party_token TEXT,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  disabled_at TIMESTAMP WITH TIME ZONE,
  disabled_code TEXT,
  disabled_message TEXT
);

-- Create indexes for performance
CREATE INDEX idx_user_payment_instruments_user_id ON public.user_payment_instruments(user_id);
CREATE INDEX idx_user_payment_instruments_finix_id ON public.user_payment_instruments(finix_payment_instrument_id);
CREATE INDEX idx_user_payment_instruments_enabled ON public.user_payment_instruments(user_id, enabled) WHERE enabled = true;
CREATE INDEX idx_user_payment_instruments_default ON public.user_payment_instruments(user_id, is_default) WHERE is_default = true;
CREATE INDEX idx_user_payment_instruments_type ON public.user_payment_instruments(user_id, instrument_type);

-- Enable Row Level Security
ALTER TABLE public.user_payment_instruments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own payment instruments"
ON public.user_payment_instruments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment instruments"
ON public.user_payment_instruments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment instruments"
ON public.user_payment_instruments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment instruments"
ON public.user_payment_instruments
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_user_payment_instruments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_payment_instruments_updated_at
BEFORE UPDATE ON public.user_payment_instruments
FOR EACH ROW
EXECUTE FUNCTION public.update_user_payment_instruments_timestamp();

-- Function to manage default payment instruments
CREATE OR REPLACE FUNCTION public.set_default_user_payment_instrument(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the payment instrument exists, is enabled, and belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM public.user_payment_instruments 
    WHERE id = p_id 
      AND user_id = auth.uid() 
      AND enabled = true
  ) THEN
    RAISE EXCEPTION 'Payment instrument not found or not eligible to be set as default';
  END IF;
  
  -- First, set all enabled payment instruments to non-default
  UPDATE public.user_payment_instruments
  SET is_default = false
  WHERE user_id = auth.uid() 
    AND enabled = true;
  
  -- Then set the selected one as default
  UPDATE public.user_payment_instruments
  SET is_default = true
  WHERE id = p_id 
    AND user_id = auth.uid() 
    AND enabled = true;
END;
$$;

-- Function to get display name for payment instruments
CREATE OR REPLACE FUNCTION public.get_payment_instrument_display_name(
  p_nickname TEXT,
  p_instrument_type TEXT,
  p_card_brand TEXT,
  p_card_last_four TEXT,
  p_bank_last_four TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Return nickname if provided
  IF p_nickname IS NOT NULL AND trim(p_nickname) != '' THEN
    RETURN p_nickname;
  END IF;
  
  -- Handle card display names
  IF p_instrument_type = 'PAYMENT_CARD' THEN
    IF p_card_brand IS NOT NULL AND p_card_last_four IS NOT NULL THEN
      RETURN initcap(lower(p_card_brand)) || ' •••• ' || p_card_last_four;
    ELSE
      RETURN 'Card •••• ' || COALESCE(p_card_last_four, '0000');
    END IF;
  END IF;
  
  -- Handle bank account display names
  IF p_instrument_type = 'BANK_ACCOUNT' THEN
    RETURN 'Bank Account •••• ' || COALESCE(p_bank_last_four, '0000');
  END IF;
  
  -- Fallback
  RETURN 'Payment Method';
END;
$$;

-- Function to disable payment instrument (soft delete)
CREATE OR REPLACE FUNCTION public.disable_user_payment_instrument(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_default BOOLEAN;
  v_first_id UUID;
BEGIN
  -- Get instrument details
  SELECT is_default INTO v_is_default
  FROM public.user_payment_instruments
  WHERE id = p_id AND user_id = auth.uid() AND enabled = true;
  
  -- Disable the payment instrument
  UPDATE public.user_payment_instruments
  SET enabled = false, disabled_at = now()
  WHERE id = p_id AND user_id = auth.uid();
  
  -- If we disabled the default instrument, make another one default
  IF v_is_default = TRUE THEN
    SELECT id INTO v_first_id
    FROM public.user_payment_instruments
    WHERE user_id = auth.uid() AND enabled = true
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Update the first enabled payment instrument to be default if one exists
    IF v_first_id IS NOT NULL THEN
      UPDATE public.user_payment_instruments
      SET is_default = TRUE
      WHERE id = v_first_id;
    END IF;
  END IF;
END;
$$;

-- Function to get user payment instruments with display names
CREATE OR REPLACE FUNCTION public.get_user_payment_instruments_with_display_names()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  finix_payment_instrument_id TEXT,
  instrument_type TEXT,
  nickname TEXT,
  display_name TEXT,
  is_default BOOLEAN,
  enabled BOOLEAN,
  status TEXT,
  card_brand TEXT,
  card_last_four TEXT,
  card_expiration_month INTEGER,
  card_expiration_year INTEGER,
  bank_account_type TEXT,
  bank_last_four TEXT,
  billing_address_line1 TEXT,
  billing_city TEXT,
  billing_region TEXT,
  billing_postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    upi.id,
    upi.user_id,
    upi.finix_payment_instrument_id,
    upi.instrument_type,
    upi.nickname,
    public.get_payment_instrument_display_name(
      upi.nickname,
      upi.instrument_type,
      upi.card_brand,
      upi.card_last_four,
      upi.bank_last_four
    ) as display_name,
    upi.is_default,
    upi.enabled,
    upi.status,
    upi.card_brand,
    upi.card_last_four,
    upi.card_expiration_month,
    upi.card_expiration_year,
    upi.bank_account_type,
    upi.bank_last_four,
    upi.billing_address_line1,
    upi.billing_city,
    upi.billing_region,
    upi.billing_postal_code,
    upi.created_at,
    upi.updated_at
  FROM public.user_payment_instruments upi
  WHERE upi.user_id = auth.uid() 
    AND upi.enabled = true
  ORDER BY upi.is_default DESC, upi.created_at DESC;
$$;