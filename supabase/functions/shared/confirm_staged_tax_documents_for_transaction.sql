-- Create function to safely confirm staged tax documents for a transaction
-- This prevents payment failures due to missing document confirmation function

CREATE OR REPLACE FUNCTION public.confirm_staged_tax_documents_for_transaction(
  p_staging_id UUID,
  p_transaction_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if staging_id has any documents
  IF EXISTS (
    SELECT 1 FROM public.tax_submission_documents 
    WHERE staging_id = p_staging_id 
    AND status = 'staged'
  ) THEN
    -- Update staged documents to confirmed status
    UPDATE public.tax_submission_documents
    SET 
      status = 'confirmed',
      updated_at = now()
    WHERE staging_id = p_staging_id
      AND status = 'staged';
    
    RETURN jsonb_build_object(
      'success', true,
      'documents_confirmed', true,
      'message', 'Documents confirmed successfully'
    );
  ELSE
    -- No documents to confirm - this is fine
    RETURN jsonb_build_object(
      'success', true,
      'documents_confirmed', false,
      'message', 'No staged documents found - proceeding without documents'
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the payment
    RETURN jsonb_build_object(
      'success', true,
      'documents_confirmed', false,
      'error', SQLERRM,
      'message', 'Document confirmation failed but payment can proceed'
    );
END;
$$;