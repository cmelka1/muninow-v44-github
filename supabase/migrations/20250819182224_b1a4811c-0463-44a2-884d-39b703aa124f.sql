CREATE POLICY "Allow authenticated users to read customers for municipality search" 
ON public.customers 
FOR SELECT 
USING (true);