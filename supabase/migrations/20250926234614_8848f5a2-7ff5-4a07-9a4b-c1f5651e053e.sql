-- Drop the dependent RLS policies first, then remove the column and table

-- Drop all RLS policies on refunds table that reference payment_history_id
DROP POLICY IF EXISTS "Municipal users can create refunds for their customer" ON public.refunds;
DROP POLICY IF EXISTS "Municipal users can view refunds for their customer" ON public.refunds;  
DROP POLICY IF EXISTS "Municipal users can update refunds for their customer" ON public.refunds;

-- Create new RLS policies that use payment_transaction_id instead
CREATE POLICY "Municipal users can create refunds for their customer"
ON public.refunds FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.account_type = 'municipal'
    AND profiles.customer_id = refunds.customer_id
  )
);

CREATE POLICY "Municipal users can view refunds for their customer"
ON public.refunds FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.account_type = 'municipal'
    AND profiles.customer_id = refunds.customer_id
  )
);

CREATE POLICY "Municipal users can update refunds for their customer"
ON public.refunds FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.account_type = 'municipal'
    AND profiles.customer_id = refunds.customer_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.account_type = 'municipal'
    AND profiles.customer_id = refunds.customer_id
  )
);

-- Now drop the old payment_history_id column from refunds table
ALTER TABLE public.refunds 
DROP COLUMN payment_history_id CASCADE;

-- Drop the payment_history table entirely
DROP TABLE IF EXISTS public.payment_history;