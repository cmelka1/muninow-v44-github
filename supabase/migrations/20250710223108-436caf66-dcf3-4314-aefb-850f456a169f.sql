-- Drop municipal tables and clean up orphaned columns

-- Phase 1: Drop the tables
DROP TABLE IF EXISTS public.municipal_systems CASCADE;
DROP TABLE IF EXISTS public.municipalities CASCADE;

-- Phase 2: Clean up orphaned columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS municipality_name;
ALTER TABLE public.master_bills DROP COLUMN IF EXISTS municipality_timezone;