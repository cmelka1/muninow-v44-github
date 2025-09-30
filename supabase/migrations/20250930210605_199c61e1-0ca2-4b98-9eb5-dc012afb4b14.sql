-- Drop legacy tables that are no longer used in the application

-- Drop permit_reviews table (unused - replaced by permit_review_comments and permit_review_requests)
DROP TABLE IF EXISTS public.permit_reviews CASCADE;

-- Drop bill_matching_queue table (unused - legacy bill matching system)
DROP TABLE IF EXISTS public.bill_matching_queue CASCADE;

-- Drop bill_processing_failures table (unused - legacy error tracking)
DROP TABLE IF EXISTS public.bill_processing_failures CASCADE;