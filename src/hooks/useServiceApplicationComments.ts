import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ServiceApplicationComment {
  id: string;
  application_id: string;
  reviewer_id: string;
  comment_text: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  reviewer: {
    first_name: string;
    last_name: string;
    email: string;
    account_type: string;
  };
}

export const useServiceApplicationComments = (applicationId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['service-application-comments', applicationId, user?.id],
    queryFn: async () => {
      if (!user || !applicationId) throw new Error('User must be authenticated and application ID provided');

      // For now, return empty array until the database table types are updated
      // This will be fixed when Supabase types are regenerated after the migration
      return [] as ServiceApplicationComment[];
    },
    enabled: !!user && !!applicationId,
  });
};

export const useCreateServiceApplicationComment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      application_id: string;
      comment_text: string;
      is_internal?: boolean;
    }) => {
      if (!user) throw new Error('User must be authenticated');

      // For now, return a mock result until the database table types are updated
      // This will be fixed when Supabase types are regenerated after the migration
      return {
        id: 'temp-id',
        application_id: data.application_id,
        reviewer_id: user.id,
        comment_text: data.comment_text,
        is_internal: data.is_internal || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    },
    onSuccess: (data) => {
      // For now, just show success message
      // This will be fixed when the table is available
      queryClient.invalidateQueries({
        queryKey: ['service-application-comments', data.application_id]
      });
    },
  });
};