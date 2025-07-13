-- Fix the security permissions for bill matching trigger function
-- The function was running as SECURITY INVOKER, causing permission issues during signup
-- Change to SECURITY DEFINER so it runs with creator's permissions

CREATE OR REPLACE FUNCTION public.trigger_bill_matching_for_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to run with creator's permissions
AS $$
BEGIN
  -- Queue background job to re-run matching for unassigned bills
  INSERT INTO public.bill_matching_queue (user_id, trigger_type, created_at)
  VALUES (NEW.id, 'new_user_signup', NOW());
  
  RETURN NEW;
END;
$$;