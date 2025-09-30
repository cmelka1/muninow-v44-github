-- Phase 1: Critical Database Cleanup - Remove all remaining bill-related database objects

-- Drop the get_user_bill_summary_for_municipal function if it exists
DROP FUNCTION IF EXISTS public.get_user_bill_summary_for_municipal(uuid);

-- Drop bill_status_enum type if it exists
DROP TYPE IF EXISTS public.bill_status_enum CASCADE;

-- Remove external_bill_number from refunds table if it exists
ALTER TABLE public.refunds DROP COLUMN IF EXISTS external_bill_number;

-- Remove paperless_billing from user_notification_preferences table if it exists
ALTER TABLE public.user_notification_preferences DROP COLUMN IF EXISTS paperless_billing;