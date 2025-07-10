-- Clean up legacy payment_methods table and related functions

-- Phase 1: Drop migration artifact views (they are views, not tables)
DROP VIEW IF EXISTS public.role_migration_backup CASCADE;
DROP VIEW IF EXISTS public.role_migration_results CASCADE;

-- Phase 2: Drop payment_methods related functions
DROP FUNCTION IF EXISTS public.count_payment_methods();
DROP FUNCTION IF EXISTS public.enable_payment_method(uuid);
DROP FUNCTION IF EXISTS public.get_available_payment_methods(uuid);
DROP FUNCTION IF EXISTS public.get_payment_methods();
DROP FUNCTION IF EXISTS public.get_payment_methods(text);
DROP FUNCTION IF EXISTS public.create_payment_method(text, text, text, text, text, text, text, uuid, timestamp with time zone, text, text);
DROP FUNCTION IF EXISTS public.create_payment_method(text, text, text, text, text, text, text, uuid, timestamp with time zone, text, text, text, text);
DROP FUNCTION IF EXISTS public.delete_payment_method(uuid);
DROP FUNCTION IF EXISTS public.set_default_payment_method(uuid);
DROP FUNCTION IF EXISTS public.set_default_payment_method(uuid, text);
DROP FUNCTION IF EXISTS public.handle_default_payment_method();
DROP FUNCTION IF EXISTS public.update_payment_method_timestamp();
DROP FUNCTION IF EXISTS public.check_payment_method_expired();

-- Phase 3: Drop the payment_methods table
DROP TABLE IF EXISTS public.payment_methods CASCADE;