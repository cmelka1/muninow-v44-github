import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DailyBooking {
  id: string;
  tile_id: string;
  booking_date: string;
  booking_start_time: string;
  booking_end_time: string | null;
  status: string;
  payment_status: string | null;
  applicant_name: string | null;
  applicant_email: string | null;
  applicant_phone: string | null;
}

export const useDailyBookings = (customerId: string | undefined, date: string) => {
  return useQuery({
    queryKey: ['daily-bookings', customerId, date],
    queryFn: async () => {
      if (!customerId) throw new Error('Customer ID required');

      // First get sport facility IDs
      const { data: tiles } = await supabase
        .from('municipal_service_tiles')
        .select('id')
        .eq('customer_id', customerId)
        .eq('has_time_slots', true)
        .eq('is_active', true);

      if (!tiles || tiles.length === 0) return [];

      const tileIds = tiles.map(t => t.id);

      // Fetch bookings for the date
      const { data, error } = await supabase
        .from('municipal_service_applications')
        .select('*')
        .eq('booking_date', date)
        .in('tile_id', tileIds)
        .not('status', 'in', '(draft,cancelled,expired)')
        .order('booking_start_time');

      if (error) throw error;
      return (data || []) as DailyBooking[];
    },
    enabled: !!customerId && !!date,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
};
