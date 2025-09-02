-- Add foreign key constraint for reviewer_id to profiles table
ALTER TABLE public.municipal_service_application_comments
ADD CONSTRAINT municipal_service_application_comments_reviewer_id_fkey
FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id);

-- Create RLS policies for service application comments
-- Policy for municipal users to create comments for their customer applications
CREATE POLICY "Municipal users can create comments for their customer applications"
ON public.municipal_service_application_comments
FOR INSERT
WITH CHECK (
  reviewer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM municipal_service_applications msa
    JOIN profiles p ON p.id = auth.uid()
    WHERE msa.id = municipal_service_application_comments.application_id
    AND p.account_type = 'municipal'
    AND p.customer_id = msa.customer_id
  )
);

-- Policy for municipal users to view all comments for their customer applications
CREATE POLICY "Municipal users can view all comments for their customer applications"
ON public.municipal_service_application_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM municipal_service_applications msa
    JOIN profiles p ON p.id = auth.uid()
    WHERE msa.id = municipal_service_application_comments.application_id
    AND p.account_type = 'municipal'
    AND p.customer_id = msa.customer_id
  )
);

-- Policy for users to create external comments for their own applications
CREATE POLICY "Users can create external comments for their own applications"
ON public.municipal_service_application_comments
FOR INSERT
WITH CHECK (
  reviewer_id = auth.uid() AND
  is_internal = false AND
  EXISTS (
    SELECT 1 FROM municipal_service_applications msa
    WHERE msa.id = municipal_service_application_comments.application_id
    AND msa.user_id = auth.uid()
  )
);

-- Policy for users to view external comments for their own applications
CREATE POLICY "Users can view external comments for their own applications"
ON public.municipal_service_application_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM municipal_service_applications msa
    WHERE msa.id = municipal_service_application_comments.application_id
    AND msa.user_id = auth.uid()
  ) AND is_internal = false
);