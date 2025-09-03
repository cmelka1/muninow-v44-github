-- Phase 3 complete fix: Delete all merchant dependencies systematically
-- Delete municipal permit questions for Hinsdale merchants
DELETE FROM public.municipal_permit_questions 
WHERE merchant_id IN (
  SELECT id FROM public.merchants 
  WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Delete municipal service tiles for Hinsdale merchants
DELETE FROM public.municipal_service_tiles 
WHERE merchant_id IN (
  SELECT id FROM public.merchants 
  WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Delete merchant fee profiles for Hinsdale merchants
DELETE FROM public.merchant_fee_profiles 
WHERE merchant_id IN (
  SELECT id FROM public.merchants 
  WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Delete merchant payout profiles for Hinsdale merchants
DELETE FROM public.merchant_payout_profiles 
WHERE merchant_id IN (
  SELECT id FROM public.merchants 
  WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Phase 4: Delete core records
-- Delete merchants for Hinsdale customer
DELETE FROM public.merchants 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';

-- Finally delete the Hinsdale customer record
DELETE FROM public.customers 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';