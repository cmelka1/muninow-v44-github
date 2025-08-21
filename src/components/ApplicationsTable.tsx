import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, FileText, Building, DollarSign, Settings } from 'lucide-react';
import { useUserApplications, UserApplication } from '@/hooks/useUserApplications';
import { ApplicationFilters } from './ApplicationsFilter';
import { format } from 'date-fns';

interface ApplicationsTableProps {
  filters: ApplicationFilters;
  title?: string;
  headerActions?: React.ReactNode;
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({ 
  filters, 
  title = "My Applications & Services",
  headerActions 
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data, isLoading, error } = useUserApplications({
    filters,
    page: currentPage,
    pageSize,
  });

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

  const handleRowClick = (application: UserApplication) => {
    navigate(application.detailPath);
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'permit':
        return <Building className="h-4 w-4" />;
      case 'license':
        return <FileText className="h-4 w-4" />;
      case 'tax':
        return <DollarSign className="h-4 w-4" />;
      case 'service':
        return <Settings className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getServiceTypeLabel = (serviceType: string) => {
    switch (serviceType) {
      case 'permit':
        return 'Permit';
      case 'license':
        return 'License';
      case 'tax':
        return 'Tax';
      case 'service':
        return 'Service';
      default:
        return 'Unknown';
    }
  };

  const getStatusBadge = (status: string, serviceType: string) => {
    const normalizedStatus = status.toLowerCase();
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
    
    switch (normalizedStatus) {
      case 'approved':
      case 'issued':
      case 'paid':
        variant = "default";
        break;
      case 'denied':
        variant = "destructive";
        break;
      case 'under_review':
      case 'submitted':
        variant = "secondary";
        break;
      case 'draft':
        variant = "outline";
        break;
    }

    return (
      <Badge variant={variant}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Error loading applications. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            {headerActions}
          </div>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            No applications found. Start by applying for permits, licenses, or other services.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {headerActions}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Type</TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Municipality</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.applications.map((application) => (
                <TableRow
                  key={application.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(application)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getServiceTypeIcon(application.serviceType)}
                      <span className="font-medium">
                        {getServiceTypeLabel(application.serviceType)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {application.serviceName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(application.dateSubmitted)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {application.address}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {application.municipality}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(application.status, application.serviceType)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Page {data.currentPage} of {data.totalPages} ({data.count} total)
            </span>
            <div className="flex items-center space-x-1">
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
  );
};

export default ApplicationsTable;