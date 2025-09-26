import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TaxSubmissionComment {
  id: string;
  submission_id: string;
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

export const useTaxSubmissionComments = (submissionId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tax-submission-comments', submissionId, user?.id],
    queryFn: async () => {
      if (!user || !submissionId) throw new Error('User must be authenticated and submission ID provided');

      const { data, error } = await supabase
        .from('tax_submission_comments')
        .select('*')
        .eq('submission_id', submissionId)
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

      return commentsWithReviewers as TaxSubmissionComment[];
    },
    enabled: !!user && !!submissionId,
  });
};

export const useCreateTaxSubmissionComment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      submission_id: string;
      comment_text: string;
      is_internal?: boolean;
    }) => {
      if (!user) throw new Error('User must be authenticated');

      const { data: result, error } = await supabase
        .from('tax_submission_comments')
        .insert({
          submission_id: data.submission_id,
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
        queryKey: ['tax-submission-comments', data.submission_id]
      });
    },
  });
};