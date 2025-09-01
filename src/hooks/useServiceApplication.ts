import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ServiceApplicationWithTile {
  id: string;
  user_id: string;
  tile_id: string;
  customer_id: string;
  merchant_id?: string;
  form_data: any;
  status: string;
  payment_id?: string;
  payment_status?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
  tile: {
    id: string;
    title: string;
    description?: string;
    amount_cents: number;
    form_fields: any[];
    requires_review: boolean;
    requires_payment: boolean;
    customer_id: string;
    is_active: boolean;
  };
  customer: {
    legal_entity_name: string;
    doing_business_as: string;
    business_city: string;
    business_state: string;
  };
}

export const useServiceApplication = (applicationId: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['service-application', applicationId],
    queryFn: async () => {
      if (!applicationId) return null;

      const { data, error } = await supabase
        .from('municipal_service_applications')
        .select(`
          *,
          tile:municipal_service_tiles!inner(
            id,
            title,
            description,
            amount_cents,
            form_fields,
            requires_review,
            requires_payment,
            customer_id,
            is_active
          ),
          customer:customers!inner(
            legal_entity_name,
            doing_business_as,
            business_city,
            business_state
          )
        `)
        .eq('id', applicationId)
        .single();

      if (error) {
        console.error('Error fetching service application:', error);
        throw error;
      }

      return data as unknown as ServiceApplicationWithTile;
    },
    enabled: !!applicationId,
  });
};