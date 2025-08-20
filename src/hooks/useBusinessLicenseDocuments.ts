import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UploadBusinessLicenseDocumentData {
  license_id: string;
  customer_id: string;
  merchant_id?: string;
  merchant_name?: string;
  file_name: string;
  content_type: string;
  file_size: number;
  document_type: string;
  description?: string;
}

export const useBusinessLicenseDocuments = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadDocument = useMutation({
    mutationFn: async ({ file, data }: { file: File; data: UploadBusinessLicenseDocumentData }) => {
      if (!user) throw new Error('User must be authenticated');

      const fileId = crypto.randomUUID();
      const fileName = `${fileId}-${file.name}`;
      const filePath = `business-licenses/${data.license_id}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('business-license-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create document record
      const { data: document, error: docError } = await supabase
        .from('business_license_documents')
        .insert({
          ...data,
          user_id: user.id,
          storage_path: filePath,
        })
        .select()
        .single();

      if (docError) throw docError;
      return document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-license-documents'] });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      // Get document info first
      const { data: document, error: fetchError } = await supabase
        .from('business_license_documents')
        .select('storage_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('business-license-documents')
        .remove([document.storage_path]);

      if (storageError) throw storageError;

      // Delete document record
      const { error: deleteError } = await supabase
        .from('business_license_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-license-documents'] });
    },
  });

  const getDocumentUrl = async (storagePath: string) => {
    const { data } = await supabase.storage
      .from('business-license-documents')
      .createSignedUrl(storagePath, 3600);

    return data?.signedUrl;
  };

  return {
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
    uploadProgress,
    setUploadProgress,
  };
};