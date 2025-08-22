-- Add missing storage policy for users to access their own permit documents
CREATE POLICY "Users can access their own permit documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'permit-documents' 
  AND EXISTS (
    SELECT 1 FROM permit_documents pd 
    WHERE pd.storage_path = objects.name 
    AND pd.user_id = auth.uid()
  )
);