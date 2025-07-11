import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useBill = (billId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['master-bill', billId],
    queryFn: async () => {
      if (!user?.id || !billId) return null;

      const { data, error } = await supabase
        .from('master_bills')
        .select('*')
        .eq('bill_id', billId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching bill:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id && !!billId,
  });
};