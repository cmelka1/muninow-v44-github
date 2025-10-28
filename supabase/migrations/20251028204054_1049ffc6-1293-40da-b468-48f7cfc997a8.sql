-- Update service_application_documents table policy to support all municipal account types
DROP POLICY IF EXISTS "Municipal users can view documents for their customer" 
ON service_application_documents;

CREATE POLICY "Municipal users can view documents for their customer applications"
ON service_application_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM municipal_service_applications msa
    JOIN profiles p ON p.id = auth.uid()
    WHERE msa.id = service_application_documents.application_id
      AND p.customer_id = msa.customer_id
      AND p.account_type = ANY (ARRAY['municipal'::text, 'municipaladmin'::text, 'municipaluser'::text])
  )
);

-- Update storage bucket policy to support all municipal account types
DROP POLICY IF EXISTS "Municipal users can view service application documents for thei" 
ON storage.objects;

CREATE POLICY "Municipal users can view service application documents for their customer"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'service-application-documents' 
  AND EXISTS (
    SELECT 1
    FROM service_application_documents sad
    JOIN municipal_service_applications msa ON msa.id = sad.application_id
    JOIN profiles p ON p.id = auth.uid()
    WHERE sad.storage_path = objects.name
      AND p.customer_id = msa.customer_id
      AND p.account_type = ANY (ARRAY['municipal'::text, 'municipaladmin'::text, 'municipaluser'::text])
  )
);