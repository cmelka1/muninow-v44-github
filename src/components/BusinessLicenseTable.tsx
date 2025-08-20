import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { BusinessLicenseFilters } from '@/components/BusinessLicenseFilter';
import { useBusinessLicenses } from '@/hooks/useBusinessLicenses';
import NewBusinessLicenseDialog from '@/components/NewBusinessLicenseDialog';

interface BusinessLicenseTableProps {
  filters?: BusinessLicenseFilters;
  onViewClick?: (licenseId: string) => void;
}

const BusinessLicenseTable: React.FC<BusinessLicenseTableProps> = ({ filters, onViewClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isNewLicenseDialogOpen, setIsNewLicenseDialogOpen] = useState(false);

  const { data, isLoading, error } = useBusinessLicenses({
    filters,
    page: currentPage,
    pageSize
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { label: 'Draft', variant: 'secondary' as const },
      'submitted': { label: 'Submitted', variant: 'default' as const },
      'under_review': { label: 'Under Review', variant: 'default' as const },
      'approved': { label: 'Approved', variant: 'default' as const },
      'active': { label: 'Active', variant: 'default' as const },
      'expired': { label: 'Expired', variant: 'destructive' as const },
      'suspended': { label: 'Suspended', variant: 'destructive' as const },
      'denied': { label: 'Denied', variant: 'destructive' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { 
      label: status, 
      variant: 'secondary' as const 
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getLicenseTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatAmount = (amountCents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amountCents / 100);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (data && currentPage < data.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleRowClick = (licenseId: string) => {
    if (onViewClick) {
      onViewClick(licenseId);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error loading business licenses. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Business Licenses</CardTitle>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.licenses?.length) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Business Licenses</CardTitle>
            <Button 
              onClick={() => setIsNewLicenseDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New License Application
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No business licenses found</h3>
              <p className="text-gray-500">
                Get started by applying for your first business license.
              </p>
            </div>
            <Button 
              onClick={() => setIsNewLicenseDialogOpen(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Apply for License
            </Button>
          </div>
        </CardContent>
        <NewBusinessLicenseDialog
          open={isNewLicenseDialogOpen}
          onOpenChange={setIsNewLicenseDialogOpen}
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Business Licenses</CardTitle>
          <Button 
            onClick={() => setIsNewLicenseDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New License Application
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Applied</TableHead>
                <TableHead>License Number</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead className="hidden md:table-cell">Business Address</TableHead>
                <TableHead className="hidden sm:table-cell">License Type</TableHead>
                <TableHead className="hidden lg:table-cell">License Fee</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.licenses.map((license) => (
                <TableRow 
                  key={license.license_id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(license.license_id)}
                >
                  <TableCell>
                    {formatDate(license.submitted_at)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {license.license_number}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{license.business_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {license.applicant_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">
                      {license.business_address}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {getLicenseTypeLabel(license.license_type)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatAmount(license.license_fee_cents)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(license.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Page {currentPage} of {data.totalPages} ({data.totalCount} total)
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === data.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <NewBusinessLicenseDialog
        open={isNewLicenseDialogOpen}
        onOpenChange={setIsNewLicenseDialogOpen}
      />
    </Card>
  );
};

export default BusinessLicenseTable;