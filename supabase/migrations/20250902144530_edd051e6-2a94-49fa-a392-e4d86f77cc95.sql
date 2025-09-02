-- Enable RLS on municipal_service_applications table and add policies
ALTER TABLE public.municipal_service_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own service applications
CREATE POLICY "Users can view their own service applications" 
ON public.municipal_service_applications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own service applications
CREATE POLICY "Users can insert their own service applications" 
ON public.municipal_service_applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own service applications
CREATE POLICY "Users can update their own service applications" 
ON public.municipal_service_applications 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Municipal users can view applications for their customer
CREATE POLICY "Municipal users can view applications for their customer" 
ON public.municipal_service_applications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.account_type = 'municipal' 
  AND profiles.customer_id = municipal_service_applications.customer_id
));

-- Municipal users can update applications for their customer
CREATE POLICY "Municipal users can update applications for their customer" 
ON public.municipal_service_applications 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.account_type = 'municipal' 
  AND profiles.customer_id = municipal_service_applications.customer_id
));

-- Super admins can manage all service applications
CREATE POLICY "Super admins can manage all service applications" 
ON public.municipal_service_applications 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid() 
  AND r.name = 'superAdmin'
));