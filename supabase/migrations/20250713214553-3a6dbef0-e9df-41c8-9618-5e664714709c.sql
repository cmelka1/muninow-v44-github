-- Drop the problematic policy that creates circular dependency
DROP POLICY IF EXISTS "Municipal users can view profiles of users with bills for their customer" ON public.profiles;