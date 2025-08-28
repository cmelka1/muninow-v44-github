-- Make tax_submission_id nullable to allow staged documents
ALTER TABLE public.tax_submission_documents 
ALTER COLUMN tax_submission_id DROP NOT NULL;

-- Update RLS INSERT policy to allow staged documents
DROP POLICY IF EXISTS "Users can insert documents for their own tax submissions" ON public.tax_submission_documents;

CREATE POLICY "Users can insert documents for their own tax submissions" 
ON public.tax_submission_documents 
FOR INSERT 
WITH CHECK (
  uploaded_by = auth.uid() AND (
    -- Allow staged documents (no tax_submission_id yet)
    tax_submission_id IS NULL OR
    -- Allow documents for existing tax submissions owned by user
    EXISTS (
      SELECT 1 FROM public.tax_submissions ts 
      WHERE ts.id = tax_submission_documents.tax_submission_id 
      AND ts.user_id = auth.uid()
    )
  )
);