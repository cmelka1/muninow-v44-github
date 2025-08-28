import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useTaxSubmissionDetail = (submissionId: string | null) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['tax-submission-detail', submissionId],
    queryFn: async () => {
      if (!submissionId || !profile) {
        return null;
      }

      // Municipal users can view submissions for their customer
      if (profile.account_type === 'municipal' && profile.customer_id) {
        const { data, error } = await supabase
          .from('tax_submissions')
          .select('*')
          .eq('id', submissionId)
          .eq('customer_id', profile.customer_id)
          .single();

        if (error) {
          console.error('Error fetching tax submission detail:', error);
          throw error;
        }

        return data;
      }

      // Regular users can view their own submissions
      const { data, error } = await supabase
        .from('tax_submissions')
        .select('*')
        .eq('id', submissionId)
        .eq('user_id', profile.id)
        .single();

      if (error) {
        console.error('Error fetching tax submission detail:', error);
        throw error;
      }

      return data;
    },
    enabled: !!submissionId && !!profile,
  });
};