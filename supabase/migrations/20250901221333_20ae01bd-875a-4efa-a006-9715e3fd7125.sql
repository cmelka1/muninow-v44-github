-- Create RLS policies for service_application_documents table
CREATE POLICY "Users can view documents for their own applications"
ON public.service_application_documents
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.municipal_service_applications 
  WHERE municipal_service_applications.id = service_application_documents.application_id 
  AND municipal_service_applications.user_id = auth.uid()
));

CREATE POLICY "Users can insert documents for their own applications"
ON public.service_application_documents
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.municipal_service_applications 
  WHERE municipal_service_applications.id = service_application_documents.application_id 
  AND municipal_service_applications.user_id = auth.uid()
) AND user_id = auth.uid());

CREATE POLICY "Municipal users can view documents for their customer applications"
ON public.service_application_documents
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.municipal_service_applications msa
  JOIN public.profiles p ON p.id = auth.uid()
  WHERE msa.id = service_application_documents.application_id
  AND p.account_type = 'municipal'
  AND msa.customer_id = p.customer_id
));

CREATE POLICY "Super admins can manage all service application documents"
ON public.service_application_documents
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid() 
  AND r.name = 'superAdmin'
));

-- Create RLS policies for municipal_service_application_comments table
CREATE POLICY "Users can view external comments for their own applications"
ON public.municipal_service_application_comments
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.municipal_service_applications 
  WHERE municipal_service_applications.id = municipal_service_application_comments.application_id 
  AND municipal_service_applications.user_id = auth.uid()
) AND is_internal = false);

CREATE POLICY "Municipal users can view all comments for their customer applications"
ON public.municipal_service_application_comments
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.municipal_service_applications msa
  JOIN public.profiles p ON p.id = auth.uid()
  WHERE msa.id = municipal_service_application_comments.application_id
  AND p.account_type = 'municipal'
  AND msa.customer_id = p.customer_id
));

CREATE POLICY "Municipal users can create comments for their customer applications"
ON public.municipal_service_application_comments
FOR INSERT 
WITH CHECK (reviewer_id = auth.uid() AND EXISTS (
  SELECT 1 FROM public.municipal_service_applications msa
  JOIN public.profiles p ON p.id = auth.uid()
  WHERE msa.id = municipal_service_application_comments.application_id
  AND p.account_type = 'municipal'
  AND msa.customer_id = p.customer_id
));

CREATE POLICY "Users can create external comments for their own applications"
ON public.municipal_service_application_comments
FOR INSERT 
WITH CHECK (reviewer_id = auth.uid() AND is_internal = false AND EXISTS (
  SELECT 1 FROM public.municipal_service_applications 
  WHERE municipal_service_applications.id = municipal_service_application_comments.application_id 
  AND municipal_service_applications.user_id = auth.uid()
));

CREATE POLICY "Super admins can manage all service application comments"
ON public.municipal_service_application_comments
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid() 
  AND r.name = 'superAdmin'
));

-- Create storage bucket for service application documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-application-documents', 'service-application-documents', false);

-- Create storage policies for service application documents
CREATE POLICY "Users can view their own service application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'service-application-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own service application documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'service-application-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Municipal users can view service application documents for their customer" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'service-application-documents' AND EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid() 
  AND p.account_type = 'municipal'
));

CREATE POLICY "Super admins can manage all service application documents in storage" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'service-application-documents' AND EXISTS (
  SELECT 1 FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid() 
  AND r.name = 'superAdmin'
));