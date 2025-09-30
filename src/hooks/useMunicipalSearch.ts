import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface MunicipalSearchFilters {
  accountType?: 'resident' | 'business';
  billStatus?: string;
  merchantId?: string;
  category?: string;
  subcategory?: string;
  dueDateRange?: string;
  amountRange?: string;
}

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

interface UseMunicipalSearchParams extends PaginationParams {
  searchTerm?: string;
  filters?: MunicipalSearchFilters;
}

export interface SearchResult {
  user_id: string;
  profile_id: string;
  account_type: string;
  first_name: string | null;
  last_name: string | null;
  business_legal_name: string | null;
  email: string;
  phone: string | null;
  street_address: string | null;
  apt_number: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  bill_count: number;
  total_amount_due_cents: number;
  last_bill_date: string | null;
  external_customer_name: string | null;
  external_business_name: string | null;
  external_customer_address_line1: string | null;
  external_customer_city: string | null;
  external_customer_state: string | null;
  external_customer_zip_code: string | null;
}

/**
 * Municipal Search Hook
 * 
 * NOTE: This feature was previously based on the master_bills table which has been decommissioned.
 * The search functionality needs to be reimplemented to search users based on:
 * - Profiles table
 * - Permit applications
 * - Business license applications  
 * - Tax submissions
 * 
 * For now, this returns empty results to prevent build errors.
 */
export const useMunicipalSearch = (params?: UseMunicipalSearchParams) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['municipal-search', profile?.customer_id, params],
    queryFn: async () => {
      // Return empty results - feature needs reimplementation
      console.warn('Municipal search feature needs to be reimplemented without bills');
      return { data: [], count: 0 };
    },
    enabled: !!profile?.customer_id && !!profile.account_type && 
             (profile.account_type === 'municipal' || profile.account_type.startsWith('municipal')),
  });
};

export const useMunicipalSearchFilterOptions = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['municipal-search-filter-options', profile?.customer_id],
    queryFn: async () => {
      // Return empty filter options - feature needs reimplementation
      console.warn('Municipal search filter options need to be reimplemented without bills');
      return {
        merchants: [],
        categories: [],
        subcategories: [],
        billStatuses: []
      };
    },
    enabled: !!profile?.customer_id && !!profile.account_type && 
             (profile.account_type === 'municipal' || profile.account_type.startsWith('municipal')),
  });
};
