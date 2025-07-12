import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentHistoryFilters } from '@/components/PaymentHistoryFilter';

interface PaginationParams {
  page?: number;
  pageSize?: number;
  filters?: PaymentHistoryFilters;
}

export const usePaymentHistory = (params?: PaginationParams) => {
  const { user } = useAuth();
  const { page = 1, pageSize = 5, filters = {} } = params || {};

  return useQuery({
    queryKey: ['payment-history', user?.id, page, pageSize, filters],
    queryFn: async () => {
      if (!user?.id) return { data: [], count: 0 };

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('payment_history')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      // Apply filters
      if (filters.merchant) {
        query = query.eq('merchant_name', filters.merchant);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.paymentMethod) {
        if (filters.paymentMethod === 'Google Pay' || filters.paymentMethod === 'Apple Pay') {
          query = query.eq('payment_type', filters.paymentMethod);
        } else if (filters.paymentMethod === 'Bank Account') {
          query = query.eq('payment_type', 'Bank Account');
        } else if (filters.paymentMethod === 'Card') {
          query = query.eq('payment_type', 'Card');
        }
      }

      if (filters.paymentDateRange) {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.paymentDateRange) {
          case 'last_7_days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'last_30_days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'last_90_days':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0); // No date filter
        }
        
        if (filters.paymentDateRange !== 'all_time') {
          query = query.gte('created_at', startDate.toISOString());
        }
      }

      if (filters.amountRange) {
        switch (filters.amountRange) {
          case '0-100':
            query = query.gte('total_amount_cents', 0).lte('total_amount_cents', 10000);
            break;
          case '101-500':
            query = query.gte('total_amount_cents', 10100).lte('total_amount_cents', 50000);
            break;
          case '501-1000':
            query = query.gte('total_amount_cents', 50100).lte('total_amount_cents', 100000);
            break;
          case '1000+':
            query = query.gte('total_amount_cents', 100001);
            break;
        }
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching payment history:', error);
        throw error;
      }

      return { data: data || [], count: count || 0 };
    },
    enabled: !!user?.id,
  });
};