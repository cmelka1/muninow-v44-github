-- Create 20 test bills for cmelka@gmail.com with correct merchant and customer IDs
INSERT INTO master_bills (
  customer_id,
  user_id,
  merchant_id,
  merchant_name,
  category,
  external_bill_number,
  data_source_system,
  amount_due_cents,
  original_amount_cents,
  remaining_balance_cents,
  total_amount_cents,
  payment_status,
  bill_status,
  issue_date,
  due_date,
  street_address,
  city,
  state,
  zip_code,
  first_name,
  last_name,
  business_legal_name
) VALUES
-- Bills using MuniNow Licensing merchant (4ffd550f-edcd-4f48-8565-f8401c197209)
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '4ffd550f-edcd-4f48-8565-f8401c197209', 'MuniNow Licensing', 'Business License', 'LIC-2024-001', 'municipal_system', 35000, 35000, 35000, 35000, 'unpaid', 'unpaid', NOW() - INTERVAL '30 days', NOW() + INTERVAL '15 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '4ffd550f-edcd-4f48-8565-f8401c197209', 'MuniNow Licensing', 'Operating Permit', 'LIC-2024-002', 'municipal_system', 15000, 15000, 15000, 15000, 'unpaid', 'unpaid', NOW() - INTERVAL '25 days', NOW() + INTERVAL '20 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '4ffd550f-edcd-4f48-8565-f8401c197209', 'MuniNow Licensing', 'Health Permit', 'LIC-2024-003', 'municipal_system', 8500, 8500, 8500, 8500, 'unpaid', 'unpaid', NOW() - INTERVAL '20 days', NOW() + INTERVAL '25 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '4ffd550f-edcd-4f48-8565-f8401c197209', 'MuniNow Licensing', 'Fire Safety Certificate', 'LIC-2024-004', 'municipal_system', 12000, 12000, 12000, 12000, 'unpaid', 'unpaid', NOW() - INTERVAL '15 days', NOW() + INTERVAL '30 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '4ffd550f-edcd-4f48-8565-f8401c197209', 'MuniNow Licensing', 'Building Permit', 'LIC-2024-005', 'municipal_system', 45000, 45000, 45000, 45000, 'unpaid', 'unpaid', NOW() - INTERVAL '10 days', NOW() + INTERVAL '35 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '4ffd550f-edcd-4f48-8565-f8401c197209', 'MuniNow Licensing', 'Signage Permit', 'LIC-2024-006', 'municipal_system', 7500, 7500, 7500, 7500, 'unpaid', 'unpaid', NOW() - INTERVAL '35 days', NOW() - INTERVAL '5 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '4ffd550f-edcd-4f48-8565-f8401c197209', 'MuniNow Licensing', 'Zoning Compliance', 'LIC-2024-007', 'municipal_system', 22000, 22000, 22000, 22000, 'unpaid', 'unpaid', NOW() - INTERVAL '40 days', NOW() - INTERVAL '10 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),

-- Bills using MuniNow Ticketing merchant (dfc7782d-6e2a-4201-9c12-35c8925add4b)
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', 'dfc7782d-6e2a-4201-9c12-35c8925add4b', 'MuniNow Ticketing', 'Parking Violation', 'TKT-2024-001', 'municipal_system', 5000, 5000, 5000, 5000, 'unpaid', 'unpaid', NOW() - INTERVAL '12 days', NOW() + INTERVAL '18 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', 'dfc7782d-6e2a-4201-9c12-35c8925add4b', 'MuniNow Ticketing', 'Speed Camera Fine', 'TKT-2024-002', 'municipal_system', 15000, 15000, 15000, 15000, 'unpaid', 'unpaid', NOW() - INTERVAL '18 days', NOW() + INTERVAL '12 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', 'dfc7782d-6e2a-4201-9c12-35c8925add4b', 'MuniNow Ticketing', 'Red Light Violation', 'TKT-2024-003', 'municipal_system', 25000, 25000, 25000, 25000, 'unpaid', 'unpaid', NOW() - INTERVAL '22 days', NOW() + INTERVAL '8 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', 'dfc7782d-6e2a-4201-9c12-35c8925add4b', 'MuniNow Ticketing', 'Equipment Violation', 'TKT-2024-004', 'municipal_system', 8000, 8000, 8000, 8000, 'unpaid', 'unpaid', NOW() - INTERVAL '28 days', NOW() + INTERVAL '2 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', 'dfc7782d-6e2a-4201-9c12-35c8925add4b', 'MuniNow Ticketing', 'Commercial Vehicle Fine', 'TKT-2024-005', 'municipal_system', 35000, 35000, 35000, 35000, 'unpaid', 'unpaid', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', 'dfc7782d-6e2a-4201-9c12-35c8925add4b', 'MuniNow Ticketing', 'Overtime Parking', 'TKT-2024-006', 'municipal_system', 3500, 3500, 3500, 3500, 'unpaid', 'unpaid', NOW() - INTERVAL '32 days', NOW() - INTERVAL '2 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),

-- Bills using MuniNow Taxes merchant (70111580-dfcb-4b3c-b460-7d798e9a0870)
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '70111580-dfcb-4b3c-b460-7d798e9a0870', 'MuniNow Taxes', 'Property Tax', 'TAX-2024-001', 'municipal_system', 125000, 125000, 125000, 125000, 'unpaid', 'unpaid', NOW() - INTERVAL '45 days', NOW() + INTERVAL '30 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '70111580-dfcb-4b3c-b460-7d798e9a0870', 'MuniNow Taxes', 'Business Personal Property Tax', 'TAX-2024-002', 'municipal_system', 87500, 87500, 87500, 87500, 'unpaid', 'unpaid', NOW() - INTERVAL '50 days', NOW() + INTERVAL '25 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '70111580-dfcb-4b3c-b460-7d798e9a0870', 'MuniNow Taxes', 'Sales Tax Assessment', 'TAX-2024-003', 'municipal_system', 42000, 42000, 42000, 42000, 'unpaid', 'unpaid', NOW() - INTERVAL '38 days', NOW() + INTERVAL '7 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '70111580-dfcb-4b3c-b460-7d798e9a0870', 'MuniNow Taxes', 'Occupancy Tax', 'TAX-2024-004', 'municipal_system', 18500, 18500, 18500, 18500, 'unpaid', 'unpaid', NOW() - INTERVAL '25 days', NOW() + INTERVAL '20 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '70111580-dfcb-4b3c-b460-7d798e9a0870', 'MuniNow Taxes', 'Franchise Tax', 'TAX-2024-005', 'municipal_system', 65000, 65000, 65000, 65000, 'unpaid', 'unpaid', NOW() - INTERVAL '15 days', NOW() + INTERVAL '40 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.'),
('c91b1234-5678-9012-3456-789012345678', '24ed7570-d3ff-4015-abed-8dec75318b44', '70111580-dfcb-4b3c-b460-7d798e9a0870', 'MuniNow Taxes', 'Special Assessment', 'TAX-2024-006', 'municipal_system', 28000, 28000, 28000, 28000, 'unpaid', 'unpaid', NOW() - INTERVAL '60 days', NOW() - INTERVAL '15 days', '123 Main St', 'Springfield', 'IL', '62701', 'Charles', 'Melka', 'Muni Now, Inc.');