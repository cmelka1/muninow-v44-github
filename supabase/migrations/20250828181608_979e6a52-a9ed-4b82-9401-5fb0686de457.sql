-- Fix Storage RLS Policies for Tax Documents - Complete Cleanup and Recreation

-- Drop ALL existing tax document storage policies (being comprehensive)
DROP POLICY IF EXISTS "Tax documents are accessible by document owners" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own tax documents" ON storage.objects;  
DROP POLICY IF EXISTS "Users can delete their own tax documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own tax documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload tax documents to staging" ON storage.objects;
DROP POLICY IF EXISTS "Municipal users can view customer tax documents" ON storage.objects;

-- Also check for any other tax-document related policies
DROP POLICY IF EXISTS "Allow users to upload tax documents to staging" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their tax documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their tax documents" ON storage.objects;

-- Now create the correct storage policies for tax documents staging system
-- Allow any authenticated user to INSERT (for staging)
CREATE POLICY "Users can upload tax documents to staging" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'tax-documents' 
  AND auth.uid() IS NOT NULL
);

-- For SELECT: Check ownership through tax_submission_documents table
CREATE POLICY "Users can access their own tax documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'tax-documents' 
  AND (
    -- User owns the document (check via tax_submission_documents)
    EXISTS (
      SELECT 1 FROM public.tax_submission_documents tsd
      WHERE tsd.storage_path = storage.objects.name
      AND tsd.uploaded_by = auth.uid()
    )
  )
);

-- For DELETE: Check ownership through tax_submission_documents table
CREATE POLICY "Users can remove their own tax documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'tax-documents' 
  AND (
    -- User owns the document (check via tax_submission_documents)
    EXISTS (
      SELECT 1 FROM public.tax_submission_documents tsd
      WHERE tsd.storage_path = storage.objects.name
      AND tsd.uploaded_by = auth.uid()
    )
  )
);

-- Municipal users can view tax documents for their customers
CREATE POLICY "Municipal users access customer tax documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'tax-documents' 
  AND EXISTS (
    SELECT 1 FROM public.tax_submission_documents tsd
    JOIN public.tax_submissions ts ON ts.id = tsd.tax_submission_id
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE tsd.storage_path = storage.objects.name
    AND p.account_type = 'municipal'
    AND p.customer_id = ts.customer_id
  )
);