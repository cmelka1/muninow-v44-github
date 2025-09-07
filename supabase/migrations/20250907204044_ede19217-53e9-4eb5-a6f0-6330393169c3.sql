-- Create new payment_transactions table for clean payment processing
CREATE TABLE public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core payment info
  user_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  merchant_id uuid NOT NULL,
  
  -- Entity relationships (only ONE will be populated per transaction)
  permit_id uuid,
  business_license_id uuid,
  service_application_id uuid,
  tax_submission_id uuid,
  bill_id uuid,
  
  -- Payment amounts
  base_amount_cents bigint NOT NULL,
  service_fee_cents bigint NOT NULL DEFAULT 0,
  total_amount_cents bigint NOT NULL,
  
  -- Payment method details
  payment_type text NOT NULL, -- 'card' or 'ach'
  payment_instrument_id text NOT NULL,
  card_brand text,
  card_last_four text,
  bank_last_four text,
  
  -- Finix integration
  finix_merchant_id text,
  finix_transfer_id text,
  finix_payment_instrument_id text,
  
  -- Transaction tracking
  payment_status text NOT NULL DEFAULT 'pending',
  transfer_state text NOT NULL DEFAULT 'PENDING',
  idempotency_id text NOT NULL UNIQUE,
  fraud_session_id text,
  
  -- Metadata
  failure_code text,
  failure_message text,
  raw_finix_response jsonb,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transactions" 
ON public.payment_transactions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Municipal users can view transactions for their customer" 
ON public.payment_transactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.account_type = 'municipal' 
  AND profiles.customer_id = payment_transactions.customer_id
));

CREATE POLICY "Super admins can view all transactions" 
ON public.payment_transactions 
FOR ALL 
USING (is_current_user_super_admin());

-- Create indexes for performance
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_customer_id ON public.payment_transactions(customer_id);
CREATE INDEX idx_payment_transactions_permit_id ON public.payment_transactions(permit_id) WHERE permit_id IS NOT NULL;
CREATE INDEX idx_payment_transactions_business_license_id ON public.payment_transactions(business_license_id) WHERE business_license_id IS NOT NULL;
CREATE INDEX idx_payment_transactions_service_application_id ON public.payment_transactions(service_application_id) WHERE service_application_id IS NOT NULL;
CREATE INDEX idx_payment_transactions_tax_submission_id ON public.payment_transactions(tax_submission_id) WHERE tax_submission_id IS NOT NULL;
CREATE INDEX idx_payment_transactions_bill_id ON public.payment_transactions(bill_id) WHERE bill_id IS NOT NULL;
CREATE INDEX idx_payment_transactions_created_at ON public.payment_transactions(created_at);
CREATE INDEX idx_payment_transactions_idempotency_id ON public.payment_transactions(idempotency_id);

-- Update trigger for timestamps
CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Drop and recreate the create_unified_payment_transaction function to use new table
DROP FUNCTION IF EXISTS public.create_unified_payment_transaction(
  uuid, uuid, uuid, text, bigint, text, text, text, text, text, text, text, text, text, text, text
);

CREATE OR REPLACE FUNCTION public.create_unified_payment_transaction(
  p_user_id uuid,
  p_customer_id uuid,
  p_merchant_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_base_amount_cents bigint,
  p_payment_instrument_id text,
  p_payment_type text,
  p_idempotency_id text,
  p_fraud_session_id text,
  p_card_brand text DEFAULT NULL,
  p_card_last_four text DEFAULT NULL,
  p_bank_last_four text DEFAULT NULL,
  p_finix_merchant_id text DEFAULT NULL,
  p_first_name text DEFAULT NULL,
  p_last_name text DEFAULT NULL,
  p_user_email text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_service_fee_cents bigint;
  v_total_amount_cents bigint;
  v_transaction_id uuid;
  v_is_card boolean;
  result jsonb;
BEGIN
  -- Determine if it's a card payment
  v_is_card := (p_payment_type = 'card');
  
  -- Calculate service fee (simplified logic - could be enhanced)
  IF v_is_card THEN
    -- Card fee: 2.9% + $0.30
    v_service_fee_cents := ROUND((p_base_amount_cents * 0.029) + 30);
  ELSE
    -- ACH fee: 1% + $1.00, max $10.00
    v_service_fee_cents := LEAST(ROUND((p_base_amount_cents * 0.01) + 100), 1000);
  END IF;
  
  -- Calculate total amount (base + fee)
  v_total_amount_cents := p_base_amount_cents + v_service_fee_cents;
  
  -- Insert into payment_transactions table
  INSERT INTO public.payment_transactions (
    user_id,
    customer_id,
    merchant_id,
    permit_id,
    business_license_id,
    service_application_id,
    tax_submission_id,
    bill_id,
    base_amount_cents,
    service_fee_cents,
    total_amount_cents,
    payment_type,
    payment_instrument_id,
    card_brand,
    card_last_four,
    bank_last_four,
    finix_merchant_id,
    finix_payment_instrument_id,
    payment_status,
    transfer_state,
    idempotency_id,
    fraud_session_id
  ) VALUES (
    p_user_id,
    p_customer_id,
    p_merchant_id,
    CASE WHEN p_entity_type = 'permit' THEN p_entity_id END,
    CASE WHEN p_entity_type = 'business_license' THEN p_entity_id END,
    CASE WHEN p_entity_type = 'service_application' THEN p_entity_id END,
    CASE WHEN p_entity_type = 'tax_submission' THEN p_entity_id END,
    CASE WHEN p_entity_type = 'bill' THEN p_entity_id END,
    p_base_amount_cents,
    v_service_fee_cents,
    v_total_amount_cents,
    p_payment_type,
    p_payment_instrument_id,
    p_card_brand,
    p_card_last_four,
    p_bank_last_four,
    p_finix_merchant_id,
    p_payment_instrument_id, -- finix_payment_instrument_id
    'pending',
    'PENDING',
    p_idempotency_id,
    p_fraud_session_id
  ) RETURNING id INTO v_transaction_id;
  
  -- Return success with calculated fees
  result := jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'service_fee_cents', v_service_fee_cents,
    'total_amount_cents', v_total_amount_cents
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
    RETURN result;
END;
$$;