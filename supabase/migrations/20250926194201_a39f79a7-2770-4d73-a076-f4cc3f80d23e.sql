-- Update RLS policy to allow resident and business users to manage sequences
DROP POLICY IF EXISTS "Municipal users can manage their sequences" ON public.business_license_number_sequences;

CREATE POLICY "Users can manage sequences for their customer" 
ON public.business_license_number_sequences
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.account_type IN (
      'municipal', 'municipaladmin', 'municipaluser',
      'residentadmin', 'residentuser',
      'businessadmin', 'businessuser'
    )
    AND profiles.customer_id = business_license_number_sequences.customer_id
  )
);