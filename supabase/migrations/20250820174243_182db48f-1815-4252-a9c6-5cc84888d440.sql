-- Create storage bucket for business license documents
INSERT INTO storage.buckets (id, name, public) VALUES ('business-license-documents', 'business-license-documents', false);

-- Create storage policies for business license documents
CREATE POLICY "Users can view their own business license documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'business-license-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own business license documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'business-license-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own business license documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'business-license-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own business license documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'business-license-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Municipal users can view documents for their customer" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'business-license-documents' AND 
  EXISTS (
    SELECT 1 FROM business_license_documents bld
    JOIN profiles p ON p.id = auth.uid()
    WHERE storage.objects.name = bld.storage_path
    AND p.account_type = 'municipal'
    AND p.customer_id = bld.customer_id
  )
);