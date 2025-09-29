-- Fix handle_new_user function by removing role field references
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    street_address, 
    apt_number, 
    city, 
    state, 
    zip_code, 
    account_type, 
    business_legal_name, 
    industry
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'first_name', 
    new.raw_user_meta_data ->> 'last_name', 
    new.email, 
    new.raw_user_meta_data ->> 'phone', 
    new.raw_user_meta_data ->> 'street_address', 
    new.raw_user_meta_data ->> 'apt_number', 
    new.raw_user_meta_data ->> 'city', 
    new.raw_user_meta_data ->> 'state', 
    new.raw_user_meta_data ->> 'zip_code', 
    new.raw_user_meta_data ->> 'account_type', 
    new.raw_user_meta_data ->> 'business_legal_name', 
    new.raw_user_meta_data ->> 'industry'
  );

  -- Handle municipal team member creation for municipal account types
  IF new.raw_user_meta_data ->> 'account_type' IN ('municipal', 'municipaladmin', 'municipaluser') THEN
    INSERT INTO public.municipal_team_members (
      customer_id,
      member_id,
      role,
      status
    )
    SELECT 
      (new.raw_user_meta_data ->> 'customer_id')::uuid,
      new.id,
      CASE 
        WHEN new.raw_user_meta_data ->> 'account_type' = 'municipal' THEN 'admin'
        ELSE 'member'
      END,
      'active'
    WHERE new.raw_user_meta_data ->> 'customer_id' IS NOT NULL;
  END IF;

  RETURN new;
END;
$$;