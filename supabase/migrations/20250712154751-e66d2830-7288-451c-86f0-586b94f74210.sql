-- Create 30 master bills with proper category/subcategory matching
WITH merchant_cycle AS (
  SELECT 
    id as merchant_id,
    ROW_NUMBER() OVER (ORDER BY created_at) as merchant_order
  FROM merchants 
  WHERE user_id = '24ed7570-d3ff-4015-abed-8dec75318b44'
),
merchant_count AS (
  SELECT COUNT(*) as total_merchants FROM merchant_cycle
),
bill_series AS (
  SELECT 
    generate_series as bill_number,
    -- Cycle through merchants
    (SELECT merchant_id FROM merchant_cycle 
     WHERE merchant_order = ((generate_series - 1) % (SELECT total_merchants FROM merchant_count)) + 1) as assigned_merchant_id
  FROM generate_series(1, 30)
),
valid_categories AS (
  SELECT 
    bill_number,
    assigned_merchant_id,
    category,
    subcategory
  FROM bill_series,
  LATERAL (
    SELECT 
      category,
      subcategory
    FROM (
      VALUES 
        ('Utilities & Services', 'Water'),
        ('Utilities & Services', 'Sewer'),
        ('Utilities & Services', 'Electric'),
        ('Utilities & Services', 'Trash / Solid Waste / Recycling'),
        ('Property-Related', 'Property Taxes'),
        ('Property-Related', 'Special Assessments'),
        ('Vehicle & Transportation', 'Parking Tickets'),
        ('Vehicle & Transportation', 'Traffic Fines'),
        ('Licensing & Registration', 'Business Licenses'),
        ('Administrative & Civic Fees', 'Public Records Requests (FOIA)'),
        ('Court & Legal', 'Court Fines'),
        ('Community Programs & Education', 'Recreation Program Fees'),
        ('Other Specialized Payments', 'Impact Fees')
    ) as cats(category, subcategory)
    ORDER BY RANDOM()
    LIMIT 1
  ) as random_cat
)
INSERT INTO master_bills (
  bill_id,
  customer_id,
  profile_id,
  user_id,
  external_bill_number,
  external_account_number,
  external_customer_name,
  external_customer_address_line1,
  external_customer_city,
  external_customer_state,
  external_customer_zip_code,
  external_business_name,
  data_source_system,
  amount_due_cents,
  original_amount_cents,
  remaining_balance_cents,
  total_amount_cents,
  late_fee_1_cents,
  late_fee_2_cents,
  late_fee_3_cents,
  merchant_id,
  merchant_fee_profile_id,
  basis_points,
  fixed_fee,
  ach_basis_points,
  ach_fixed_fee,
  category,
  subcategory,
  issue_date,
  due_date,
  past_due_date,
  bill_status,
  payment_status,
  assignment_status,
  data_quality_status,
  idempotency_id,
  created_by_system,
  processing_status,
  validation_status,
  ingestion_timestamp,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as bill_id,
  'f92f7f90-93ac-473e-8753-36cf0ef52df9'::uuid as customer_id,
  '24ed7570-d3ff-4015-abed-8dec75318b44'::uuid as profile_id,
  '24ed7570-d3ff-4015-abed-8dec75318b44'::uuid as user_id,
  'EXT-' || LPAD(vc.bill_number::text, 6, '0') as external_bill_number,
  'ACC-' || LPAD((RANDOM() * 999999)::int::text, 6, '0') as external_account_number,
  
  -- Random customer names
  CASE (RANDOM() * 10)::int
    WHEN 0 THEN 'John Smith'
    WHEN 1 THEN 'Sarah Johnson'
    WHEN 2 THEN 'Michael Brown'
    WHEN 3 THEN 'Jennifer Davis'
    WHEN 4 THEN 'David Wilson'
    WHEN 5 THEN 'Lisa Anderson'
    WHEN 6 THEN 'Robert Taylor'
    WHEN 7 THEN 'Emily Martinez'
    WHEN 8 THEN 'James Garcia'
    ELSE 'Amanda Rodriguez'
  END as external_customer_name,
  
  -- Random addresses
  CASE (RANDOM() * 8)::int
    WHEN 0 THEN '123 Main Street'
    WHEN 1 THEN '456 Oak Avenue'
    WHEN 2 THEN '789 Pine Road'
    WHEN 3 THEN '321 Elm Drive'
    WHEN 4 THEN '654 Maple Lane'
    WHEN 5 THEN '987 Cedar Court'
    WHEN 6 THEN '147 Birch Way'
    ELSE '258 Spruce Boulevard'
  END as external_customer_address_line1,
  
  CASE (RANDOM() * 6)::int
    WHEN 0 THEN 'Springfield'
    WHEN 1 THEN 'Franklin'
    WHEN 2 THEN 'Georgetown'
    WHEN 3 THEN 'Madison'
    WHEN 4 THEN 'Riverside'
    ELSE 'Oakville'
  END as external_customer_city,
  
  CASE (RANDOM() * 5)::int
    WHEN 0 THEN 'CA'
    WHEN 1 THEN 'TX'
    WHEN 2 THEN 'FL'
    WHEN 3 THEN 'NY'
    ELSE 'IL'
  END as external_customer_state,
  
  LPAD((10000 + RANDOM() * 89999)::int::text, 5, '0') as external_customer_zip_code,
  
  -- Random business names
  CASE (RANDOM() * 8)::int
    WHEN 0 THEN 'City Water Department'
    WHEN 1 THEN 'Metro Electric Utility'
    WHEN 2 THEN 'Municipal Waste Services'
    WHEN 3 THEN 'Downtown Parking Authority'
    WHEN 4 THEN 'County Tax Office'
    WHEN 5 THEN 'City Planning Department'
    WHEN 6 THEN 'Public Works Division'
    ELSE 'Municipal Court Services'
  END as external_business_name,
  
  'LEGACY_IMPORT' as data_source_system,
  
  -- Financial data
  (2500 + RANDOM() * 47500)::bigint as amount_due_cents,
  (2500 + RANDOM() * 47500)::bigint as original_amount_cents,
  CASE 
    WHEN RANDOM() < 0.7 THEN (2500 + RANDOM() * 47500)::bigint
    ELSE 0
  END as remaining_balance_cents,
  (2500 + RANDOM() * 47500 + 
   CASE WHEN RANDOM() < 0.3 THEN (500 + RANDOM() * 1500)::int ELSE 0 END)::bigint as total_amount_cents,
   
  -- Late fees
  CASE WHEN RANDOM() < 0.3 THEN (500 + RANDOM() * 1000)::bigint ELSE 0 END as late_fee_1_cents,
  CASE WHEN RANDOM() < 0.15 THEN (500 + RANDOM() * 1000)::bigint ELSE 0 END as late_fee_2_cents,
  CASE WHEN RANDOM() < 0.05 THEN (500 + RANDOM() * 1000)::bigint ELSE 0 END as late_fee_3_cents,
  
  -- Merchant and fee data
  vc.assigned_merchant_id as merchant_id,
  mfp.id as merchant_fee_profile_id,
  mfp.basis_points,
  mfp.fixed_fee,
  mfp.ach_basis_points,
  mfp.ach_fixed_fee,
  
  -- Valid categories
  vc.category,
  vc.subcategory,
  
  -- Dates
  NOW() - INTERVAL '1 day' * (RANDOM() * 180)::int as issue_date,
  NOW() - INTERVAL '1 day' * (RANDOM() * 180)::int + INTERVAL '30 days' as due_date,
  NOW() - INTERVAL '1 day' * (RANDOM() * 180)::int + INTERVAL '45 days' as past_due_date,
  
  -- Status fields
  CASE (RANDOM() * 3)::int
    WHEN 0 THEN 'unpaid'::bill_status_enum
    WHEN 1 THEN 'overdue'::bill_status_enum
    ELSE 'paid'::bill_status_enum
  END as bill_status,
  
  CASE (RANDOM() * 3)::int
    WHEN 0 THEN 'unpaid'::payment_status_enum
    WHEN 1 THEN 'partially_paid'::payment_status_enum
    ELSE 'paid'::payment_status_enum
  END as payment_status,
  
  'assigned'::assignment_status_enum as assignment_status,
  'validated'::data_quality_status_enum as data_quality_status,
  
  -- System fields
  'IMP-' || encode(gen_random_bytes(16), 'hex') as idempotency_id,
  'BILL_GENERATOR_v1.0' as created_by_system,
  'processed' as processing_status,
  'validated' as validation_status,
  
  -- Timestamps
  NOW() - INTERVAL '1 day' * (RANDOM() * 30)::int as ingestion_timestamp,
  NOW() as created_at,
  NOW() as updated_at

FROM valid_categories vc
LEFT JOIN merchant_fee_profiles mfp ON mfp.merchant_id = vc.assigned_merchant_id;