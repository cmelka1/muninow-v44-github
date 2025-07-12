-- Add customer_id column to merchants table
ALTER TABLE public.merchants 
ADD COLUMN customer_id UUID REFERENCES public.customers(customer_id);

-- Update existing merchant records to assign the customer_id
UPDATE public.merchants 
SET customer_id = 'f92f7f90-93ac-473e-8753-36cf0ef52df9'::uuid
WHERE customer_id IS NULL;

-- Add NOT NULL constraint after updating existing data
ALTER TABLE public.merchants 
ALTER COLUMN customer_id SET NOT NULL;

-- Add RLS policy for municipal users to access merchants based on their customer_id
CREATE POLICY "Municipal users can view merchants for their customer" 
ON public.merchants 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND account_type = 'municipal' 
    AND profiles.customer_id = merchants.customer_id
  )
);

CREATE POLICY "Municipal users can insert merchants for their customer" 
ON public.merchants 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND account_type = 'municipal' 
    AND profiles.customer_id = merchants.customer_id
  )
);

CREATE POLICY "Municipal users can update merchants for their customer" 
ON public.merchants 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND account_type = 'municipal' 
    AND profiles.customer_id = merchants.customer_id
  )
);