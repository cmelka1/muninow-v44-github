-- Drop duplicate foreign key constraints that are causing PostgREST confusion
-- Keep only the original constraints that were already working

-- Drop the duplicate tile_id constraint (keep the original one)
ALTER TABLE public.municipal_service_applications 
DROP CONSTRAINT IF EXISTS fk_municipal_service_applications_tile_id;

-- Drop the duplicate customer_id constraint (keep the original one) 
ALTER TABLE public.municipal_service_applications 
DROP CONSTRAINT IF EXISTS fk_municipal_service_applications_customer_id;

-- Drop the duplicate user_id constraint (keep the original one)
ALTER TABLE public.municipal_service_applications 
DROP CONSTRAINT IF EXISTS fk_municipal_service_applications_user_id;