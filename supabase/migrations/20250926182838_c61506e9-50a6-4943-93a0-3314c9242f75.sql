-- Clean slate implementation for municipality-specific license numbering

-- 1. Clear existing payment history records first (to avoid foreign key constraint)
DELETE FROM public.payment_history WHERE business_license_id IS NOT NULL;

-- 2. Clear existing business license applications (test data)
DELETE FROM public.business_license_applications;

-- 3. Clear any existing business license number sequences
DROP TABLE IF EXISTS public.business_license_number_sequences;

-- 4. Create new business license number sequences table for per-municipality tracking
CREATE TABLE public.business_license_number_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  municipality_code TEXT NOT NULL,
  year_code TEXT NOT NULL,
  next_sequence INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(customer_id, year_code)
);

-- Enable RLS on the new table
ALTER TABLE public.business_license_number_sequences ENABLE ROW LEVEL SECURITY;

-- Create policies for the sequences table
CREATE POLICY "Municipal users can manage their sequences"
ON public.business_license_number_sequences
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (account_type = 'municipal' OR account_type = 'municipaladmin' OR account_type = 'municipaluser')
    AND profiles.customer_id = business_license_number_sequences.customer_id
  )
);

CREATE POLICY "Super admins can manage all sequences"
ON public.business_license_number_sequences
FOR ALL
USING (is_current_user_super_admin());

-- 5. Drop and recreate the generate_license_number function with customer_id support
DROP FUNCTION IF EXISTS public.generate_license_number();

CREATE OR REPLACE FUNCTION public.generate_license_number(p_customer_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  municipality_code TEXT;
  current_year_code TEXT;
  sequence_num INTEGER;
  license_number TEXT;
  municipality_name TEXT;
BEGIN
  -- Get municipality name from customers table
  SELECT COALESCE(doing_business_as, legal_entity_name) INTO municipality_name
  FROM public.customers
  WHERE customer_id = p_customer_id;
  
  IF municipality_name IS NULL THEN
    RAISE EXCEPTION 'Customer not found for ID: %', p_customer_id;
  END IF;
  
  -- Extract first 3 letters from municipality name, removing non-alphabetic characters
  municipality_code := UPPER(LEFT(REGEXP_REPLACE(municipality_name, '[^A-Za-z]', '', 'g'), 3));
  
  -- Handle edge case where municipality name has less than 3 letters
  IF LENGTH(municipality_code) < 3 THEN
    municipality_code := RPAD(municipality_code, 3, 'X');
  END IF;
  
  -- Get current year (4 digits)
  current_year_code := TO_CHAR(NOW(), 'YYYY');
  
  -- Use advisory lock to prevent race conditions
  PERFORM pg_advisory_xact_lock(hashtext('business_license_number_generation_' || p_customer_id::text || '_' || current_year_code));
  
  -- Atomically get and increment the sequence number for this municipality and year
  INSERT INTO public.business_license_number_sequences (
    customer_id, 
    municipality_code, 
    year_code, 
    next_sequence, 
    updated_at
  )
  VALUES (p_customer_id, municipality_code, current_year_code, 2, NOW())
  ON CONFLICT (customer_id, year_code) 
  DO UPDATE SET 
    municipality_code = EXCLUDED.municipality_code, -- Update in case municipality name changed
    next_sequence = business_license_number_sequences.next_sequence + 1,
    updated_at = NOW()
  RETURNING business_license_number_sequences.next_sequence - 1 INTO sequence_num;
  
  -- Format as [3-LETTERS]-YYYY-NNNNNN
  license_number := municipality_code || '-' || current_year_code || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN license_number;
END;
$$;

-- 6. Update the trigger function to pass customer_id
CREATE OR REPLACE FUNCTION public.set_license_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.license_number IS NULL THEN
    NEW.license_number := public.generate_license_number(NEW.customer_id);
  END IF;
  RETURN NEW;
END;
$$;

-- 7. Ensure the trigger exists on business_license_applications
DROP TRIGGER IF EXISTS set_business_license_number ON public.business_license_applications;

CREATE TRIGGER set_business_license_number
  BEFORE INSERT ON public.business_license_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_license_number();

-- 8. Add trigger for updating timestamps on sequences table
CREATE TRIGGER update_business_license_sequences_updated_at
  BEFORE UPDATE ON public.business_license_number_sequences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();