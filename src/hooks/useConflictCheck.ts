import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConflictCheckParams {
  tileId: string;
  date: string;
  startTime: string;
  endTime: string;
  excludeApplicationId?: string;
}

export const useConflictCheck = (params: ConflictCheckParams | null) => {
  return useQuery({
    queryKey: ['conflict-check', params],
    queryFn: async () => {
      if (!params) return { hasConflict: false, conflictingBookings: [] };

      const { tileId, date, startTime, endTime, excludeApplicationId } = params;

      // Fetch bookings for the same facility and date
      let query = supabase
        .from('municipal_service_applications')
        .select('id, booking_start_time, booking_end_time, applicant_name')
        .eq('tile_id', tileId)
        .eq('booking_date', date)
        .not('status', 'in', '(draft,cancelled,expired,denied)');

      if (excludeApplicationId) {
        query = query.neq('id', excludeApplicationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Check for time overlaps
      const conflicts = data?.filter(booking => {
        const bookingStart = booking.booking_start_time;
        const bookingEnd = booking.booking_end_time || bookingStart;

        // Check if times overlap
        // Overlap occurs if: (start1 < end2) AND (start2 < end1)
        return startTime < bookingEnd && bookingStart < endTime;
      }) || [];

      return {
        hasConflict: conflicts.length > 0,
        conflictingBookings: conflicts,
      };
    },
    enabled: !!params,
  });
};
