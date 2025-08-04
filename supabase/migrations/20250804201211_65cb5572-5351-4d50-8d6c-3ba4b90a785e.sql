-- Add RLS policy to allow permit applicants to insert comments on their own permits
CREATE POLICY "Applicants can add comments to their own permits" 
ON public.permit_review_comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.permit_applications 
    WHERE permit_applications.permit_id = permit_review_comments.permit_id 
    AND permit_applications.user_id = auth.uid()
  )
);