import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BillBasedUserInfo {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  street_address: string | null;
  apt_number: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  account_type: string | null;
  business_legal_name: string | null;
  external_customer_name: string | null;
  external_business_name: string | null;
  bill_count: number;
  total_amount_due: number;
}

export const useBillBasedUserInfo = (userId?: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['bill-based-user-info', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('master_bills')
        .select(`
          user_id,
          first_name,
          last_name,
          email,
          street_address,
          apt_number,
          city,
          state,
          zip_code,
          account_type,
          business_legal_name,
          external_customer_name,
          external_business_name,
          amount_due_cents
        `)
        .eq('user_id', userId)
        .eq('customer_id', profile?.customer_id);

      if (error) {
        console.error('Error fetching bill-based user info:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // Aggregate the data from all bills for this user
      const firstBill = data[0];
      const billCount = data.length;
      const totalAmountDue = data.reduce((sum, bill) => sum + (bill.amount_due_cents || 0), 0);

      return {
        user_id: userId,
        first_name: firstBill.first_name,
        last_name: firstBill.last_name,
        email: firstBill.email,
        street_address: firstBill.street_address,
        apt_number: firstBill.apt_number,
        city: firstBill.city,
        state: firstBill.state,
        zip_code: firstBill.zip_code,
        account_type: firstBill.account_type,
        business_legal_name: firstBill.business_legal_name,
        external_customer_name: firstBill.external_customer_name,
        external_business_name: firstBill.external_business_name,
        bill_count: billCount,
        total_amount_due: totalAmountDue
      } as BillBasedUserInfo;
    },
    enabled: !!(userId && profile?.account_type === 'municipal' && profile?.customer_id),
  });
};