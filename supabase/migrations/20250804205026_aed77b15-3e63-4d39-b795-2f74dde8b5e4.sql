-- Fix infinite recursion by removing problematic municipal policy

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Municipal users can view profiles for their customer" ON public.profiles;

-- The municipal users functionality can be implemented later with a proper security definer function
-- For now, we just need basic login to work with these policies:
-- 1. "Users can view their own profiles" (already exists)
-- 2. "Users can update their own profiles" (already exists) 
-- 3. "Super admins can view all profiles" (already exists)
-- 4. "Super admins can update all profiles" (already exists)