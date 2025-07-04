import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useMunicipalBills = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['municipal-bills', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('municipal_bills')
        .select('*')
        .eq('user_id', user.id)
        .in('payment_status', ['unpaid', 'overdue', 'delinquent'])
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching municipal bills:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });
};