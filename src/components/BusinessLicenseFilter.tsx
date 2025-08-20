import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface BusinessLicenseFilters {
  licenseType?: string;
  status?: string;
  dateRange?: string;
  feeRange?: string;
  category?: string;
}

interface BusinessLicenseFilterProps {
  filters: BusinessLicenseFilters;
  onFiltersChange: (filters: BusinessLicenseFilters) => void;
}

const BusinessLicenseFilter: React.FC<BusinessLicenseFilterProps> = ({
  filters,
  onFiltersChange
}) => {
  const updateFilter = (key: keyof BusinessLicenseFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Status Filter */}
          <div className="min-w-[200px]">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => updateFilter('status', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="min-w-[200px]">
            <Label htmlFor="dateRange" className="text-sm font-medium">
              Date Range
            </Label>
            <Select
              value={filters.dateRange || ''}
              onValueChange={(value) => updateFilter('dateRange', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All time</SelectItem>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                <SelectItem value="last_3_months">Last 3 months</SelectItem>
                <SelectItem value="last_6_months">Last 6 months</SelectItem>
                <SelectItem value="last_year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* License Type Filter - Hidden on mobile */}
          <div className="min-w-[200px] hidden sm:block">
            <Label htmlFor="licenseType" className="text-sm font-medium">
              License Type
            </Label>
            <Select
              value={filters.licenseType || ''}
              onValueChange={(value) => updateFilter('licenseType', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="business_license">Business License</SelectItem>
                <SelectItem value="food_service">Food Service</SelectItem>
                <SelectItem value="liquor_license">Liquor License</SelectItem>
                <SelectItem value="retail_license">Retail License</SelectItem>
                <SelectItem value="professional_service">Professional Service</SelectItem>
                <SelectItem value="home_occupation">Home Occupation</SelectItem>
                <SelectItem value="special_event">Special Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Business Category Filter - Hidden on mobile */}
          <div className="min-w-[200px] hidden md:block">
            <Label htmlFor="category" className="text-sm font-medium">
              Business Category
            </Label>
            <Select
              value={filters.category || ''}
              onValueChange={(value) => updateFilter('category', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="retail">Retail Store</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="automotive">Automotive</SelectItem>
                <SelectItem value="personal_service">Personal Service</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fee Range Filter - Hidden on mobile */}
          <div className="min-w-[200px] hidden lg:block">
            <Label htmlFor="feeRange" className="text-sm font-medium">
              License Fee
            </Label>
            <Select
              value={filters.feeRange || ''}
              onValueChange={(value) => updateFilter('feeRange', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All fees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All fees</SelectItem>
                <SelectItem value="0-50">$0 - $50</SelectItem>
                <SelectItem value="51-100">$51 - $100</SelectItem>
                <SelectItem value="101-250">$101 - $250</SelectItem>
                <SelectItem value="251-500">$251 - $500</SelectItem>
                <SelectItem value="500+">$500+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessLicenseFilter;