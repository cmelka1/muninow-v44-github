import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ServiceApplicationDocument {
  id: string;
  application_id: string;
  user_id: string;
  customer_id: string;
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
    queryKey: ['service_application_documents', applicationId],
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