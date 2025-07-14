-- Create refunds table
CREATE TABLE public.refunds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_history_id UUID NOT NULL,
  user_id UUID NOT NULL,
  bill_id UUID NOT NULL,
  municipal_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  
  -- Payment details (copied from original payment)
  payment_type TEXT,
  card_brand TEXT,
  card_last_four TEXT,
  bank_last_four TEXT,
  
  -- Merchant & bill information
  merchant_name TEXT,
  category TEXT,
  subcategory TEXT,
  external_bill_number TEXT,
  external_account_number TEXT,
  
  -- Original bill dates
  original_issue_date TIMESTAMP WITH TIME ZONE,
  original_due_date TIMESTAMP WITH TIME ZONE,
  
  -- Finix integration fields
  finix_transfer_id TEXT NOT NULL,
  finix_reversal_id TEXT,
  finix_merchant_id TEXT,
  finix_payment_instrument_id TEXT,
  
  -- Refund processing
  refund_amount_cents BIGINT NOT NULL,
  original_amount_cents BIGINT NOT NULL,
  refund_status TEXT NOT NULL DEFAULT 'pending',
  finix_raw_response JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Create policies for refunds table
CREATE POLICY "Municipal users can create refunds for their customer" 
ON public.refunds 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'municipal'
    AND EXISTS (
      SELECT 1 FROM public.payment_history ph
      WHERE ph.id = refunds.payment_history_id
      AND ph.customer_id = profiles.customer_id
    )
  )
);

CREATE POLICY "Municipal users can view refunds for their customer" 
ON public.refunds 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'municipal'
    AND EXISTS (
      SELECT 1 FROM public.payment_history ph
      WHERE ph.id = refunds.payment_history_id
      AND ph.customer_id = profiles.customer_id
    )
  )
);

CREATE POLICY "Municipal users can update refunds for their customer" 
ON public.refunds 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'municipal'
    AND EXISTS (
      SELECT 1 FROM public.payment_history ph
      WHERE ph.id = refunds.payment_history_id
      AND ph.customer_id = profiles.customer_id
    )
  )
);

CREATE POLICY "Users can view their own refunds" 
ON public.refunds 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all refunds" 
ON public.refunds 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'superAdmin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_refunds_updated_at
BEFORE UPDATE ON public.refunds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();