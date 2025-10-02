import { Badge } from '@/components/ui/badge';

interface TaxSubmissionStatusBadgeProps {
  status: string;
  className?: string;
}

export const TaxSubmissionStatusBadge = ({ status, className }: TaxSubmissionStatusBadgeProps) => {
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