-- Fix remaining database functions to use lowercase role names

-- Update is_current_user_super_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'superadmin'
  );
$function$;

-- Update can_view_profile_for_permits function
CREATE OR REPLACE FUNCTION public.can_view_profile_for_permits(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
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
    AND r.name = 'superadmin'
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
$function$;

-- Update has_permission function (if it exists)
CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
  -- Check if user is super admin
  IF EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'superadmin'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Add other permission checks as needed
  RETURN FALSE;
END;
$function$;

-- Update handle_profile_role_assignment function (if it exists)
CREATE OR REPLACE FUNCTION public.handle_profile_role_assignment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  role_name text;
BEGIN
  -- Map account types to role names using lowercase
  CASE NEW.account_type
    WHEN 'superadmin' THEN
      role_name := 'superadmin';
    WHEN 'municipal' THEN
      -- Default to municipal user, can be upgraded later
      role_name := 'municipaluser';
    WHEN 'resident' THEN
      -- Default to resident user, can be upgraded later  
      role_name := 'residentuser';
    WHEN 'business' THEN
      -- Default to business user, can be upgraded later
      role_name := 'businessuser';
    ELSE
      -- Default fallback
      role_name := 'residentuser';
  END CASE;
  
  -- Insert user role if it doesn't exist
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT NEW.id, r.id
  FROM public.roles r
  WHERE r.name = role_name
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;