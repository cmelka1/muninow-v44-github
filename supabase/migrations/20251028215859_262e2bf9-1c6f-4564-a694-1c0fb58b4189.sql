-- Update can_view_profile_for_permits to check ALL application types
-- This allows municipal users to view profiles of ANY user who has submitted
-- permits, business licenses, tax submissions, OR service applications to their municipality

CREATE OR REPLACE FUNCTION public.can_view_profile_for_permits(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_customer_id uuid;
BEGIN
  -- Allow users to view their own profile
  IF auth.uid() = target_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Allow super admins to view all profiles
  IF is_current_user_super_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- Get current user's customer_id if they're municipal
  SELECT customer_id INTO current_user_customer_id
  FROM profiles
  WHERE id = auth.uid()
    AND account_type IN ('municipaladmin', 'municipaluser', 'municipal');
  
  -- If not municipal or no customer_id, deny access
  IF current_user_customer_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if target user has any permit applications in this municipality
  IF EXISTS (
    SELECT 1 FROM permit_applications
    WHERE user_id = target_user_id
      AND customer_id = current_user_customer_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if target user has any business license applications in this municipality
  IF EXISTS (
    SELECT 1 FROM business_license_applications
    WHERE user_id = target_user_id
      AND customer_id = current_user_customer_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if target user has any tax submissions in this municipality
  IF EXISTS (
    SELECT 1 FROM tax_submissions
    WHERE user_id = target_user_id
      AND customer_id = current_user_customer_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if target user has any service applications in this municipality
  IF EXISTS (
    SELECT 1 FROM municipal_service_applications
    WHERE user_id = target_user_id
      AND customer_id = current_user_customer_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- If no applications found, deny access
  RETURN FALSE;
END;
$$;