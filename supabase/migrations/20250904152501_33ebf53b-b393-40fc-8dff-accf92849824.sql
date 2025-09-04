-- Create municipal_business_license_types table for customer-specific business license configuration
CREATE TABLE public.municipal_business_license_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  business_license_type_id UUID NULL, -- references business_license_types for standard types
  merchant_id UUID NULL, -- references merchants for Business Licenses merchant
  merchant_name TEXT NULL,
  municipal_label TEXT NOT NULL, -- the Business License Type name
  base_fee_cents BIGINT NOT NULL DEFAULT 0, -- the Fee in cents
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_custom BOOLEAN NOT NULL DEFAULT false, -- true for custom types created by municipality
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.municipal_business_license_types ENABLE ROW LEVEL SECURITY;

-- Create policies for municipal business license types
CREATE POLICY "Municipal users can manage business license types for their customer"
ON public.municipal_business_license_types
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.account_type = 'municipal'
    AND profiles.customer_id = municipal_business_license_types.customer_id
  )
);

CREATE POLICY "Super admins can manage all business license types"
ON public.municipal_business_license_types
FOR ALL
USING (is_current_user_super_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_municipal_business_license_types_updated_at
BEFORE UPDATE ON public.municipal_business_license_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_municipal_business_license_types_customer_id ON public.municipal_business_license_types(customer_id);
CREATE INDEX idx_municipal_business_license_types_merchant_id ON public.municipal_business_license_types(merchant_id);
CREATE INDEX idx_municipal_business_license_types_display_order ON public.municipal_business_license_types(customer_id, display_order);