import { Badge } from '@/components/ui/badge';

interface BusinessLicenseStatusBadgeProps {
  status: string;
  className?: string;
}

export const BusinessLicenseStatusBadge = ({ status, className }: BusinessLicenseStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          className: 'bg-muted text-muted-foreground hover:bg-muted',
          label: 'Draft'
        };
      case 'submitted':
        return {
          className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
          label: 'Submitted'
        };
      case 'under_review':
        return {
          className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
          label: 'Under Review'
        };
      case 'information_requested':
        return {
          className: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
          label: 'Information Requested'
        };
      case 'resubmitted':
        return {
          className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
          label: 'Resubmitted'
        };
      case 'approved':
        return {
          className: 'bg-green-100 text-green-700 hover:bg-green-100',
          label: 'Approved'
        };
      case 'denied':
        return {
          className: 'bg-red-100 text-red-700 hover:bg-red-100',
          label: 'Denied'
        };
      case 'withdrawn':
        return {
          className: 'bg-muted text-muted-foreground hover:bg-muted',
          label: 'Withdrawn'
        };
      case 'expired':
        return {
          className: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
          label: 'Expired'
        };
      case 'issued':
        return {
          className: 'bg-blue-500 text-white hover:bg-blue-500',
          label: 'Issued'
        };
      default:
        return {
          className: 'bg-muted text-muted-foreground hover:bg-muted',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      className={`${config.className} ${className || ''}`}
    >
      {config.label}
    </Badge>
  );
};