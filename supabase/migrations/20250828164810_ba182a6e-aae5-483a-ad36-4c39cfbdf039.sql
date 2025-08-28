-- Add status column to tax_submission_documents for staging support
ALTER TABLE public.tax_submission_documents 
ADD COLUMN status text NOT NULL DEFAULT 'staged' CHECK (status IN ('staged', 'confirmed', 'failed'));

-- Add staging_id column to group documents before confirmation
ALTER TABLE public.tax_submission_documents 
ADD COLUMN staging_id uuid;

-- Add upload progress tracking
ALTER TABLE public.tax_submission_documents 
ADD COLUMN upload_progress integer DEFAULT 100 CHECK (upload_progress >= 0 AND upload_progress <= 100);

-- Add retry count for failed uploads
ALTER TABLE public.tax_submission_documents 
ADD COLUMN retry_count integer DEFAULT 0;

-- Add error message for failed uploads
ALTER TABLE public.tax_submission_documents 
ADD COLUMN error_message text;

-- Function to confirm staged documents after successful payment
CREATE OR REPLACE FUNCTION public.confirm_staged_tax_documents(p_staging_id uuid, p_tax_submission_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update staged documents to confirmed status
  UPDATE public.tax_submission_documents
  SET 
    status = 'confirmed',
    tax_submission_id = p_tax_submission_id,
    updated_at = now()
  WHERE staging_id = p_staging_id
    AND status = 'staged';
END;
$$;

-- Function to cleanup failed/orphaned staged documents
CREATE OR REPLACE FUNCTION public.cleanup_staged_tax_documents(p_staging_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark staged documents as failed and remove from storage
  UPDATE public.tax_submission_documents
  SET 
    status = 'failed',
    error_message = 'Payment failed - document cleanup',
    updated_at = now()
  WHERE staging_id = p_staging_id
    AND status = 'staged';
END;
$$;

-- Function to cleanup old staged documents (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_staged_tax_documents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark old staged documents as failed
  UPDATE public.tax_submission_documents
  SET 
    status = 'failed',
    error_message = 'Staged document expired (24 hours)',
    updated_at = now()
  WHERE status = 'staged'
    AND created_at < now() - INTERVAL '24 hours';
END;
$$;