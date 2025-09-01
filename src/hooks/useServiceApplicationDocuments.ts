import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      
      // For now, return empty array since documents table doesn't exist yet
      // This will be updated when the table is created
      return [] as ServiceApplicationDocument[];
    },
    enabled: !!applicationId,
  });
};
