import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export const useMunicipalBills = (params?: PaginationParams) => {
  const { user } = useAuth();
  const { page = 1, pageSize = 5 } = params || {};

  return useQuery({
    queryKey: ['municipal-bills', user?.id, page, pageSize],
    queryFn: async () => {
      if (!user?.id) return { data: [], count: 0 };

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('municipal_bills')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .in('payment_status', ['unpaid', 'overdue', 'delinquent'])
        .order('due_date', { ascending: true })
        .range(from, to);

      if (error) {
        console.error('Error fetching municipal bills:', error);
        throw error;
      }

      return { data: data || [], count: count || 0 };
    },
    enabled: !!user?.id,
  });
};