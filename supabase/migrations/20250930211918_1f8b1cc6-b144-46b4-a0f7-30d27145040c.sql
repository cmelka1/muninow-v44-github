-- Drop bill payment tables that are no longer used

-- Drop bill_notifications table
DROP TABLE IF EXISTS public.bill_notifications CASCADE;

-- Drop master_bills table  
DROP TABLE IF EXISTS public.master_bills CASCADE;

-- Drop database functions related to bill processing
DROP FUNCTION IF EXISTS public.trigger_bill_matching_for_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.trigger_bill_status_notifications() CASCADE;
DROP FUNCTION IF EXISTS public.sync_bill_merchant_data() CASCADE;
DROP FUNCTION IF EXISTS public.sync_merchant_to_bills() CASCADE;
DROP FUNCTION IF EXISTS public.track_bill_changes() CASCADE;