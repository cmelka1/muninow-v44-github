import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BusinessLicenseComment {
  id: string;
  license_id: string;
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

export const useBusinessLicenseComments = (licenseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['business-license-comments', licenseId, user?.id],
    queryFn: async () => {
      if (!user || !licenseId) throw new Error('User must be authenticated and license ID provided');

      const { data, error } = await supabase
        .from('business_license_comments')
        .select('*')
        .eq('license_id', licenseId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch reviewer details for each comment
      const commentsWithReviewers = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: reviewerData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, account_type')
            .eq('id', comment.reviewer_id)
            .single();

          return {
            ...comment,
            reviewer: reviewerData || {
              first_name: 'Unknown',
              last_name: 'User',
              email: '',
              account_type: 'unknown'
            }
          };
        })
      );

      return commentsWithReviewers as BusinessLicenseComment[];
    },
    enabled: !!user && !!licenseId,
  });
};

export const useCreateBusinessLicenseComment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      license_id: string;
      comment_text: string;
      is_internal?: boolean;
    }) => {
      if (!user) throw new Error('User must be authenticated');

      const { data: result, error } = await supabase
        .from('business_license_comments')
        .insert({
          license_id: data.license_id,
          reviewer_id: user.id,
          comment_text: data.comment_text,
          is_internal: data.is_internal || false,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['business-license-comments', data.license_id]
      });
    },
  });
};