-- Create tax submission documents table only (skip existing storage policies)
CREATE TABLE IF NOT EXISTS public.tax_submission_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tax_submission_id UUID NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'supporting_document',
  file_name TEXT NOT NULL,
  original_file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  description TEXT,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tax_submission_documents
ALTER TABLE public.tax_submission_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tax_submission_documents
CREATE POLICY "Users can view documents for their own tax submissions"
ON public.tax_submission_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tax_submissions ts
    WHERE ts.id = tax_submission_documents.tax_submission_id
    AND ts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload documents for their own tax submissions"
ON public.tax_submission_documents
FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.tax_submissions ts
    WHERE ts.id = tax_submission_documents.tax_submission_id
    AND ts.user_id = auth.uid()
  )
);

CREATE POLICY "Municipal users can view documents for their customer tax submissions"
ON public.tax_submission_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tax_submissions ts
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ts.id = tax_submission_documents.tax_submission_id
    AND p.account_type = 'municipal'
    AND p.customer_id = ts.customer_id
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_tax_submission_documents_updated_at
BEFORE UPDATE ON public.tax_submission_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();