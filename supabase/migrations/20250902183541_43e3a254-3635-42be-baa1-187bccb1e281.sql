CREATE POLICY "System can insert payment history" 
  ON public.payment_history 
  FOR INSERT 
  WITH CHECK (true);