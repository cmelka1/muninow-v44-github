-- Add email-based RLS policies for customer_payment_method table as fallback
-- These policies will work even when auth.uid() is null but the user session is valid

CREATE POLICY "Allow cmelka@muninow.com to view all customer payment methods" 
ON public.customer_payment_method 
FOR SELECT 
USING (
  auth.email() = 'cmelka@muninow.com'
);

CREATE POLICY "Allow cmelka@muninow.com to insert customer payment methods" 
ON public.customer_payment_method 
FOR INSERT 
WITH CHECK (
  auth.email() = 'cmelka@muninow.com'
);

CREATE POLICY "Allow cmelka@muninow.com to update customer payment methods" 
ON public.customer_payment_method 
FOR UPDATE 
USING (
  auth.email() = 'cmelka@muninow.com'
);

CREATE POLICY "Allow cmelka@muninow.com to delete customer payment methods" 
ON public.customer_payment_method 
FOR DELETE 
USING (
  auth.email() = 'cmelka@muninow.com'
);