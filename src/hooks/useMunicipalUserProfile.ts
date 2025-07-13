import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MunicipalUserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  street_address: string | null;
  apt_number: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  account_type: string;
  business_legal_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useMunicipalUserProfile = (userId?: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['municipal-user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase.rpc('get_user_profile_for_municipal', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching municipal user profile:', error);
        throw error;
      }

      // The function returns an array, take the first result
      return data && data.length > 0 ? data[0] as MunicipalUserProfile : null;
    },
    enabled: !!(userId && profile?.account_type === 'municipal'),
  });
};