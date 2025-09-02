import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Download, Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { ApplicationDetailModal } from '@/components/municipal/ApplicationDetailModal';
import { ServiceApplication } from '@/hooks/useServiceApplications';
import { MunicipalServiceTile } from '@/hooks/useMunicipalServiceTiles';
import { format } from 'date-fns';

interface ApplicationHistoryTableProps {
  applications: ServiceApplication[];
  serviceTiles: MunicipalServiceTile[];
  isLoading: boolean;
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function ApplicationHistoryTable({ 
  applications, 
  serviceTiles, 
  isLoading, 
  totalCount = 0,
  totalPages = 0,
  currentPage = 1,
  onPageChange,
  onPageSizeChange 
}: ApplicationHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(5);
  const [selectedApplication, setSelectedApplication] = useState<ServiceApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' },
    { value: 'paid', label: 'Paid' },
  ];

  // Reset to first page when filters change
  useEffect(() => {
    if (onPageChange) {
      onPageChange(1);
    }
  }, [searchTerm, statusFilter, onPageChange]);

  const filteredApplications = applications.filter(app => {
    const tile = serviceTiles.find(t => t.id === app.tile_id);
    const matchesSearch = 
      (tile?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.applicant_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'submitted':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'under_review':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Under Review</Badge>;
      case 'information_requested':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Info Requested</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      case 'paid':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Paid</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Completed</Badge>;
      case 'withdrawn':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Withdrawn</Badge>;
      case 'expired':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="outline">{status.replace('_', ' ').toUpperCase()}</Badge>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'paid':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Refunded</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{paymentStatus.replace('_', ' ').toUpperCase()}</Badge>;
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number(newPageSize);
    setPageSize(size);
    if (onPageSizeChange) {
      onPageSizeChange(size);
    }
  };

  const handlePreviousPage = () => {
    if (onPageChange && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (onPageChange && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleRowClick = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (application) {
      const tile = serviceTiles.find(t => t.id === application.tile_id);
      if (tile?.requires_review) {
        window.location.href = `/municipal/service-application/${application.id}`;
      } else {
        setSelectedApplication(application);
        setIsDetailModalOpen(true);
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Service Applications ({totalCount})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(pageSize)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Service Applications ({totalCount})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          {/* Integrated Filters */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by service, ID, or applicant name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'No applications match your filters.' 
                : 'No applications submitted yet.'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead className="hidden md:table-cell">Application #</TableHead>
                    <TableHead className="hidden lg:table-cell">Service</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead className="hidden lg:table-cell text-center">Status</TableHead>
                    <TableHead className="hidden xl:table-cell text-center">Payment Status</TableHead>
                    <TableHead className="hidden 2xl:table-cell text-center">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => {
                    const tile = serviceTiles.find(t => t.id === application.tile_id);
                    const applicantName = application.applicant_name || 'Unknown User';
                    
                    return (
                      <TableRow 
                        key={application.id}
                        className="h-12 cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(application.id)}
                      >
                        <TableCell className="hidden sm:table-cell py-2">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(application.created_at)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-2">
                          <span className="truncate font-mono text-sm">
                            {application.application_number || application.id.slice(0, 8)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell py-2">
                          <span className="truncate block max-w-[150px] text-sm" title={tile?.title || 'Unknown Service'}>
                            {tile?.title || 'Unknown Service'}
                          </span>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="truncate block max-w-[150px] font-medium" title={applicantName}>
                            {applicantName}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell py-2 text-center">
                          {getStatusBadge(application.status)}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell py-2 text-center">
                          {getPaymentStatusBadge(application.payment_status || 'pending')}
                        </TableCell>
                        <TableCell className="hidden 2xl:table-cell py-2 text-center">
                          <span className="text-sm font-medium">
                            {tile ? (tile.allow_user_defined_amount ? 'Varies' : formatCurrency(tile.amount_cents)) : 'N/A'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Show:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 px-3"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <span className="text-sm font-medium px-2">
                  {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <ApplicationDetailModal
              application={selectedApplication}
              serviceTile={serviceTiles.find(t => t.id === selectedApplication.tile_id)}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedApplication(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}