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
        return 'bg-muted text-muted-foreground hover:bg-muted';
      case 'submitted':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'under_review':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-100';
      case 'information_requested':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
      case 'resubmitted':
        return 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100';
      case 'approved':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'denied':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'rejected':
        return 'bg-red-100 text-red-700 hover:bg-red-100';
      case 'withdrawn':
        return 'bg-muted text-muted-foreground hover:bg-muted';
      case 'expired':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
      case 'issued':
        return 'bg-blue-500 text-white hover:bg-blue-500';
      default:
        return 'bg-muted text-muted-foreground hover:bg-muted';
    }
  };

  return (
    <Badge 
      className={`${getStatusColor(status)} ${className}`}
    >
      {getStatusDisplayName(status)}
    </Badge>
  );
};