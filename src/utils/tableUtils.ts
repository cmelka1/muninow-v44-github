import { Badge } from "@/components/ui/badge";

export const formatAmount = (amountCents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountCents / 100);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getStatusBadge = (status: string) => {
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'paid' || statusLower === 'completed' || statusLower === 'active' || statusLower === 'online') {
    return { variant: 'default' as const, className: '' };
  }
  
  if (statusLower === 'overdue' || statusLower === 'failed' || statusLower === 'error') {
    return { variant: 'destructive' as const, className: '' };
  }
  
  if (statusLower === 'pending' || statusLower === 'processing' || statusLower === 'maintenance') {
    return { variant: 'secondary' as const, className: '' };
  }
  
  return { variant: 'outline' as const, className: '' };
};

export const getPaymentMethodIcon = (method: string) => {
  const methodLower = method.toLowerCase();
  
  if (methodLower.includes('card') || methodLower.includes('credit') || methodLower.includes('debit')) {
    return 'CreditCard';
  }
  
  if (methodLower.includes('ach') || methodLower.includes('bank')) {
    return 'Landmark';
  }
  
  return 'DollarSign';
};

export const responsiveColumns = {
  mobile: {
    // Show only essential columns on mobile
    essential: "table-cell",
    secondary: "hidden sm:table-cell",
    tertiary: "hidden md:table-cell",
    optional: "hidden lg:table-cell"
  }
} as const;

export const tableStyles = {
  header: "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
  cell: "p-4 align-middle",
  row: "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted h-12",
  container: "overflow-x-auto",
  card: "p-0"
} as const;