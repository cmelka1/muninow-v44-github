import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useMunicipalBusinessLicenses, type MunicipalBusinessLicense } from '@/hooks/useMunicipalBusinessLicenses';
import { BusinessLicenseStatusBadge } from '@/components/BusinessLicenseStatusBadge';
import { NewBusinessLicenseDialog } from '@/components/NewBusinessLicenseDialog';
import type { BusinessLicenseFilters } from '@/components/BusinessLicenseFilter';

interface MunicipalBusinessLicenseTableProps {
  filters?: BusinessLicenseFilters;
  onViewClick?: (licenseId: string) => void;
}

export const MunicipalBusinessLicenseTable: React.FC<MunicipalBusinessLicenseTableProps> = ({
  filters,
  onViewClick
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showNewLicenseDialog, setShowNewLicenseDialog] = useState(false);

  const { data, isLoading, error } = useMunicipalBusinessLicenses({
    filters,
    page: currentPage,
    pageSize
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const formatAmount = (cents: number | null) => {
    if (!cents) return '$0.00';
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getLicenseTypeLabel = (businessType: string) => {
    return businessType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (data && currentPage < data.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleRowClick = (license: MunicipalBusinessLicense) => {
    if (onViewClick) {
      onViewClick(license.id);
    } else {
      window.location.href = `/business-licenses/${license.id}`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Business Licenses</CardTitle>
            <Button onClick={() => setShowNewLicenseDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New License
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error loading business licenses: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.licenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Business Licenses</CardTitle>
            <Button onClick={() => setShowNewLicenseDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New License
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No business licenses found</p>
            <Button onClick={() => setShowNewLicenseDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New License
            </Button>
          </div>
        </CardContent>
        <NewBusinessLicenseDialog
          open={showNewLicenseDialog}
          onOpenChange={setShowNewLicenseDialog}
        />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Business Licenses ({data.totalCount})</CardTitle>
            <Button onClick={() => setShowNewLicenseDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New License
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Date Applied</TableHead>
                  <TableHead className="font-semibold">License #</TableHead>
                  <TableHead className="font-semibold">Business Name</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Type</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Fee</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.licenses.map((license) => (
                  <TableRow 
                    key={license.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(license)}
                  >
                    <TableCell className="font-medium">
                      {formatDate(license.created_at)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {license.license_number || (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium max-w-[200px] truncate">
                          {license.business_legal_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {license.owner_first_name} {license.owner_last_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {getLicenseTypeLabel(license.business_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-medium">
                      {formatAmount(license.total_amount_cents)}
                    </TableCell>
                    <TableCell>
                      <BusinessLicenseStatusBadge status={license.application_status} />
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
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
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
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= data.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <NewBusinessLicenseDialog
        open={showNewLicenseDialog}
        onOpenChange={setShowNewLicenseDialog}
      />
    </>
  );
};