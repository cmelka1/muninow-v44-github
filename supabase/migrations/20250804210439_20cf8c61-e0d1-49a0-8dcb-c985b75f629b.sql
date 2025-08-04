-- Create security definer function to check permit profile access
CREATE OR REPLACE FUNCTION public.can_view_profile_for_permits(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Allow users to view their own profile
  IF auth.uid() = target_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Allow super admins to view all profiles
  IF EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'superAdmin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Allow municipal users to view profiles of users who have permits in their jurisdiction
  IF EXISTS (
    SELECT 1 FROM profiles current_user_profile
    WHERE current_user_profile.id = auth.uid()
    AND current_user_profile.account_type = 'municipal'
    AND EXISTS (
      SELECT 1 FROM permit_applications pa
      WHERE pa.user_id = target_user_id
      AND pa.customer_id = current_user_profile.customer_id
    )
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Allow users to view municipal staff profiles who have interacted with their permits
  IF EXISTS (
    SELECT 1 FROM permit_applications pa
    WHERE pa.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles municipal_profile
      WHERE municipal_profile.id = target_user_id
      AND municipal_profile.account_type = 'municipal'
      AND municipal_profile.customer_id = pa.customer_id
    )
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Allow users to view profiles of reviewers/inspectors on their permits
  IF EXISTS (
    SELECT 1 FROM permit_applications pa
    WHERE pa.user_id = auth.uid()
    AND (pa.assigned_reviewer_id = target_user_id)
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Allow reviewers to view applicant profiles for permits they're assigned to
  IF EXISTS (
    SELECT 1 FROM permit_applications pa
    WHERE pa.assigned_reviewer_id = auth.uid()
    AND pa.user_id = target_user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Add new RLS policy for permit-related profile access
CREATE POLICY "Users can view profiles for permit interactions"
ON public.profiles
FOR SELECT
USING (public.can_view_profile_for_permits(id));