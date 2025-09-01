-- Create municipal service application comments table
CREATE TABLE public.municipal_service_application_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.municipal_service_application_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for service application comments
CREATE POLICY "Municipal users can create comments for their customer applications"
ON public.municipal_service_application_comments
FOR INSERT
WITH CHECK (
  reviewer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM municipal_service_applications msa
    JOIN municipal_service_tiles mst ON mst.id = msa.tile_id
    JOIN profiles p ON p.id = auth.uid()
    WHERE msa.id = municipal_service_application_comments.application_id
    AND p.account_type = 'municipal'
    AND p.customer_id = mst.customer_id
  )
);

CREATE POLICY "Municipal users can view comments for their customer applications"
ON public.municipal_service_application_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM municipal_service_applications msa
    JOIN municipal_service_tiles mst ON mst.id = msa.tile_id
    JOIN profiles p ON p.id = auth.uid()
    WHERE msa.id = municipal_service_application_comments.application_id
    AND p.account_type = 'municipal'
    AND p.customer_id = mst.customer_id
  )
);

CREATE POLICY "Users can view non-internal comments for their own applications"
ON public.municipal_service_application_comments
FOR SELECT
USING (
  is_internal = false AND
  EXISTS (
    SELECT 1 FROM municipal_service_applications msa
    WHERE msa.id = municipal_service_application_comments.application_id
    AND msa.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create comments for their own applications"
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

CREATE POLICY "Super admins can manage all service application comments"
ON public.municipal_service_application_comments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'superAdmin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_municipal_service_application_comments_updated_at
BEFORE UPDATE ON public.municipal_service_application_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add assigned_reviewer_id and review_notes columns to municipal_service_applications if they don't exist
ALTER TABLE public.municipal_service_applications 
ADD COLUMN IF NOT EXISTS assigned_reviewer_id UUID,
ADD COLUMN IF NOT EXISTS review_notes TEXT;