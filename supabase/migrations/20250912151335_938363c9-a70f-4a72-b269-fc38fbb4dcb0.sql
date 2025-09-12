-- Update Storage RLS policies for municipal document access
-- Fix permit documents policy
DROP POLICY IF EXISTS "Municipal users can download permit documents" ON storage.objects;
CREATE POLICY "Municipal users can download permit documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'permit-documents' 
  AND (
    -- Allow document owners
    (storage.foldername(name))[1] = auth.uid()::text
    OR 
    -- Allow municipal users with access to the customer
    EXISTS (
      SELECT 1 
      FROM permit_applications pa
      JOIN profiles p ON p.id = auth.uid()
      WHERE pa.permit_id::text = (storage.foldername(name))[1]
      AND p.customer_id = pa.customer_id
      AND p.account_type IN ('municipal', 'municipaladmin', 'municipaluser')
    )
  )
);

-- Fix business license documents policy  
DROP POLICY IF EXISTS "Municipal users can download business license documents" ON storage.objects;
CREATE POLICY "Municipal users can download business license documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'business-license-documents' 
  AND (
    -- Allow document owners
    (storage.foldername(name))[1] = auth.uid()::text
    OR 
    -- Allow municipal users with access to the customer
    EXISTS (
      SELECT 1 
      FROM business_license_applications bla
      JOIN profiles p ON p.id = auth.uid()
      WHERE bla.id::text = (storage.foldername(name))[1]
      AND p.customer_id = bla.customer_id
      AND p.account_type IN ('municipal', 'municipaladmin', 'municipaluser')
    )
  )
);

-- Fix service application documents policy
DROP POLICY IF EXISTS "Municipal users can download service application documents" ON storage.objects;
CREATE POLICY "Municipal users can download service application documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'service-application-documents' 
  AND (
    -- Allow document owners
    (storage.foldername(name))[1] = auth.uid()::text
    OR 
    -- Allow municipal users with access to the customer
    EXISTS (
      SELECT 1 
      FROM municipal_service_applications msa
      JOIN profiles p ON p.id = auth.uid()
      WHERE msa.id::text = (storage.foldername(name))[1]
      AND p.customer_id = msa.customer_id
      AND p.account_type IN ('municipal', 'municipaladmin', 'municipaluser')
    )
  )
);