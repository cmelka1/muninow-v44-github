-- Create service application documents table
CREATE TABLE public.service_application_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  user_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create storage bucket for service application documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('service-application-documents', 'service-application-documents', false);

-- Enable RLS on the table
ALTER TABLE public.service_application_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for service application documents
CREATE POLICY "Users can view their own service application documents" 
ON public.service_application_documents 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own service application documents" 
ON public.service_application_documents 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Municipal users can view documents for their customer" 
ON public.service_application_documents 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.account_type = 'municipal' 
  AND profiles.customer_id = service_application_documents.customer_id
));

-- Create storage policies for service application documents
CREATE POLICY "Users can view their own service application documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'service-application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own service application documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'service-application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own service application documents" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'service-application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own service application documents" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'service-application-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Municipal users can view documents for applications in their customer
CREATE POLICY "Municipal users can view service application documents for their customer" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'service-application-documents' 
  AND EXISTS (
    SELECT 1 FROM public.service_application_documents sad
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE sad.storage_path = name 
    AND p.account_type = 'municipal' 
    AND p.customer_id = sad.customer_id
  )
);

-- Create trigger for updated_at timestamp
CREATE TRIGGER update_service_application_documents_updated_at
BEFORE UPDATE ON public.service_application_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();