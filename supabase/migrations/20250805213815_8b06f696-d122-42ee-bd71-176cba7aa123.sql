-- Rollback migration: Remove performance optimization changes

-- Drop the optimized database function
DROP FUNCTION IF EXISTS public.get_permit_with_details(uuid);

-- Drop all performance indexes
DROP INDEX IF EXISTS public.idx_permit_applications_customer_id;
DROP INDEX IF EXISTS public.idx_permit_applications_customer_status_created;
DROP INDEX IF EXISTS public.idx_permit_applications_permit_id;
DROP INDEX IF EXISTS public.idx_permit_applications_assigned_reviewer;
DROP INDEX IF EXISTS public.idx_permit_types_active;
DROP INDEX IF EXISTS public.idx_municipal_permit_questions_customer_active;
DROP INDEX IF EXISTS public.idx_permit_documents_permit_id;