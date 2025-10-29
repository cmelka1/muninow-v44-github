import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { toast } from 'sonner';

export interface BusinessLicenseType {
  id: string;
  customer_id: string;
  name: string;
  description: string | null;
  base_fee_cents: number;
  processing_days: number;
  merchant_id: string | null;
  merchant_name: string | null;
  is_custom: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBusinessLicenseTypes = (customerId?: string) => {
  return useQuery({
    queryKey: ['business-license-types', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from('business_license_types_v2')
        .select('*')
        .eq('customer_id', customerId)
        .eq('is_active', true)
        .order('display_order')
        .order('name');

      if (error) {
        console.error('Error fetching business license types:', error);
        throw error;
      }

      // Sort with "Other" always last
      const sortedData = (data as BusinessLicenseType[])?.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        
        if (nameA === 'other') return 1;
        if (nameB === 'other') return -1;
        
        return a.name.localeCompare(b.name);
      });

      return sortedData || [];
    },
    enabled: !!customerId,
  });
};

export const useCreateBusinessLicenseType = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (licenseType: Partial<BusinessLicenseType>) => {
      if (!profile?.customer_id) {
        throw new Error('Customer ID is required');
      }

      const { data, error } = await supabase
        .from('business_license_types_v2')
        .insert({
          customer_id: profile.customer_id,
          name: licenseType.name,
          description: licenseType.description,
          base_fee_cents: licenseType.base_fee_cents || 0,
          processing_days: licenseType.processing_days || 7,
          merchant_id: licenseType.merchant_id,
          merchant_name: licenseType.merchant_name,
          is_custom: licenseType.is_custom ?? true,
          display_order: licenseType.display_order || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-license-types'] });
      toast.success('Business license type created successfully');
    },
    onError: (error) => {
      console.error('Error creating business license type:', error);
      toast.error('Failed to create business license type');
    },
  });
};

export const useUpdateBusinessLicenseType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BusinessLicenseType> }) => {
      const { data, error } = await supabase
        .from('business_license_types_v2')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-license-types'] });
      toast.success('Business license type updated successfully');
    },
    onError: (error) => {
      console.error('Error updating business license type:', error);
      toast.error('Failed to update business license type');
    },
  });
};

export const useDeleteBusinessLicenseType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('business_license_types_v2')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-license-types'] });
      toast.success('Business license type deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting business license type:', error);
      toast.error('Failed to delete business license type');
    },
  });
};
