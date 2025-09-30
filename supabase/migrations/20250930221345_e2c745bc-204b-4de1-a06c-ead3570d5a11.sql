-- Drop legacy smart_bill_matching function with correct signature
DROP FUNCTION IF EXISTS public.smart_bill_matching(input_bill_id uuid);