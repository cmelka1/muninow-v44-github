import { useQuery } from '@tanstack/react-query';
import { BusinessLicenseFilters } from '@/components/BusinessLicenseFilter';

export interface BusinessLicense {
  license_id: string;
  license_number: string;
  license_type: string;
  business_name: string;
  business_address: string;
  applicant_name: string;
  status: string;
  license_fee_cents: number;
  expiration_date?: string;
  issued_date?: string;
  submitted_at: string;
  created_at: string;
  business_category: string;
}

interface UseBusinessLicensesParams {
  filters?: BusinessLicenseFilters;
  page?: number;
  pageSize?: number;
}

// Mock data for business licenses
const mockBusinessLicenses: BusinessLicense[] = [
  {
    license_id: '1',
    license_number: 'BL-2024-001',
    license_type: 'Business License',
    business_name: 'Main Street Coffee Shop',
    business_address: '123 Main St, Springfield, IL 62701',
    applicant_name: 'John Smith',
    status: 'active',
    license_fee_cents: 15000, // $150.00
    expiration_date: '2024-12-31',
    issued_date: '2024-01-15',
    submitted_at: '2024-01-10T09:00:00Z',
    created_at: '2024-01-10T09:00:00Z',
    business_category: 'restaurant'
  },
  {
    license_id: '2',
    license_number: 'BL-2024-002',
    license_type: 'Food Service',
    business_name: 'Fresh Bites Deli',
    business_address: '456 Oak Ave, Springfield, IL 62702',
    applicant_name: 'Sarah Johnson',
    status: 'under_review',
    license_fee_cents: 20000, // $200.00
    submitted_at: '2024-01-20T14:30:00Z',
    created_at: '2024-01-20T14:30:00Z',
    business_category: 'restaurant'
  },
  {
    license_id: '3',
    license_number: 'BL-2024-003',
    license_type: 'Retail License',
    business_name: 'Springfield Boutique',
    business_address: '789 Elm St, Springfield, IL 62703',
    applicant_name: 'Michael Brown',
    status: 'active',
    license_fee_cents: 12500, // $125.00
    expiration_date: '2024-11-30',
    issued_date: '2024-02-01',
    submitted_at: '2024-01-25T11:15:00Z',
    created_at: '2024-01-25T11:15:00Z',
    business_category: 'retail'
  },
  {
    license_id: '4',
    license_number: 'BL-2024-004',
    license_type: 'Professional Service',
    business_name: 'Springfield Legal Services',
    business_address: '321 Court St, Springfield, IL 62704',
    applicant_name: 'Jennifer Davis',
    status: 'expired',
    license_fee_cents: 30000, // $300.00
    expiration_date: '2023-12-31',
    issued_date: '2023-01-15',
    submitted_at: '2023-01-10T10:00:00Z',
    created_at: '2023-01-10T10:00:00Z',
    business_category: 'office'
  },
  {
    license_id: '5',
    license_number: 'BL-2024-005',
    license_type: 'Liquor License',
    business_name: 'The Corner Pub',
    business_address: '654 Pine St, Springfield, IL 62705',
    applicant_name: 'Robert Wilson',
    status: 'submitted',
    license_fee_cents: 50000, // $500.00
    submitted_at: '2024-02-05T16:45:00Z',
    created_at: '2024-02-05T16:45:00Z',
    business_category: 'entertainment'
  },
  {
    license_id: '6',
    license_number: 'BL-2024-006',
    license_type: 'Home Occupation',
    business_name: 'Creative Design Studio',
    business_address: '987 Maple Ave, Springfield, IL 62706',
    applicant_name: 'Lisa Anderson',
    status: 'active',
    license_fee_cents: 7500, // $75.00
    expiration_date: '2024-12-31',
    issued_date: '2024-02-15',
    submitted_at: '2024-02-10T08:30:00Z',
    created_at: '2024-02-10T08:30:00Z',
    business_category: 'personal_service'
  }
];

export const useBusinessLicenses = ({ filters = {}, page = 1, pageSize = 10 }: UseBusinessLicensesParams = {}) => {
  return useQuery({
    queryKey: ['business-licenses', filters, page, pageSize],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredLicenses = [...mockBusinessLicenses];

      // Apply filters
      if (filters.status) {
        filteredLicenses = filteredLicenses.filter(license => license.status === filters.status);
      }

      if (filters.licenseType) {
        filteredLicenses = filteredLicenses.filter(license => 
          license.license_type.toLowerCase().replace(/\s+/g, '_') === filters.licenseType
        );
      }

      if (filters.category) {
        filteredLicenses = filteredLicenses.filter(license => license.business_category === filters.category);
      }

      if (filters.dateRange) {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.dateRange) {
          case 'last_30_days':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'last_3_months':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case 'last_6_months':
            startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            break;
          case 'last_year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        if (filters.dateRange !== 'all_time') {
          filteredLicenses = filteredLicenses.filter(license => 
            new Date(license.created_at) >= startDate
          );
        }
      }

      if (filters.feeRange) {
        switch (filters.feeRange) {
          case '0-50':
            filteredLicenses = filteredLicenses.filter(license => license.license_fee_cents <= 5000);
            break;
          case '51-100':
            filteredLicenses = filteredLicenses.filter(license => 
              license.license_fee_cents > 5000 && license.license_fee_cents <= 10000
            );
            break;
          case '101-250':
            filteredLicenses = filteredLicenses.filter(license => 
              license.license_fee_cents > 10000 && license.license_fee_cents <= 25000
            );
            break;
          case '251-500':
            filteredLicenses = filteredLicenses.filter(license => 
              license.license_fee_cents > 25000 && license.license_fee_cents <= 50000
            );
            break;
          case '500+':
            filteredLicenses = filteredLicenses.filter(license => license.license_fee_cents > 50000);
            break;
        }
      }

      // Apply pagination
      const totalCount = filteredLicenses.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedLicenses = filteredLicenses.slice(startIndex, endIndex);

      return {
        licenses: paginatedLicenses,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: page,
        pageSize
      };
    }
  });
};