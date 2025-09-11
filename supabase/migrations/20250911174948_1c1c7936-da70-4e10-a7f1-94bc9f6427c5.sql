-- Phase 1: Create Security Definer Functions for Role Family Management

-- Function to check if user has any municipal role
CREATE OR REPLACE FUNCTION public.is_municipal_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND account_type IN ('municipal', 'municipaluser', 'municipaladmin')
  );
$$;

-- Function to check if user has any resident role  
CREATE OR REPLACE FUNCTION public.is_resident_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND account_type IN ('resident', 'residentuser', 'residentadmin')
  );
$$;

-- Function to check if user has any business role
CREATE OR REPLACE FUNCTION public.is_business_user(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND account_type IN ('business', 'businessuser', 'businessadmin')
  );
$$;

-- Function to check municipal access to specific customer
CREATE OR REPLACE FUNCTION public.has_municipal_access_to_customer(user_uuid uuid, customer_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND customer_id = customer_uuid
    AND account_type IN ('municipal', 'municipaluser', 'municipaladmin')
  );
$$;

-- Function to check resident access to specific customer
CREATE OR REPLACE FUNCTION public.has_resident_access_to_customer(user_uuid uuid, customer_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND customer_id = customer_uuid
    AND account_type IN ('resident', 'residentuser', 'residentadmin')
  );
$$;

-- Function to check business access to specific customer
CREATE OR REPLACE FUNCTION public.has_business_access_to_customer(user_uuid uuid, customer_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER  
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND customer_id = customer_uuid
    AND account_type IN ('business', 'businessuser', 'businessadmin')
  );
$$;

-- Update cmelka@lakewood.gov role from municipaluser to municipaladmin
UPDATE public.profiles 
SET account_type = 'municipaladmin' 
WHERE email = 'cmelka@lakewood.gov' 
AND account_type = 'municipaluser';