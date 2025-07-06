import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

interface UseCustomerPaymentMethodsParams extends PaginationParams {
  customerId: string;
}

export const useCustomerPaymentMethods = (params: UseCustomerPaymentMethodsParams) => {
  const { customerId, page = 1, pageSize = 10 } = params;

  return useQuery({
    queryKey: ['customer-payment-methods', customerId, page, pageSize],
    queryFn: async () => {
      console.log('🔍 Fetching payment methods for customer ID:', customerId);
      
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('customer_payment_method')
        .select('*', { count: 'exact' })
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .range(from, to);

      console.log('📥 Payment methods result:', { data, error: error?.message, count });

      if (error) {
        console.error('❌ Error fetching payment methods:', error);
        throw error;
      }

      return { data: data || [], count: count || 0 };
    },
    enabled: !!customerId,
  });
};