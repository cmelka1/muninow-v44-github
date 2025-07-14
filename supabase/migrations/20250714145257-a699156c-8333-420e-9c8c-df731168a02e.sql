-- Add RLS policy for municipal users to view payment history for their customer
CREATE POLICY "Municipal users can view payment history for their customer" 
ON public.payment_history 
FOR SELECT 
USING (EXISTS ( 
  SELECT 1
  FROM profiles
  WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'municipal'
    AND profiles.customer_id = payment_history.customer_id
));