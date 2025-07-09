-- Add finix_merchant_id and merchant_name columns to merchant_payout_profiles table
ALTER TABLE public.merchant_payout_profiles 
ADD COLUMN finix_merchant_id TEXT,
ADD COLUMN merchant_name TEXT;

-- Populate existing rows with data from merchants table
UPDATE public.merchant_payout_profiles 
SET 
  finix_merchant_id = merchants.finix_merchant_id,
  merchant_name = merchants.merchant_name
FROM public.merchants 
WHERE merchant_payout_profiles.merchant_id = merchants.id;