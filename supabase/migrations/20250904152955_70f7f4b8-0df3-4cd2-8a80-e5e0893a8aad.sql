-- Create functions to manage municipal business license types

-- Function to get municipal business license types for a customer
CREATE OR REPLACE FUNCTION public.get_municipal_business_license_types(p_customer_id uuid)
RETURNS TABLE(
  id uuid,
  customer_id uuid,
  business_license_type_id uuid,
  merchant_id uuid,
  merchant_name text,
  municipal_label text,
  base_fee_cents bigint,
  is_active boolean,
  is_custom boolean,
  display_order integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the current user has access to this customer
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'municipal' 
    AND profiles.customer_id = p_customer_id
  ) AND NOT is_current_user_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Not authorized for this customer';
  END IF;

  RETURN QUERY
  SELECT 
    mblt.id,
    mblt.customer_id,
    mblt.business_license_type_id,
    mblt.merchant_id,
    mblt.merchant_name,
    mblt.municipal_label,
    mblt.base_fee_cents,
    mblt.is_active,
    mblt.is_custom,
    mblt.display_order,
    mblt.created_at,
    mblt.updated_at
  FROM public.municipal_business_license_types mblt
  WHERE mblt.customer_id = p_customer_id
    AND mblt.is_active = true
  ORDER BY mblt.display_order, mblt.municipal_label;
END;
$$;

-- Function to create municipal business license type
CREATE OR REPLACE FUNCTION public.create_municipal_business_license_type(
  p_customer_id uuid,
  p_business_license_type_id uuid,
  p_merchant_id uuid,
  p_merchant_name text,
  p_municipal_label text,
  p_base_fee_cents bigint,
  p_is_custom boolean DEFAULT true,
  p_display_order integer DEFAULT 999
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Verify the current user has access to this customer
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'municipal' 
    AND profiles.customer_id = p_customer_id
  ) AND NOT is_current_user_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Not authorized for this customer';
  END IF;

  INSERT INTO public.municipal_business_license_types (
    customer_id,
    business_license_type_id,
    merchant_id,
    merchant_name,
    municipal_label,
    base_fee_cents,
    is_custom,
    display_order
  ) VALUES (
    p_customer_id,
    p_business_license_type_id,
    p_merchant_id,
    p_merchant_name,
    p_municipal_label,
    p_base_fee_cents,
    p_is_custom,
    p_display_order
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Function to update municipal business license type
CREATE OR REPLACE FUNCTION public.update_municipal_business_license_type(
  p_id uuid,
  p_municipal_label text DEFAULT NULL,
  p_base_fee_cents bigint DEFAULT NULL,
  p_is_active boolean DEFAULT NULL,
  p_display_order integer DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id uuid;
BEGIN
  -- Get the customer_id for the license type
  SELECT customer_id INTO v_customer_id
  FROM public.municipal_business_license_types
  WHERE id = p_id;

  -- Verify the current user has access to this customer
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'municipal' 
    AND profiles.customer_id = v_customer_id
  ) AND NOT is_current_user_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Not authorized for this customer';
  END IF;

  UPDATE public.municipal_business_license_types
  SET 
    municipal_label = COALESCE(p_municipal_label, municipal_label),
    base_fee_cents = COALESCE(p_base_fee_cents, base_fee_cents),
    is_active = COALESCE(p_is_active, is_active),
    display_order = COALESCE(p_display_order, display_order),
    updated_at = now()
  WHERE id = p_id;

  RETURN TRUE;
END;
$$;

-- Function to initialize standard business license types for a municipality
CREATE OR REPLACE FUNCTION public.initialize_standard_business_license_types(p_customer_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_merchant_id uuid;
  v_merchant_name text;
  standard_type record;
BEGIN
  -- Verify the current user has access to this customer
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.account_type = 'municipal' 
    AND profiles.customer_id = p_customer_id
  ) AND NOT is_current_user_super_admin() THEN
    RAISE EXCEPTION 'Access denied: Not authorized for this customer';
  END IF;

  -- Get the Business Licenses merchant for this customer
  SELECT id, merchant_name INTO v_merchant_id, v_merchant_name
  FROM public.merchants
  WHERE customer_id = p_customer_id
    AND subcategory = 'Business Licenses'
  LIMIT 1;

  -- Check if types already exist
  IF EXISTS (
    SELECT 1 FROM public.municipal_business_license_types
    WHERE customer_id = p_customer_id
  ) THEN
    RETURN FALSE; -- Already initialized
  END IF;

  -- Insert standard business license types from the business_license_types table
  FOR standard_type IN
    SELECT id, name, base_fee_cents
    FROM public.business_license_types
    WHERE is_active = true
    ORDER BY name
  LOOP
    INSERT INTO public.municipal_business_license_types (
      customer_id,
      business_license_type_id,
      merchant_id,
      merchant_name,
      municipal_label,
      base_fee_cents,
      is_custom,
      display_order
    ) VALUES (
      p_customer_id,
      standard_type.id,
      v_merchant_id,
      v_merchant_name,
      standard_type.name,
      standard_type.base_fee_cents,
      false, -- Not custom, these are standard types
      CASE standard_type.name
        WHEN 'Other' THEN 999
        ELSE (SELECT COUNT(*) FROM public.municipal_business_license_types WHERE customer_id = p_customer_id) + 1
      END
    );
  END LOOP;

  RETURN TRUE;
END;
$$;