import React from 'react';
import { Badge } from '@/components/ui/badge';
import { PermitStatus, getStatusDisplayName } from '@/hooks/usePermitWorkflow';

interface PermitStatusBadgeProps {
  status: PermitStatus;
  className?: string;
}

export const PermitStatusBadge: React.FC<PermitStatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  const getStatusColor = (status: PermitStatus): string => {
    switch (status) {
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'submitted':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'under_review':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'information_requested':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'resubmitted':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'denied':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'expired':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'issued':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getStatusColor(status)} ${className}`}
    >
      {getStatusDisplayName(status)}
    </Badge>
  );
};