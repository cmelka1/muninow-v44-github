-- Create tax submission comments table for communication between taxpayers and municipal staff
CREATE TABLE public.tax_submission_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tax_submission_comments ENABLE ROW LEVEL SECURITY;

-- Users can view comments for their own tax submissions (external comments only)
CREATE POLICY "Users can view comments for their own tax submissions" 
ON public.tax_submission_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tax_submissions ts
    WHERE ts.id = tax_submission_comments.submission_id 
    AND ts.user_id = auth.uid()
  ) AND is_internal = false
);

-- Users can create comments for their own tax submissions (external only)
CREATE POLICY "Users can create comments for their own tax submissions" 
ON public.tax_submission_comments
FOR INSERT
TO authenticated
WITH CHECK (
  reviewer_id = auth.uid() 
  AND is_internal = false 
  AND EXISTS (
    SELECT 1 FROM public.tax_submissions ts
    WHERE ts.id = tax_submission_comments.submission_id 
    AND ts.user_id = auth.uid()
  )
);

-- Municipal users can view all comments for their customer tax submissions
CREATE POLICY "Municipal users can view all comments for their customer submissions" 
ON public.tax_submission_comments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tax_submissions ts
    WHERE ts.id = tax_submission_comments.submission_id 
    AND has_municipal_access_to_customer(auth.uid(), ts.customer_id)
  )
);

-- Municipal users can create comments for their customer tax submissions
CREATE POLICY "Municipal users can create comments for their customer submissions" 
ON public.tax_submission_comments
FOR INSERT
TO authenticated
WITH CHECK (
  reviewer_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.tax_submissions ts
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ts.id = tax_submission_comments.submission_id 
    AND ts.customer_id = p.customer_id 
    AND p.account_type IN ('municipal', 'municipaladmin', 'municipaluser')
  )
);

-- Super admins can manage all tax submission comments
CREATE POLICY "Super admins can manage all tax submission comments" 
ON public.tax_submission_comments
FOR ALL
TO authenticated
USING (is_current_user_super_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_tax_submission_comments_updated_at
BEFORE UPDATE ON public.tax_submission_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();