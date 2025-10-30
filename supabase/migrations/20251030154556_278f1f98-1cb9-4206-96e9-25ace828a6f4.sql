-- Create function to generate business license numbers
CREATE OR REPLACE FUNCTION public.generate_business_license_number(p_customer_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_code TEXT;
  v_year TEXT;
  v_sequence INT;
  v_license_number TEXT;
  v_max_retries INT := 10;
  v_retry_count INT := 0;
BEGIN
  -- Get customer code from customers table (use first 3 letters of legal_entity_name, uppercase)
  SELECT UPPER(LEFT(REGEXP_REPLACE(legal_entity_name, '[^a-zA-Z]', '', 'g'), 3))
  INTO v_customer_code
  FROM customers
  WHERE customer_id = p_customer_id;
  
  -- If no customer found or code is empty, use 'MUN' as default
  IF v_customer_code IS NULL OR v_customer_code = '' THEN
    v_customer_code := 'MUN';
  END IF;
  
  -- Get current year
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Retry loop to handle potential race conditions
  WHILE v_retry_count < v_max_retries LOOP
    -- Get next sequence number for this customer
    SELECT COALESCE(MAX(
      NULLIF(
        REGEXP_REPLACE(
          SUBSTRING(license_number FROM '[0-9]+$'),
          '[^0-9]',
          '',
          'g'
        ),
        ''
      )::INT
    ), 0) + 1
    INTO v_sequence
    FROM business_license_applications
    WHERE customer_id = p_customer_id
      AND license_number IS NOT NULL
      AND license_number LIKE v_customer_code || '-' || v_year || '-%';
    
    -- Generate license number: {CUSTOMER_CODE}-{YEAR}-{SEQUENCE}
    v_license_number := v_customer_code || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 6, '0');
    
    -- Check if this number already exists
    IF NOT EXISTS (
      SELECT 1 
      FROM business_license_applications 
      WHERE license_number = v_license_number
    ) THEN
      RETURN v_license_number;
    END IF;
    
    -- If we get here, there was a collision, retry
    v_retry_count := v_retry_count + 1;
  END LOOP;
  
  -- If we exhausted retries, raise an exception
  RAISE EXCEPTION 'Failed to generate unique license number after % attempts', v_max_retries;
END;
$$;

-- Create trigger function to assign license number on approval
CREATE OR REPLACE FUNCTION public.assign_license_number_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign license number when status changes to 'approved' and license_number is NULL
  IF NEW.application_status = 'approved' 
     AND OLD.application_status != 'approved' 
     AND NEW.license_number IS NULL THEN
    NEW.license_number := generate_business_license_number(NEW.customer_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on business_license_applications
DROP TRIGGER IF EXISTS assign_license_number_on_approval_trigger ON business_license_applications;
CREATE TRIGGER assign_license_number_on_approval_trigger
  BEFORE UPDATE ON business_license_applications
  FOR EACH ROW
  EXECUTE FUNCTION assign_license_number_on_approval();

-- Backfill the one approved license that's missing a license number
UPDATE business_license_applications
SET license_number = generate_business_license_number(customer_id)
WHERE id = 'fe2766b5-05b0-42a7-86f3-e56085444252'
  AND application_status = 'approved'
  AND license_number IS NULL;