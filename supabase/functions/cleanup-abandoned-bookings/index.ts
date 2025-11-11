import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  console.log('🧹 Starting cleanup of abandoned bookings...');

  // Find abandoned draft bookings older than 30 minutes
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data: abandonedBookings, error: fetchError } = await supabase
    .from('municipal_service_applications')
    .select('id, created_at, booking_date, booking_start_time')
    .eq('status', 'draft')
    .not('booking_date', 'is', null)  // Only time slot bookings
    .lt('created_at', thirtyMinutesAgo);

  if (fetchError) {
    console.error('❌ Error fetching abandoned bookings:', fetchError);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: fetchError.message 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (!abandonedBookings || abandonedBookings.length === 0) {
    console.log('✅ No abandoned bookings to clean up');
    return new Response(
      JSON.stringify({ 
        success: true,
        expired: 0,
        message: 'No abandoned bookings found'
      }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  console.log(`🔍 Found ${abandonedBookings.length} abandoned bookings to expire:`, 
    abandonedBookings.map(b => ({ id: b.id, date: b.booking_date, time: b.booking_start_time }))
  );

  // Mark them as expired
  const { error: updateError } = await supabase
    .from('municipal_service_applications')
    .update({ 
      status: 'expired',
      updated_at: new Date().toISOString()
    })
    .in('id', abandonedBookings.map(b => b.id));

  if (updateError) {
    console.error('❌ Error expiring bookings:', updateError);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: updateError.message 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  console.log(`✅ Successfully expired ${abandonedBookings.length} abandoned bookings`);

  return new Response(
    JSON.stringify({ 
      success: true,
      expired: abandonedBookings.length,
      message: `Expired ${abandonedBookings.length} abandoned time slot bookings`,
      bookings: abandonedBookings.map(b => ({ 
        id: b.id, 
        booking_date: b.booking_date,
        booking_start_time: b.booking_start_time
      }))
    }), 
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
});
