-- Drop the restrictive policy that only allows updates on draft applications
DROP POLICY IF EXISTS "Users can update their own draft applications" ON public.business_license_applications;

-- Create a new policy that allows users to update their own applications
-- This allows status transitions while maintaining security
CREATE POLICY "Users can update their own applications" 
ON public.business_license_applications 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());