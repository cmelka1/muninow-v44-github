-- Update master_bills with customer information from customers table
UPDATE master_bills 
SET 
  legal_entity_name = c.legal_entity_name,
  doing_business_as = c.doing_business_as,
  entity_type = c.entity_type,
  business_address_line1 = c.business_address_line1,
  business_address_line2 = c.business_address_line2,
  business_city = c.business_city,
  business_state = c.business_state,
  business_zip_code = c.business_zip_code,
  updated_at = NOW()
FROM customers c
WHERE master_bills.customer_id = c.customer_id
  AND master_bills.customer_id = 'f92f7f90-93ac-473e-8753-36cf0ef52df9'
  AND master_bills.user_id = '24ed7570-d3ff-4015-abed-8dec75318b44'
  AND master_bills.created_by_system = 'BILL_GENERATOR_v1.0';