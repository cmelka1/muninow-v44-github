-- Drop the problematic policy that creates circular dependency
DROP POLICY IF EXISTS "Municipal admins can view all profiles" ON public.profiles;