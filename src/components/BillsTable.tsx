import React, { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { formatAmount, getStatusBadge, responsiveColumns, tableStyles } from '@/utils/tableUtils';
import ResponsiveContainer from '@/components/ui/responsive-container';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBills } from '@/hooks/useBills';

interface BillFilters {
  vendor?: string;
  category?: string;
  paymentStatus?: string;
  dueDateRange?: string;
  amountRange?: string;
}

interface BillsTableProps {
  filters?: BillFilters;
  onPayClick?: (billId: string) => void;
}

const BillsTable: React.FC<BillsTableProps> = ({ filters = {}, onPayClick }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  const { data: billsData, isLoading, error } = useBills({ 
    page: currentPage, 
    pageSize,
    filters
  });

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const bills = billsData?.data || [];
  const totalCount = billsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getLocalStatusBadge = (status: string) => {
    const statusBadge = getStatusBadge(status);
    switch (status) {
      case 'unpaid':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Unpaid</Badge>;
      case 'overdue':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Overdue</Badge>;
      case 'delinquent':
        return <Badge variant="destructive">Delinquent</Badge>;
      default:
        return <Badge variant={statusBadge.variant}>{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleRowClick = (billId: string) => {
    navigate(`/bill/${billId}`);
  };

  const handlePayClick = (e: React.MouseEvent, billId: string) => {
    e.stopPropagation(); // Prevent row click navigation
    onPayClick?.(billId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Bills</CardTitle>
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading bills. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  if (!bills || bills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No outstanding bills found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outstanding Bills</CardTitle>
      </CardHeader>
      <CardContent className={tableStyles.card}>
        <ResponsiveContainer variant="card" maxWidth="full">
          <div className={tableStyles.container}>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className={`${responsiveColumns.mobile.secondary} text-center`}>Due Date</TableHead>
                  <TableHead className="text-left">Merchant</TableHead>
                  <TableHead className={`${responsiveColumns.mobile.tertiary} text-center`}>Category</TableHead>
                  <TableHead className={`${responsiveColumns.mobile.optional} text-center`}>Status</TableHead>
                  <TableHead className="text-center">Amount</TableHead>
                  <TableHead className="w-[120px] text-center">Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow 
                    key={bill.bill_id} 
                    className={`${tableStyles.row} cursor-pointer`}
                    onClick={() => handleRowClick(bill.bill_id)}
                  >
                    <TableCell className={`${responsiveColumns.mobile.secondary} text-center`}>
                      <span className="truncate">{formatDate(bill.due_date)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="truncate block max-w-[200px]" title={bill.merchant_name}>
                        {bill.merchant_name}
                      </span>
                    </TableCell>
                    <TableCell className={`${responsiveColumns.mobile.tertiary} text-center`}>
                      <span className="truncate block max-w-[150px]" title={bill.category}>
                        {bill.category}
                      </span>
                    </TableCell>
                    <TableCell className={`${responsiveColumns.mobile.optional} text-center`}>
                      {getLocalStatusBadge(bill.payment_status || 'unpaid')}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {formatAmount(Number(bill.amount_due_cents))}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        size="sm" 
                        className="w-full h-8"
                        onClick={(e) => handlePayClick(e, bill.bill_id)}
                      >
                        Pay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ResponsiveContainer>
        
        {/* Pagination Controls */}
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
              {currentPage}
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
      </CardContent>
    </Card>
  );
};

export default BillsTable;