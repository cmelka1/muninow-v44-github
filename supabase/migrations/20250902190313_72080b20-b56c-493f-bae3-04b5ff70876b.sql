-- Create rollback function for service application payment failures
CREATE OR REPLACE FUNCTION public.rollback_service_application_payment(
  p_application_id uuid,
  p_payment_history_id uuid
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete documents first (due to foreign key dependencies)
  DELETE FROM public.service_application_documents 
  WHERE application_id = p_application_id;
  
  -- Delete payment history record
  DELETE FROM public.payment_history 
  WHERE id = p_payment_history_id;
  
  -- Delete application record
  DELETE FROM public.municipal_service_applications 
  WHERE id = p_application_id;
  
  -- Return success confirmation
  RETURN jsonb_build_object(
    'success', true, 
    'rolled_back', true,
    'application_id', p_application_id,
    'payment_history_id', p_payment_history_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details for debugging
    RETURN jsonb_build_object(
      'success', false, 
      'error', SQLERRM,
      'error_code', SQLSTATE,
      'application_id', p_application_id,
      'payment_history_id', p_payment_history_id
    );
END;
$$;