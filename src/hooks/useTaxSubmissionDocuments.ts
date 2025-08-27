import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TaxDocument {
  id?: string;
  file: File;
  documentType: string;
  description: string;
  uploaded?: boolean;
  storagePath?: string;
}

interface UploadedDocument {
  id: string;
  tax_submission_id: string;
  document_type: string;
  file_name: string;
  original_file_name: string;
  content_type: string;
  file_size: number;
  storage_path: string;
  description: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export const useTaxSubmissionDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const generateStoragePath = useCallback((userId: string, fileName: string): string => {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${userId}/${timestamp}_${sanitizedFileName}`;
  }, []);

  const uploadDocument = useCallback(async (
    file: File,
    taxSubmissionId: string,
    documentType: string,
    description: string
  ): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    const storagePath = generateStoragePath(user.id, file.name);
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('tax-documents')
      .upload(storagePath, file);
    
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // Save document record
    const { error: dbError } = await supabase
      .from('tax_submission_documents')
      .insert({
        tax_submission_id: taxSubmissionId,
        document_type: documentType,
        file_name: storagePath.split('/')[1], // Remove user folder prefix
        original_file_name: file.name,
        content_type: file.type,
        file_size: file.size,
        storage_path: storagePath,
        description: description || null,
        uploaded_by: user.id
      });
    
    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('tax-documents')
        .remove([storagePath]);
      
      throw new Error(`Failed to save document record: ${dbError.message}`);
    }
    
    return storagePath;
  }, [user, generateStoragePath]);

  const uploadMultipleDocuments = useCallback(async (
    documents: TaxDocument[],
    taxSubmissionId: string
  ): Promise<void> => {
    if (!user || documents.length === 0) return;
    
    setUploading(true);
    
    try {
      const uploadPromises = documents.map(doc => 
        uploadDocument(doc.file, taxSubmissionId, doc.documentType, doc.description)
      );
      
      await Promise.all(uploadPromises);
      
      toast({
        title: 'Documents uploaded',
        description: `${documents.length} document(s) uploaded successfully.`
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setUploading(false);
    }
  }, [user, uploadDocument, toast]);

  const getDocuments = useCallback(async (taxSubmissionId: string): Promise<UploadedDocument[]> => {
    const { data, error } = await supabase
      .from('tax_submission_documents')
      .select('*')
      .eq('tax_submission_id', taxSubmissionId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }
    
    return data || [];
  }, []);

  const getDocumentUrl = useCallback(async (storagePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('tax-documents')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry
    
    if (error) {
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }
    
    return data.signedUrl;
  }, []);

  const deleteDocument = useCallback(async (documentId: string, storagePath: string): Promise<void> => {
    // Delete from database
    const { error: dbError } = await supabase
      .from('tax_submission_documents')
      .delete()
      .eq('id', documentId);
    
    if (dbError) {
      throw new Error(`Failed to delete document record: ${dbError.message}`);
    }
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('tax-documents')
      .remove([storagePath]);
    
    if (storageError) {
      console.warn('Failed to delete file from storage:', storageError.message);
      // Don't throw error for storage deletion failure
    }
  }, []);

  return {
    uploading,
    uploadDocument,
    uploadMultipleDocuments,
    getDocuments,
    getDocumentUrl,
    deleteDocument
  };
};