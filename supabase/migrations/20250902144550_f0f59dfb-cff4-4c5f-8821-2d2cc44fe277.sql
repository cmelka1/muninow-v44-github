-- Enable RLS on municipal_service_tiles table and add policies
ALTER TABLE public.municipal_service_tiles ENABLE ROW LEVEL SECURITY;

-- Public can read active service tiles
CREATE POLICY "Public can read active service tiles" 
ON public.municipal_service_tiles 
FOR SELECT 
USING (is_active = true);

-- Municipal users can manage service tiles for their customer
CREATE POLICY "Municipal users can manage service tiles for their customer" 
ON public.municipal_service_tiles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.account_type = 'municipal' 
  AND profiles.customer_id = municipal_service_tiles.customer_id
));

-- Super admins can manage all service tiles
CREATE POLICY "Super admins can manage all service tiles" 
ON public.municipal_service_tiles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = auth.uid() 
  AND r.name = 'superAdmin'
));