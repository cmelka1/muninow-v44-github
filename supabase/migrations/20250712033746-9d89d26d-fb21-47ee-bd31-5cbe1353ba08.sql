-- Generate idempotency_id for existing bills in master_bills table
UPDATE public.master_bills 
SET idempotency_id = gen_random_uuid()::text 
WHERE idempotency_id IS NULL;