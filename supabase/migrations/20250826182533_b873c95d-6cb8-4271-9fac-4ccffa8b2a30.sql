-- Add RLS policy to allow public read access for Business Licenses merchants
CREATE POLICY "Allow public read access for Business Licenses merchants" 
ON merchants 
FOR SELECT 
USING (subcategory = 'Business Licenses');