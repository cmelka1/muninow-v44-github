-- Create test licenses for ssmith94@gmail.com using existing Lakewood customer
-- Update user profile with customer_id and create supporting data

DO $$
DECLARE
  v_user_id UUID := 'a4e30f26-0310-4d4c-9b1a-8d25f06721da';
  v_customer_id UUID := '8fef8f5f-0c6b-4cf0-92f7-f41b14145d48'; -- Lakewood
  v_merchant_id UUID;
  v_license_type_id UUID;
BEGIN
  -- Update user profile with customer_id
  UPDATE public.profiles
  SET customer_id = v_customer_id
  WHERE id = v_user_id AND customer_id IS NULL;

  -- Check if Business Licenses merchant exists for this customer
  SELECT id INTO v_merchant_id
  FROM public.merchants
  WHERE customer_id = v_customer_id AND subcategory = 'Business Licenses'
  LIMIT 1;

  -- Create merchant if it doesn't exist
  IF v_merchant_id IS NULL THEN
    INSERT INTO public.merchants (
      user_id, customer_id, merchant_name, business_name, doing_business_as,
      business_type, business_tax_id, statement_descriptor, category, subcategory,
      business_phone, business_description, ownership_type,
      business_address_line1, business_address_city, business_address_state,
      business_address_zip_code, business_address_country,
      owner_first_name, owner_last_name, owner_job_title, owner_work_email,
      owner_personal_phone, owner_personal_address_line1, owner_personal_address_city,
      owner_personal_address_state, owner_personal_address_zip_code, owner_personal_address_country,
      mcc_code, refund_policy, merchant_agreement_accepted, merchant_agreement_timestamp,
      merchant_agreement_ip_address, merchant_agreement_user_agent,
      customer_first_name, customer_last_name, customer_email, customer_phone,
      customer_street_address, customer_city, customer_state, customer_zip_code, customer_country
    ) VALUES (
      v_user_id, v_customer_id, 'Lakewood Business Licenses', 'Village of Lakewood', 'Lakewood Business Licenses',
      'GOVERNMENT_AGENCY', '34-1234567', 'Lakewood Biz Lic', 'Licensing & Registration', 'Business Licenses',
      '216-555-0100', 'Business license processing for Village of Lakewood', 'public',
      '14701 Detroit Avenue', 'Lakewood', 'OH', '44107', 'USA',
      'City', 'Administrator', 'Administrator', 'admin@lakewoodoh.gov',
      '216-555-0100', '14701 Detroit Avenue', 'Lakewood', 'OH', '44107', 'USA',
      '9399', 'NO_REFUNDS', true, NOW(), '127.0.0.1', 'System',
      'City', 'Administrator', 'admin@lakewoodoh.gov', '216-555-0100',
      '14701 Detroit Avenue', 'Lakewood', 'OH', '44107', 'USA'
    ) RETURNING id INTO v_merchant_id;
  END IF;

  -- Check if license type exists
  SELECT id INTO v_license_type_id
  FROM public.municipal_business_license_types
  WHERE customer_id = v_customer_id
  LIMIT 1;

  -- Create license type if it doesn't exist
  IF v_license_type_id IS NULL THEN
    INSERT INTO public.municipal_business_license_types (
      customer_id, merchant_id, municipal_label, base_fee_cents, is_active, is_custom, display_order
    ) VALUES (
      v_customer_id, v_merchant_id, 'General Business License', 7500, true, false, 1
    ) RETURNING id INTO v_license_type_id;
  END IF;

  -- Insert 5 test licenses with various expiration scenarios
  INSERT INTO public.business_license_applications (
    user_id, customer_id, merchant_id, license_type_id, application_status, renewal_status,
    business_legal_name, doing_business_as, business_type, business_street_address,
    business_city, business_state, business_zip_code, owner_first_name, owner_last_name,
    owner_street_address, owner_city, owner_state, owner_zip_code, license_number,
    expires_at, issued_at, original_issue_date, base_amount_cents, total_amount_cents, payment_status
  ) VALUES
  -- License 1: Expired 60 days ago
  (v_user_id, v_customer_id, v_merchant_id, v_license_type_id, 'issued', 'active',
   'Test Business 1 LLC', 'Test Biz 1', 'LLC', '123 Test St', 'Lakewood', 'OH', '44107',
   'Sean', 'Smith', '456 Home Ave', 'Lakewood', 'OH', '44107', 'LAK-2024-TEST-001',
   NOW() - INTERVAL '60 days', NOW() - INTERVAL '1 year 60 days', NOW() - INTERVAL '1 year 60 days', 
   7500, 7500, 'paid'),
  -- License 2: Expiring in 25 days
  (v_user_id, v_customer_id, v_merchant_id, v_license_type_id, 'issued', 'active',
   'Test Business 2 LLC', 'Test Biz 2', 'LLC', '124 Test St', 'Lakewood', 'OH', '44107',
   'Sean', 'Smith', '456 Home Ave', 'Lakewood', 'OH', '44107', 'LAK-2024-TEST-002',
   NOW() + INTERVAL '25 days', NOW() - INTERVAL '340 days', NOW() - INTERVAL '340 days',
   7500, 7500, 'paid'),
  -- License 3: Expiring in 15 days
  (v_user_id, v_customer_id, v_merchant_id, v_license_type_id, 'issued', 'active',
   'Test Business 3 LLC', 'Test Biz 3', 'LLC', '125 Test St', 'Lakewood', 'OH', '44107',
   'Sean', 'Smith', '456 Home Ave', 'Lakewood', 'OH', '44107', 'LAK-2024-TEST-003',
   NOW() + INTERVAL '15 days', NOW() - INTERVAL '350 days', NOW() - INTERVAL '350 days',
   7500, 7500, 'paid'),
  -- License 4: Expiring in 90 days (still active)
  (v_user_id, v_customer_id, v_merchant_id, v_license_type_id, 'issued', 'active',
   'Test Business 4 LLC', 'Test Biz 4', 'LLC', '126 Test St', 'Lakewood', 'OH', '44107',
   'Sean', 'Smith', '456 Home Ave', 'Lakewood', 'OH', '44107', 'LAK-2024-TEST-004',
   NOW() + INTERVAL '90 days', NOW() - INTERVAL '275 days', NOW() - INTERVAL '275 days',
   7500, 7500, 'paid'),
  -- License 5: Edge case - exactly 30 days
  (v_user_id, v_customer_id, v_merchant_id, v_license_type_id, 'issued', 'active',
   'Test Business 5 LLC', 'Test Biz 5', 'LLC', '127 Test St', 'Lakewood', 'OH', '44107',
   'Sean', 'Smith', '456 Home Ave', 'Lakewood', 'OH', '44107', 'LAK-2024-TEST-005',
   NOW() + INTERVAL '30 days', NOW() - INTERVAL '335 days', NOW() - INTERVAL '335 days',
   7500, 7500, 'paid');

  RAISE NOTICE 'Successfully created 5 test business licenses for ssmith94@gmail.com';
END $$;