-- Add external customer information columns to master_bills table
ALTER TABLE master_bills ADD COLUMN IF NOT EXISTS external_customer_name TEXT;
ALTER TABLE master_bills ADD COLUMN IF NOT EXISTS external_business_name TEXT;
ALTER TABLE master_bills ADD COLUMN IF NOT EXISTS external_customer_address_line1 TEXT;
ALTER TABLE master_bills ADD COLUMN IF NOT EXISTS external_customer_address_line2 TEXT;
ALTER TABLE master_bills ADD COLUMN IF NOT EXISTS external_customer_city TEXT;
ALTER TABLE master_bills ADD COLUMN IF NOT EXISTS external_customer_state TEXT;
ALTER TABLE master_bills ADD COLUMN IF NOT EXISTS external_customer_zip_code TEXT;
ALTER TABLE master_bills ADD COLUMN IF NOT EXISTS external_customer_type TEXT;

-- Update the smart_bill_matching function to use external customer data
CREATE OR REPLACE FUNCTION smart_bill_matching(input_bill_id UUID)
RETURNS VOID AS $$
DECLARE
  bill_record master_bills%ROWTYPE;
  final_user_id UUID;
  calculated_match_score DECIMAL(3,2) := 0;
  match_details JSONB := '{}';
  address_score DECIMAL(3,2);
  name_score DECIMAL(3,2);
BEGIN
  -- Get bill details
  SELECT * INTO bill_record FROM master_bills WHERE bill_id = input_bill_id;
  
  -- PRIORITY 1: Business Bill Routing
  IF bill_record.external_business_name IS NOT NULL AND trim(bill_record.external_business_name) != '' THEN
    SELECT 
      id, 
      SIMILARITY(normalize_business_name(business_legal_name), normalize_business_name(bill_record.external_business_name)) * 0.6 +
      SIMILARITY(COALESCE(street_address || ' ' || city || ' ' || state, ''), 
                 COALESCE(bill_record.external_customer_address_line1 || ' ' || bill_record.external_customer_city || ' ' || bill_record.external_customer_state, '')) * 0.4
    INTO final_user_id, calculated_match_score
    FROM profiles 
    WHERE account_type = 'business'
      AND business_legal_name IS NOT NULL
    ORDER BY (
      SIMILARITY(normalize_business_name(business_legal_name), normalize_business_name(bill_record.external_business_name)) * 0.6 +
      SIMILARITY(COALESCE(street_address || ' ' || city || ' ' || state, ''), 
                 COALESCE(bill_record.external_customer_address_line1 || ' ' || bill_record.external_customer_city || ' ' || bill_record.external_customer_state, '')) * 0.4
    ) DESC
    LIMIT 1;
    
    match_details := jsonb_build_object('type', 'business', 'business_name_match', true);
  
  -- PRIORITY 2: Personal Bill Routing  
  ELSIF bill_record.external_customer_name IS NOT NULL AND trim(bill_record.external_customer_name) != '' THEN
    SELECT 
      id,
      SIMILARITY(COALESCE(last_name, ''), COALESCE(split_part(bill_record.external_customer_name, ' ', -1), '')) * 0.4 +
      SIMILARITY(COALESCE(street_address || ' ' || city || ' ' || state, ''), 
                 COALESCE(bill_record.external_customer_address_line1 || ' ' || bill_record.external_customer_city || ' ' || bill_record.external_customer_state, '')) * 0.6
    INTO final_user_id, calculated_match_score
    FROM profiles 
    WHERE account_type = 'resident'
    ORDER BY (
      SIMILARITY(COALESCE(last_name, ''), COALESCE(split_part(bill_record.external_customer_name, ' ', -1), '')) * 0.4 +
      SIMILARITY(COALESCE(street_address || ' ' || city || ' ' || state, ''), 
                 COALESCE(bill_record.external_customer_address_line1 || ' ' || bill_record.external_customer_city || ' ' || bill_record.external_customer_state, '')) * 0.6
    ) DESC
    LIMIT 1;
    
    match_details := jsonb_build_object('type', 'personal', 'name_match', true);
  
  -- FALLBACK: Try legacy fields if external fields are empty
  ELSIF bill_record.business_legal_name IS NOT NULL AND trim(bill_record.business_legal_name) != '' THEN
    SELECT 
      id, 
      SIMILARITY(normalize_business_name(business_legal_name), normalize_business_name(bill_record.business_legal_name)) * 0.6 +
      SIMILARITY(COALESCE(street_address || ' ' || city || ' ' || state, ''), 
                 COALESCE(bill_record.street_address || ' ' || bill_record.city || ' ' || bill_record.state, '')) * 0.4
    INTO final_user_id, calculated_match_score
    FROM profiles 
    WHERE account_type = 'business'
      AND business_legal_name IS NOT NULL
    ORDER BY (
      SIMILARITY(normalize_business_name(business_legal_name), normalize_business_name(bill_record.business_legal_name)) * 0.6 +
      SIMILARITY(COALESCE(street_address || ' ' || city || ' ' || state, ''), 
                 COALESCE(bill_record.street_address || ' ' || bill_record.city || ' ' || bill_record.state, '')) * 0.4
    ) DESC
    LIMIT 1;
    
    match_details := jsonb_build_object('type', 'business_legacy', 'business_name_match', true);
  
  ELSE
    SELECT 
      id,
      SIMILARITY(COALESCE(last_name, ''), COALESCE(bill_record.last_name, '')) * 0.4 +
      SIMILARITY(COALESCE(street_address || ' ' || city || ' ' || state, ''), 
                 COALESCE(bill_record.street_address || ' ' || bill_record.city || ' ' || bill_record.state, '')) * 0.6
    INTO final_user_id, calculated_match_score
    FROM profiles 
    WHERE account_type = 'resident'
    ORDER BY (
      SIMILARITY(COALESCE(last_name, ''), COALESCE(bill_record.last_name, '')) * 0.4 +
      SIMILARITY(COALESCE(street_address || ' ' || city || ' ' || state, ''), 
                 COALESCE(bill_record.street_address || ' ' || bill_record.city || ' ' || bill_record.state, '')) * 0.6
    ) DESC
    LIMIT 1;
    
    match_details := jsonb_build_object('type', 'personal_legacy', 'name_match', true);
  END IF;

  -- Update bill based on match score
  IF final_user_id IS NOT NULL AND calculated_match_score >= 0.70 THEN
    -- High confidence match - auto assign
    UPDATE master_bills 
    SET 
      profile_id = final_user_id,
      user_id = final_user_id,
      assignment_status = 'assigned',
      match_score = calculated_match_score,
      match_criteria_details = match_details,
      requires_review = false,
      updated_at = now()
    WHERE bill_id = input_bill_id;
  
  ELSIF final_user_id IS NOT NULL AND calculated_match_score BETWEEN 0.30 AND 0.69 THEN
    -- Medium confidence - requires manual review
    UPDATE master_bills 
    SET 
      profile_id = final_user_id,
      user_id = final_user_id,
      assignment_status = 'pending_review',
      match_score = calculated_match_score,
      requires_review = true,
      match_criteria_details = match_details,
      updated_at = now()
    WHERE bill_id = input_bill_id;
  
  ELSE
    -- Low confidence or no match
    UPDATE master_bills 
    SET 
      assignment_status = 'unassigned',
      match_score = COALESCE(calculated_match_score, 0),
      match_criteria_details = match_details,
      updated_at = now()
    WHERE bill_id = input_bill_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;