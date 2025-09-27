-- Update database functions to use payment_transaction_id instead of payment_history_id

-- Update rollback_service_application_payment function
CREATE OR REPLACE FUNCTION public.rollback_service_application_payment(p_payment_transaction_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Update service application to unpaid status
  UPDATE public.municipal_service_applications
  SET 
    payment_status = 'unpaid',
    payment_processed_at = NULL,
    finix_transfer_id = NULL,
    updated_at = now()
  WHERE EXISTS (
    SELECT 1 FROM public.payment_transactions pt
    WHERE pt.id = p_payment_transaction_id
    AND pt.service_application_id = municipal_service_applications.id
  );
  
  -- Mark payment transaction as failed/rolled back
  UPDATE public.payment_transactions
  SET 
    transfer_state = 'FAILED',
    payment_status = 'failed',
    updated_at = now()
  WHERE id = p_payment_transaction_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;

-- Update update_unified_payment_status function  
CREATE OR REPLACE FUNCTION public.update_unified_payment_status(p_payment_transaction_id uuid, p_transfer_state text, p_finix_transfer_id text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_payment_record payment_transactions%ROWTYPE;
BEGIN
  -- Get payment transaction record
  SELECT * INTO v_payment_record
  FROM public.payment_transactions
  WHERE id = p_payment_transaction_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update payment transaction
  UPDATE public.payment_transactions
  SET 
    transfer_state = p_transfer_state,
    finix_transfer_id = p_finix_transfer_id,
    payment_status = CASE 
      WHEN p_transfer_state = 'SUCCEEDED' THEN 'paid'
      WHEN p_transfer_state = 'FAILED' THEN 'failed'
      ELSE 'pending'
    END,
    payment_processed_at = CASE 
      WHEN p_transfer_state = 'SUCCEEDED' THEN now()
      ELSE payment_processed_at
    END,
    updated_at = now()
  WHERE id = p_payment_transaction_id;
  
  -- Update related entity based on type
  IF v_payment_record.permit_application_id IS NOT NULL THEN
    UPDATE public.permit_applications
    SET 
      payment_status = CASE 
        WHEN p_transfer_state = 'SUCCEEDED' THEN 'paid'
        WHEN p_transfer_state = 'FAILED' THEN 'unpaid'
        ELSE payment_status
      END,
      finix_transfer_id = p_finix_transfer_id,
      payment_processed_at = CASE 
        WHEN p_transfer_state = 'SUCCEEDED' THEN now()
        ELSE payment_processed_at
      END,
      updated_at = now()
    WHERE id = v_payment_record.permit_application_id;
    
  ELSIF v_payment_record.business_license_application_id IS NOT NULL THEN
    UPDATE public.business_license_applications
    SET 
      payment_status = CASE 
        WHEN p_transfer_state = 'SUCCEEDED' THEN 'paid'
        WHEN p_transfer_state = 'FAILED' THEN 'unpaid'
        ELSE payment_status
      END,
      finix_transfer_id = p_finix_transfer_id,
      payment_processed_at = CASE 
        WHEN p_transfer_state = 'SUCCEEDED' THEN now()
        ELSE payment_processed_at
      END,
      updated_at = now()
    WHERE id = v_payment_record.business_license_application_id;
    
  ELSIF v_payment_record.tax_submission_id IS NOT NULL THEN
    UPDATE public.tax_submissions
    SET 
      payment_status = CASE 
        WHEN p_transfer_state = 'SUCCEEDED' THEN 'paid'
        WHEN p_transfer_state = 'FAILED' THEN 'unpaid'
        ELSE payment_status
      END,
      finix_transfer_id = p_finix_transfer_id,
      payment_processed_at = CASE 
        WHEN p_transfer_state = 'SUCCEEDED' THEN now()
        ELSE payment_processed_at
      END,
      updated_at = now()
    WHERE id = v_payment_record.tax_submission_id;
    
  ELSIF v_payment_record.service_application_id IS NOT NULL THEN
    UPDATE public.municipal_service_applications
    SET 
      payment_status = CASE 
        WHEN p_transfer_state = 'SUCCEEDED' THEN 'paid'
        WHEN p_transfer_state = 'FAILED' THEN 'unpaid'
        ELSE payment_status
      END,
      finix_transfer_id = p_finix_transfer_id,
      payment_processed_at = CASE 
        WHEN p_transfer_state = 'SUCCEEDED' THEN now()
        ELSE payment_processed_at
      END,
      updated_at = now()
    WHERE id = v_payment_record.service_application_id;
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$function$;