import React from 'react';
import { BookingCard } from './BookingCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface DayScheduleListProps {
  bookings: any[];
  facilities: any[];
  isLoading: boolean;
  onBookingClick: (bookingId: string) => void;
  onNewBooking: () => void;
}

export const DayScheduleList: React.FC<DayScheduleListProps> = ({
  bookings,
  facilities,
  isLoading,
  onBookingClick,
  onNewBooking,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No bookings for this date</p>
          <Button onClick={onNewBooking}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Booking
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Sort bookings by time
  const sortedBookings = [...bookings].sort((a, b) => 
    a.booking_start_time.localeCompare(b.booking_start_time)
  );

  return (
    <div className="space-y-3">
      {sortedBookings.map((booking) => {
        const facility = facilities.find(f => f.id === booking.tile_id);
        return (
          <BookingCard
            key={booking.id}
            booking={booking}
            facilityName={facility?.title || 'Unknown Facility'}
            viewMode="expanded"
            onClick={() => onBookingClick(booking.id)}
            onActionComplete={() => window.location.reload()}
          />
        );
      })}
      
      <Button
        variant="outline"
        className="w-full"
        onClick={onNewBooking}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Booking
      </Button>
    </div>
  );
};
