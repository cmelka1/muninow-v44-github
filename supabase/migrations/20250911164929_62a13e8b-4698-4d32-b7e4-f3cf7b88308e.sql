-- Fix RLS policy for municipal_permit_types to accept municipaluser and municipaladmin
DROP POLICY "Municipal users can manage permit types for their customer" ON public.municipal_permit_types;

CREATE POLICY "Municipal users can manage permit types for their customer" ON public.municipal_permit_types
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.account_type IN ('municipal', 'municipaluser', 'municipaladmin')
    AND profiles.customer_id = municipal_permit_types.customer_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.account_type IN ('municipal', 'municipaluser', 'municipaladmin')
    AND profiles.customer_id = municipal_permit_types.customer_id
  )
);