-- Drop existing problematic storage policies
DROP POLICY IF EXISTS "Municipal users can download permit documents" ON storage.objects;
DROP POLICY IF EXISTS "Municipal users can download business license documents" ON storage.objects;
DROP POLICY IF EXISTS "Municipal users can download service application documents" ON storage.objects;

-- Create new RLS policies using document table joins
-- Permit documents policy
CREATE POLICY "Permit documents access via table join"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'permit-documents'
  AND (
    -- Document owners can access their own documents
    EXISTS (
      SELECT 1 FROM permit_documents pd
      WHERE pd.storage_path = storage.objects.name
      AND pd.user_id = auth.uid()
    )
    OR
    -- Municipal users can access documents for their customer
    EXISTS (
      SELECT 1 FROM permit_documents pd
      JOIN permit_applications pa ON pa.permit_id = pd.permit_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE pd.storage_path = storage.objects.name
      AND p.customer_id = pa.customer_id
      AND p.account_type IN ('municipaladmin', 'municipaluser')
    )
    OR
    -- Super admins can access all documents
    is_current_user_super_admin()
  )
);

-- Business license documents policy
CREATE POLICY "Business license documents access via table join"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'business-license-documents'
  AND (
    -- Document owners can access their own documents
    EXISTS (
      SELECT 1 FROM business_license_documents bld
      WHERE bld.storage_path = storage.objects.name
      AND bld.user_id = auth.uid()
    )
    OR
    -- Municipal users can access documents for their customer
    EXISTS (
      SELECT 1 FROM business_license_documents bld
      JOIN business_license_applications bla ON bla.id = bld.license_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE bld.storage_path = storage.objects.name
      AND p.customer_id = bla.customer_id
      AND p.account_type IN ('municipaladmin', 'municipaluser')
    )
    OR
    -- Super admins can access all documents
    is_current_user_super_admin()
  )
);

-- Service application documents policy
CREATE POLICY "Service application documents access via table join"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'service-application-documents'
  AND (
    -- Document owners can access their own documents
    EXISTS (
      SELECT 1 FROM service_application_documents sad
      WHERE sad.storage_path = storage.objects.name
      AND sad.user_id = auth.uid()
    )
    OR
    -- Municipal users can access documents for their customer
    EXISTS (
      SELECT 1 FROM service_application_documents sad
      JOIN municipal_service_applications msa ON msa.id = sad.application_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE sad.storage_path = storage.objects.name
      AND p.customer_id = msa.customer_id
      AND p.account_type IN ('municipaladmin', 'municipaluser')
    )
    OR
    -- Super admins can access all documents
    is_current_user_super_admin()
  )
);