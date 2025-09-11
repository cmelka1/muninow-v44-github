-- Phase 1: Data Consistency Fixes

-- First, let's see what account_type values we currently have and standardize them
UPDATE public.profiles 
SET account_type = 'municipaluser' 
WHERE account_type = 'municipal';

UPDATE public.profiles 
SET account_type = 'residentadmin' 
WHERE account_type = 'resident';

-- Remove the redundant profiles.role column since it's not being used consistently
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Clean up user_roles to match the standardized account_types
-- Remove any conflicting roles and ensure they align with account_type
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT ur.user_id 
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  JOIN public.roles r ON r.id = ur.role_id
  WHERE 
    (p.account_type LIKE 'municipal%' AND r.name NOT LIKE 'municipal%') OR
    (p.account_type LIKE 'resident%' AND r.name NOT LIKE 'resident%') OR
    (p.account_type = 'superadmin' AND r.name != 'superadmin')
);

-- Phase 2: System Logic Updates

-- Update the profile role assignment function to handle specific account types
CREATE OR REPLACE FUNCTION public.handle_profile_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  role_name text;
BEGIN
  -- Map specific account types to role names
  CASE NEW.account_type
    WHEN 'superadmin' THEN
      role_name := 'superadmin';
    WHEN 'municipaladmin' THEN
      role_name := 'municipaladmin';
    WHEN 'municipaluser' THEN
      role_name := 'municipaluser';
    WHEN 'residentadmin' THEN
      role_name := 'residentadmin';
    WHEN 'residentuser' THEN
      role_name := 'residentuser';
    WHEN 'businessadmin' THEN
      role_name := 'businessadmin';
    WHEN 'businessuser' THEN
      role_name := 'businessuser';
    ELSE
      -- For any unrecognized account type, default to residentuser
      role_name := 'residentuser';
  END CASE;
  
  -- Remove any existing roles for this user to prevent conflicts
  DELETE FROM public.user_roles WHERE user_id = NEW.id;
  
  -- Insert the new role if it exists
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT NEW.id, r.id
  FROM public.roles r
  WHERE r.name = role_name
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Add a function to validate account_type and user_roles consistency
CREATE OR REPLACE FUNCTION public.validate_account_type_role_consistency()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Ensure account_type is one of the allowed values
  IF NEW.account_type NOT IN (
    'superadmin', 'municipaladmin', 'municipaluser', 
    'residentadmin', 'residentuser', 'businessadmin', 'businessuser'
  ) THEN
    RAISE EXCEPTION 'Invalid account_type: %. Allowed values are: superadmin, municipaladmin, municipaluser, residentadmin, residentuser, businessadmin, businessuser', NEW.account_type;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add the validation trigger
DROP TRIGGER IF EXISTS validate_account_type_trigger ON public.profiles;
CREATE TRIGGER validate_account_type_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_account_type_role_consistency();

-- Phase 3: Ensure Data Integrity

-- Sync existing profiles to have correct roles based on their account_type
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN 
    SELECT id, account_type FROM public.profiles 
  LOOP
    -- This will trigger the handle_profile_role_assignment function
    UPDATE public.profiles 
    SET updated_at = now() 
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- Add a constraint to ensure account_type values are valid
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_account_type 
CHECK (account_type IN (
  'superadmin', 'municipaladmin', 'municipaluser', 
  'residentadmin', 'residentuser', 'businessadmin', 'businessuser'
));

-- Create an index on account_type for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);