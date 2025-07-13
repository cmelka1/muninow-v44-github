-- Create security definer function for municipal user profile access
CREATE OR REPLACE FUNCTION public.get_user_profile_for_municipal(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  street_address text,
  apt_number text,
  city text,
  state text,
  zip_code text,
  account_type text,
  business_legal_name text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  requesting_customer_id uuid;
BEGIN
  -- Get the customer_id of the requesting municipal user
  SELECT customer_id INTO requesting_customer_id
  FROM public.profiles
  WHERE id = auth.uid() AND account_type = 'municipal';
  
  -- If not a municipal user, return no results
  IF requesting_customer_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if the requested user has bills for this customer
  IF NOT EXISTS (
    SELECT 1 FROM public.master_bills 
    WHERE user_id = p_user_id 
    AND customer_id = requesting_customer_id
  ) THEN
    RETURN;
  END IF;
  
  -- Return the user profile
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    p.street_address,
    p.apt_number,
    p.city,
    p.state,
    p.zip_code,
    p.account_type,
    p.business_legal_name,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = p_user_id;
END;
$$;

-- Add performance index for municipal user profile access
CREATE INDEX IF NOT EXISTS idx_master_bills_customer_user 
ON public.master_bills(customer_id, user_id);

-- Add index for profile lookups by municipal users
CREATE INDEX IF NOT EXISTS idx_profiles_municipal_lookup 
ON public.profiles(account_type, customer_id) 
WHERE account_type = 'municipal';