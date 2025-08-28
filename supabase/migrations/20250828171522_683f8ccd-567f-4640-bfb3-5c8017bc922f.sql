-- Create new SELECT policy that handles both staged and confirmed documents
CREATE POLICY "Users can view their own tax submission documents" 
ON public.tax_submission_documents 
FOR SELECT 
USING (
  uploaded_by = auth.uid() 
  AND (
    tax_submission_id IS NULL  -- Staged documents
    OR 
    EXISTS (
      SELECT 1 FROM public.tax_submissions ts 
      WHERE ts.id = tax_submission_documents.tax_submission_id 
      AND ts.user_id = auth.uid()
    ) -- Confirmed documents from their submissions
  )
);