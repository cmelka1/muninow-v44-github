-- Add missing SELECT policies for permit_review_comments
CREATE POLICY "Municipal users can view comments for their customer permits"
ON permit_review_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM permit_applications pa
    JOIN profiles p ON p.id = auth.uid()
    WHERE pa.permit_id = permit_review_comments.permit_id
    AND pa.customer_id = p.customer_id
    AND p.account_type IN ('municipaladmin', 'municipaluser')
  )
);

CREATE POLICY "Super admins can view all permit comments"
ON permit_review_comments
FOR SELECT
USING (is_current_user_super_admin());