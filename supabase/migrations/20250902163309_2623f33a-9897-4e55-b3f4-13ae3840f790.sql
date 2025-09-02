-- Update the municipal service tile to populate the missing merchant_fee_profile_id
UPDATE public.municipal_service_tiles 
SET merchant_fee_profile_id = '75cfddaf-66d7-4281-833f-1300cb0dc33c'
WHERE merchant_id = '7fda113d-6df1-4e9c-8e7b-1ebd54ae526a' 
  AND merchant_fee_profile_id IS NULL;