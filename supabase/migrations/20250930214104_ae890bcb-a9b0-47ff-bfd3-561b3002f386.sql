-- Phase 1: Remove deprecated smart_bill_matching function if it exists
DROP FUNCTION IF EXISTS public.smart_bill_matching(uuid, text, text, text, text);

-- Clean up any remaining bill-related function references
DROP FUNCTION IF EXISTS public.get_user_bills(uuid);
DROP FUNCTION IF EXISTS public.update_bill_status(uuid, text);