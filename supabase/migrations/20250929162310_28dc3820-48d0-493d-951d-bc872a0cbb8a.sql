-- Clean up duplicate database functions that still use payment_history_id

-- Drop the old version of rollback_service_application_payment that uses p_payment_history_id
DROP FUNCTION IF EXISTS public.rollback_service_application_payment(p_application_id uuid, p_payment_history_id uuid);

-- Drop the old version of update_unified_payment_status that uses p_payment_history_id
DROP FUNCTION IF EXISTS public.update_unified_payment_status(p_payment_history_id uuid, p_finix_transfer_id text, p_transfer_state text, p_payment_status text);