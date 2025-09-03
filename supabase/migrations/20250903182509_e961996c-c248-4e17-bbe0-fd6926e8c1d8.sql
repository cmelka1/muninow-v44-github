-- Phase 3: Delete merchant dependencies (fee profiles and payout profiles)
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