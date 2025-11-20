import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, User, DollarSign } from 'lucide-react';

interface BookingCardProps {
  booking: {
    id: string;
    booking_start_time: string;
    booking_end_time: string | null;
    status: string;
    payment_status: string | null;
    applicant_name: string | null;
  };
  facilityName: string;
  viewMode?: 'compact' | 'expanded';
  onClick?: () => void;
  className?: string;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  facilityName,
  viewMode = 'expanded',
  onClick,
  className,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'pending':
      case 'under_review':
        return 'bg-yellow-500';
      case 'issued':
        return 'bg-blue-500';
      case 'denied':
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'approved':
      case 'issued':
        return 'default';
      case 'pending':
      case 'under_review':
        return 'secondary';
      case 'denied':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const applicantName = booking.applicant_name || 'Unknown';

  const timeRange = `${formatTime(booking.booking_start_time)} - ${formatTime(booking.booking_end_time || booking.booking_start_time)}`;

  if (viewMode === 'compact') {
    return (
      <div
        className={cn(
          'p-2 rounded border-l-4 cursor-pointer hover:bg-muted/50 transition-colors',
          className
        )}
        style={{ borderLeftColor: `hsl(var(--${getStatusColor(booking.status).replace('bg-', '')}))` }}
        onClick={onClick}
      >
        <div className="text-xs font-medium truncate">{facilityName}</div>
        <div className="text-xs text-muted-foreground truncate">{applicantName}</div>
        <div className="text-xs text-muted-foreground">{formatTime(booking.booking_start_time)}</div>
      </div>
    );
  }

  return (
    <Card className={cn('cursor-pointer hover:shadow-md transition-all', className)} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-semibold text-lg">{timeRange}</div>
            <div className="text-sm text-muted-foreground">{facilityName}</div>
          </div>
          <div className={cn('h-3 w-3 rounded-full', getStatusColor(booking.status))} />
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{applicantName}</span>
          </div>
          {booking.payment_status && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="capitalize">{booking.payment_status}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <Badge variant={getStatusBadgeVariant(booking.status)}>
            {booking.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
