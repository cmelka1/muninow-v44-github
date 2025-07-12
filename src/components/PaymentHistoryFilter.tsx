import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useMerchantOptions, useCategoryOptions, usePaymentMethodOptions } from '@/hooks/usePaymentHistoryFilterOptions';

export interface PaymentHistoryFilters {
  merchant?: string;
  category?: string;
  paymentMethod?: string;
  paymentDateRange?: string;
  amountRange?: string;
}

interface PaymentHistoryFilterProps {
  filters: PaymentHistoryFilters;
  onFiltersChange: (filters: PaymentHistoryFilters) => void;
}

const PaymentHistoryFilter: React.FC<PaymentHistoryFilterProps> = ({ filters, onFiltersChange }) => {
  const { data: merchantOptions = [], isLoading: merchantsLoading } = useMerchantOptions();
  const { data: categoryOptions = [], isLoading: categoriesLoading } = useCategoryOptions();
  const { data: paymentMethodOptions = [], isLoading: paymentMethodsLoading } = usePaymentMethodOptions();

  const paymentDateOptions = [
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'last_90_days', label: 'Last 90 days' },
    { value: 'all_time', label: 'All time' },
  ];

  const amountOptions = [
    { value: '0-100', label: '$0 - $100' },
    { value: '101-500', label: '$101 - $500' },
    { value: '501-1000', label: '$501 - $1,000' },
    { value: '1000+', label: '$1,000+' },
  ];

  const updateFilter = (key: keyof PaymentHistoryFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== undefined);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Filter Payment History</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Payment Date - Always visible (Priority 1) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
            <Select value={filters.paymentDateRange || 'all'} onValueChange={(value) => updateFilter('paymentDateRange', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Payment Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                {paymentDateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount - Always visible (Priority 1) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Amount</label>
            <Select value={filters.amountRange || 'all'} onValueChange={(value) => updateFilter('amountRange', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Amounts</SelectItem>
                {amountOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Merchant - Hidden on mobile (Priority 2) */}
          <div className="hidden sm:block space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Merchant</label>
            <Select value={filters.merchant || 'all'} onValueChange={(value) => updateFilter('merchant', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Merchant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Merchants</SelectItem>
                {merchantsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  merchantOptions.map((merchant) => (
                    <SelectItem key={merchant} value={merchant}>
                      {merchant}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Category - Hidden on tablet (Priority 3) */}
          <div className="hidden md:block space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <Select value={filters.category || 'all'} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method - Hidden on tablet (Priority 3) */}
          <div className="hidden md:block space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
            <Select value={filters.paymentMethod || 'all'} onValueChange={(value) => updateFilter('paymentMethod', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {paymentMethodsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  paymentMethodOptions.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentHistoryFilter;