-- Update app_role enum to use lowercase values
ALTER TYPE public.app_role RENAME TO app_role_old;

CREATE TYPE public.app_role AS ENUM (
  'superadmin',
  'municipaladmin', 
  'municipaluser',
  'residentadmin',
  'residentuser',
  'businessadmin',
  'businessuser'
);

-- Update user_roles table to use new enum values
UPDATE public.user_roles 
SET role = CASE 
  WHEN role::text = 'superAdmin' THEN 'superadmin'::app_role
  WHEN role::text = 'municipalAdmin' THEN 'municipaladmin'::app_role
  WHEN role::text = 'municipalUser' THEN 'municipaluser'::app_role
  WHEN role::text = 'residentAdmin' THEN 'residentadmin'::app_role
  WHEN role::text = 'residentUser' THEN 'residentuser'::app_role
  WHEN role::text = 'businessAdmin' THEN 'businessadmin'::app_role
  WHEN role::text = 'businessUser' THEN 'businessuser'::app_role
  ELSE role
END;

-- Update the column to use the new enum
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE public.app_role 
USING role::text::public.app_role;

-- Drop the old enum
DROP TYPE public.app_role_old;