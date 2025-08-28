-- Remove the old conflicting policy that blocks staging
DROP POLICY IF EXISTS "Users can upload documents for their own tax submissions" ON public.tax_submission_documents;