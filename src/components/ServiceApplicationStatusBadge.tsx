import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ServiceApplicationStatusBadgeProps {
  status: string;
  className?: string;
}

const ServiceApplicationStatusBadge: React.FC<ServiceApplicationStatusBadgeProps> = ({ 
  status, 
  className = "" 
}) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return {
          variant: 'outline' as const,
          className: 'border-muted-foreground text-muted-foreground',
          label: 'Draft'
        };
      case 'submitted':
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
          label: 'Submitted'
        };
      case 'under_review':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
          label: 'Under Review'
        };
      case 'approved':
        return {
          variant: 'secondary' as const,
          className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
          label: 'Approved'
        };
      case 'denied':
        return {
          variant: 'destructive' as const,
          className: '',
          label: 'Denied'
        };
      case 'paid':
        return {
          variant: 'secondary' as const,
          className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
          label: 'Paid'
        };
      case 'completed':
        return {
          variant: 'secondary' as const,
          className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
          label: 'Completed'
        };
      default:
        return {
          variant: 'outline' as const,
          className: '',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
};

export default ServiceApplicationStatusBadge;