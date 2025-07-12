-- Backfill new payment_history columns from master_bills data
UPDATE public.payment_history 
SET 
  -- Merchant Information
  merchant_name = mb.merchant_name,
  category = mb.category,
  subcategory = mb.subcategory,
  doing_business_as = mb.doing_business_as,
  statement_descriptor = mb.statement_descriptor,
  
  -- Bill Identification & External Data
  external_bill_number = mb.external_bill_number,
  external_account_number = mb.external_account_number,
  data_source_system = mb.data_source_system,
  external_business_name = mb.external_business_name,
  external_customer_name = mb.external_customer_name,
  external_customer_address_line1 = mb.external_customer_address_line1,
  external_customer_city = mb.external_customer_city,
  external_customer_state = mb.external_customer_state,
  external_customer_zip_code = mb.external_customer_zip_code,
  
  -- Customer Information
  customer_first_name = mb.first_name,
  customer_last_name = mb.last_name,
  customer_email = mb.email,
  customer_street_address = mb.street_address,
  customer_apt_number = mb.apt_number,
  customer_city = mb.city,
  customer_state = mb.state,
  customer_zip_code = mb.zip_code,
  
  -- Business Legal Information
  business_legal_name = mb.business_legal_name,
  business_address_line1 = mb.business_address_line1,
  business_city = mb.business_city,
  business_state = mb.business_state,
  business_zip_code = mb.business_zip_code,
  entity_type = mb.entity_type,
  
  -- Key Bill Details
  bill_type = mb.type,
  issue_date = mb.issue_date,
  due_date = mb.due_date,
  original_amount_cents = mb.original_amount_cents,
  payment_status = mb.payment_status::text,
  bill_status = mb.bill_status::text
FROM public.master_bills mb
WHERE payment_history.bill_id = mb.bill_id;