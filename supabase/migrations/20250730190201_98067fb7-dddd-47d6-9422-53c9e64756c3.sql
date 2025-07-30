-- Create RLS policies for storage.objects to allow permit document access

-- Policy for municipal users to access documents for their customer's permits
CREATE POLICY "Municipal users can access permit documents for their customer"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'permit-documents' AND
  EXISTS (
    SELECT 1 FROM public.permit_documents pd
    JOIN public.permit_applications pa ON pa.permit_id = pd.permit_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE pd.storage_path = storage.objects.name
      AND p.account_type = 'municipal'
      AND p.customer_id = pa.customer_id
  )
);

-- Policy for users to access their own permit documents
CREATE POLICY "Users can access their own permit documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'permit-documents' AND
  EXISTS (
    SELECT 1 FROM public.permit_documents pd
    WHERE pd.storage_path = storage.objects.name
      AND pd.user_id = auth.uid()
  )
);