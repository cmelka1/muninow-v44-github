-- Comprehensive Business Role Cleanup: Remove businessManager and businessOwner
-- Convert any existing businessManager role assignments to businessAdmin

-- 1. Update any existing businessManager users to businessAdmin
UPDATE public.user_roles 
SET role_id = (SELECT id FROM public.roles WHERE name = 'businessAdmin')
WHERE role_id = (SELECT id FROM public.roles WHERE name = 'businessManager');

-- 2. Delete businessManager and businessOwner roles from roles table
DELETE FROM public.roles WHERE name IN ('businessManager', 'businessOwner');

-- 3. Drop the parent_manager_id column from business_members table
ALTER TABLE public.business_members DROP COLUMN IF EXISTS parent_manager_id;

-- 4. Drop unused database functions
DROP FUNCTION IF EXISTS public.is_business_manager(uuid);
DROP FUNCTION IF EXISTS public.is_manager_of_user(uuid, uuid);

-- 5. Update app_role enum to only include the simplified business roles
-- First create new enum without businessManager and businessOwner
CREATE TYPE public.app_role_new AS ENUM (
  'superAdmin',
  'municipalAdmin', 
  'municipalUser',
  'residentAdmin',
  'residentUser',
  'businessAdmin',
  'businessUser'
);

-- Update user_roles table to use string-based role checking instead of enum
-- (This is already handled by the roles table relationship)

-- Drop the old enum and rename the new one
DROP TYPE IF EXISTS public.app_role CASCADE;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- 6. Clean up any RLS policies that referenced manager roles
-- Update business_members policies to remove manager-specific logic

-- Drop existing manager-related policies
DROP POLICY IF EXISTS "Business managers can insert users" ON public.business_members;
DROP POLICY IF EXISTS "Business managers can update their users" ON public.business_members;
DROP POLICY IF EXISTS "Business managers can view their managed users" ON public.business_members;

-- Create simplified policies for the 2-tier system (Admin → User)
CREATE POLICY "Business admins can manage all members" 
ON public.business_members 
FOR ALL 
USING (is_business_admin(business_id));

CREATE POLICY "Members can view own record" 
ON public.business_members 
FOR SELECT 
USING (auth.uid() = member_id);

CREATE POLICY "Members can update own record" 
ON public.business_members 
FOR UPDATE 
USING (auth.uid() = member_id);