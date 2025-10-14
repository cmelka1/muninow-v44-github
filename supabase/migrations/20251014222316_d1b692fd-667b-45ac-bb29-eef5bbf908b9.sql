-- Allow super admins to delete merchants
CREATE POLICY "Super admins can delete merchants"
ON public.merchants
FOR DELETE
TO authenticated
USING (is_current_user_super_admin());