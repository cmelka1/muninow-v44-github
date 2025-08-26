-- Add RLS policy to allow public read access for Business Licenses merchant fee profiles
CREATE POLICY "Allow public read access for Business Licenses merchant fee prof" 
ON public.merchant_fee_profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM merchants 
    WHERE merchants.id = merchant_fee_profiles.merchant_id 
    AND merchants.subcategory = 'Business Licenses'
  )
);