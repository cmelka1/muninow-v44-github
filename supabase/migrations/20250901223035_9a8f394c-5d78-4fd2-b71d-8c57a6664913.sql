-- Enable RLS on municipal_service_applications table and create policies

-- Enable Row Level Security
ALTER TABLE public.municipal_service_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own service applications
CREATE POLICY "Users can view their own service applications" 
ON public.municipal_service_applications 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy: Users can insert their own service applications  
CREATE POLICY "Users can insert their own service applications" 
ON public.municipal_service_applications 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own service applications
CREATE POLICY "Users can update their own service applications" 
ON public.municipal_service_applications 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy: Municipal users can view applications for their customer
CREATE POLICY "Municipal users can view applications for their customer" 
ON public.municipal_service_applications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.account_type = 'municipal' 
  AND profiles.customer_id = municipal_service_applications.customer_id
));

-- Policy: Municipal users can update applications for their customer
CREATE POLICY "Municipal users can update applications for their customer" 
ON public.municipal_service_applications 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.account_type = 'municipal' 
  AND profiles.customer_id = municipal_service_applications.customer_id
));

-- Policy: Super admins can manage all applications
CREATE POLICY "Super admins can manage all service applications" 
ON public.municipal_service_applications 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid() 
  AND r.name = 'superAdmin'
));