-- Add 73 missing business license types for Hinsdale
-- Each type will have a $75 base fee (7500 cents)

DO $$
DECLARE
  v_customer_id UUID := '733f852f-aba8-4708-842d-5a1d91f758fe';
  v_merchant_id UUID := '83019004-7452-4dff-bedd-98f3112783d3';
  v_merchant_name TEXT := 'Hinsdale Licenses';
BEGIN
  -- Professional Services
  PERFORM create_municipal_business_license_type(v_customer_id, 'Advertising Agencies', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Architects', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Audio-Visual Consultants', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Audio-Visual Production', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Career & Vocational Counseling', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Employment Agencies', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Graphic Design', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Handwriting Analysts', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Marketing / Communications', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Mortgage / Loans', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Newspapers', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Printer / Publisher', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Real Estate', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  
  -- Medical/Healthcare
  PERFORM create_municipal_business_license_type(v_customer_id, 'Animal Hospital', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Audiologists', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Dentists', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Opticians', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Optometrists', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Pharmacies', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Physicians', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Psychologists', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  
  -- Retail
  PERFORM create_municipal_business_license_type(v_customer_id, 'Antiques', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Art Galleries & Dealers', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Bicycle Dealers', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Bridal Shops', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Carpet & Rug Dealers', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Clothing', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Fireplaces', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Florists', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Gift Shops', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Greenhouses', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Hardware Stores', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Liquor Stores', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Shoes', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Shopping', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Sporting Goods', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Stationer''s Supplies', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Toys', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Video Rentals', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  
  -- Food & Beverage
  PERFORM create_municipal_business_license_type(v_customer_id, 'Beverage Services', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Caterers', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Groceries', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Restaurants', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  
  -- Automotive
  PERFORM create_municipal_business_license_type(v_customer_id, 'Auto Dealers', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Auto Service', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Limousine Services', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Service Stations', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  
  -- Personal Care
  PERFORM create_municipal_business_license_type(v_customer_id, 'Beauty Salons', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Carpet & Rug Cleaners', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Cleaners / Laundry / Tailors', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Hairstylists / Barbers', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Health & Fitness', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Pet Grooming', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Shoe Repair', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  
  -- Construction/Trades
  PERFORM create_municipal_business_license_type(v_customer_id, 'Building Contractors', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Heating & Cooling Contractors', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Paving Contractors', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Plumbers', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Water Heaters', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  
  -- Education & Training
  PERFORM create_municipal_business_license_type(v_customer_id, 'Driving Instruction', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Language Schools', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Schools / Education', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Tutoring', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  
  -- Community Services
  PERFORM create_municipal_business_license_type(v_customer_id, 'Child Care', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Churches / Houses of Worship', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Clubs / Organizations', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Emergency Services', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Funeral Homes', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Library', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Public Safety', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Public Services', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Public Transportation', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Youth Organizations', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  
  -- Business Services & Other
  PERFORM create_municipal_business_license_type(v_customer_id, 'Apartments', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Banks / Financial Services', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Photographers', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Post Office / Shipping', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  PERFORM create_municipal_business_license_type(v_customer_id, 'Travel Agencies', 7500, NULL, v_merchant_id, v_merchant_name, true, 999);
  
  RAISE NOTICE 'Successfully added 73 business license types for Hinsdale';
END $$;