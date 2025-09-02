import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useMerchantOptions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['payment-history-merchant-options', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('payment_history')
        .select('merchant_name')
        .eq('user_id', user.id)
        .not('merchant_name', 'is', null);

      if (error) {
        console.error('Error fetching merchant options:', error);
        throw error;
      }

      // Get unique merchants
      const uniqueMerchants = [...new Set(data.map(payment => payment.merchant_name))];
      return uniqueMerchants.sort();
    },
    enabled: !!user?.id,
  });
};

export const useCategoryOptions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['payment-history-category-options', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('payment_history')
        .select('category')
        .eq('user_id', user.id)
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching category options:', error);
        throw error;
      }

      // Get unique categories
      const uniqueCategories = [...new Set(data.map(payment => payment.category))];
      return uniqueCategories.sort();
    },
    enabled: !!user?.id,
  });
};

export const usePaymentMethodOptions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['payment-history-payment-method-options', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('payment_history')
        .select('payment_type, card_brand')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching payment method options:', error);
        throw error;
      }

      // Get unique payment methods
      const paymentMethods = new Set<string>();
      
      data.forEach(payment => {
        if (payment.payment_type === 'GOOGLE_PAY') {
          paymentMethods.add('Google Pay');
        } else if (payment.payment_type === 'APPLE_PAY') {
          paymentMethods.add('Apple Pay');
        } else if (payment.payment_type === 'BANK_ACCOUNT') {
          paymentMethods.add('Bank Account');
        } else if (payment.payment_type === 'PAYMENT_CARD' || payment.card_brand) {
          paymentMethods.add('Card');
        }
      });

      return Array.from(paymentMethods).sort();
    },
    enabled: !!user?.id,
  });
};