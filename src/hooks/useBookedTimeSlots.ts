import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BookedSlot {
  id: string;
  booking_date: string;
  booking_start_time: string;
  booking_end_time: string | null;
  status: string;
}

export const useBookedTimeSlots = (tileId: string, date: string) => {
  return useQuery({
    queryKey: ['booked-time-slots', tileId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('municipal_service_applications')
        .select('id, booking_date, booking_start_time, booking_end_time, status')
        .eq('tile_id', tileId)
        .eq('booking_date', date)
        .not('status', 'in', '(denied,rejected,withdrawn,cancelled,expired)');
      
      if (error) throw error;
      return (data || []) as BookedSlot[];
    },
    enabled: !!tileId && !!date,
  });
};
