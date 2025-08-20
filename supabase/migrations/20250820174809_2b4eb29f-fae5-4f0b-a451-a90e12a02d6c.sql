-- Create business license comments table
CREATE TABLE public.business_license_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID NOT NULL REFERENCES public.business_license_applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_license_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for business license comments
CREATE POLICY "Users can view comments for their own license applications" 
ON public.business_license_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.business_license_applications bla
    WHERE bla.id = business_license_comments.license_id 
    AND bla.user_id = auth.uid()
  ) 
  AND is_internal = false
);

CREATE POLICY "Municipal users can view all comments for their customer licenses" 
ON public.business_license_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.business_license_applications bla
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE bla.id = business_license_comments.license_id 
    AND p.account_type = 'municipal' 
    AND p.customer_id = bla.customer_id
  )
);

CREATE POLICY "Municipal users can create comments for their customer licenses" 
ON public.business_license_comments 
FOR INSERT 
WITH CHECK (
  reviewer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.business_license_applications bla
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE bla.id = business_license_comments.license_id 
    AND p.account_type = 'municipal' 
    AND p.customer_id = bla.customer_id
  )
);

CREATE POLICY "Users can create comments for their own license applications" 
ON public.business_license_comments 
FOR INSERT 
WITH CHECK (
  reviewer_id = auth.uid() AND
  is_internal = false AND
  EXISTS (
    SELECT 1 FROM public.business_license_applications bla
    WHERE bla.id = business_license_comments.license_id 
    AND bla.user_id = auth.uid()
  )
);

-- Super admins can manage all comments
CREATE POLICY "Super admins can manage all license comments" 
ON public.business_license_comments 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'superAdmin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_business_license_comments_updated_at
  BEFORE UPDATE ON public.business_license_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_business_license_comments_license_id ON public.business_license_comments(license_id);
CREATE INDEX idx_business_license_comments_reviewer_id ON public.business_license_comments(reviewer_id);
CREATE INDEX idx_business_license_comments_created_at ON public.business_license_comments(created_at);