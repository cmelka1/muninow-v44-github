-- Add RLS policy for municipal users to view profiles of users with bills for their customer
CREATE POLICY "Municipal users can view profiles of users with bills for their customer" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles municipal_profile
    WHERE municipal_profile.id = auth.uid() 
    AND municipal_profile.account_type = 'municipal' 
    AND EXISTS (
      SELECT 1 FROM public.master_bills 
      WHERE master_bills.customer_id = municipal_profile.customer_id
      AND master_bills.user_id = profiles.id
    )
  )
);