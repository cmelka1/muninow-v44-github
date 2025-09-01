import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ServiceApplicationDocument {
  id: string;
  application_id: string;
  user_id: string;
  file_name: string;
  document_type: string;
  description: string | null;
  storage_path: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}

export const useServiceApplicationDocuments = (applicationId: string) => {
  return useQuery({
    queryKey: ['service-application-documents', applicationId],
    queryFn: async () => {
      if (!applicationId) return [];
      
      const { data, error } = await supabase
        .from('service_application_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching service application documents:', error);
        throw error;
      }

      return data as ServiceApplicationDocument[];
    },
    enabled: !!applicationId,
  });
};

export const useUploadServiceApplicationDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      userId,
      customerId,
      file,
      documentType,
      description
    }: {
      applicationId: string;
      userId: string;
      customerId: string;
      file: File;
      documentType: string;
      description?: string;
    }) => {
      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${userId}/${applicationId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('service-application-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      // Create document record
      const { data, error } = await supabase
        .from('service_application_documents')
        .insert({
          application_id: applicationId,
          user_id: userId,
          customer_id: customerId,
          file_name: file.name,
          document_type: documentType,
          description: description || null,
          storage_path: filePath,
          file_size: file.size,
          content_type: file.type
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document record:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['service-application-documents', data.application_id]
      });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteServiceApplicationDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      // Get document details first
      const { data: document, error: fetchError } = await supabase
        .from('service_application_documents')
        .select('storage_path, application_id')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('service-application-documents')
        .remove([document.storage_path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }

      // Delete database record
      const { error } = await supabase
        .from('service_application_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      return document;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['service-application-documents', data.application_id]
      });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive"
      });
    }
  });
};

export const getDocumentDownloadUrl = async (storagePath: string) => {
  const { data, error } = await supabase.storage
    .from('service-application-documents')
    .createSignedUrl(storagePath, 3600); // 1 hour expiry

  if (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }

  return data.signedUrl;
};
