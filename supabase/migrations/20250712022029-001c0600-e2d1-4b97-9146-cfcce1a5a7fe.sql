-- Create validation function for merchant categories
CREATE OR REPLACE FUNCTION validate_merchant_category_subcategory(p_category text, p_subcategory text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Validate category and subcategory combinations based on merchant form structure
  CASE p_category
    WHEN 'Utilities & Services' THEN
      RETURN p_subcategory IN ('Water', 'Sewer', 'Stormwater', 'Trash / Solid Waste / Recycling', 'Electric', 'Natural Gas');
    WHEN 'Property-Related' THEN
      RETURN p_subcategory IN ('Property Taxes', 'Special Assessments', 'Lien Payments', 'Permit Fees', 'Zoning & Planning Fees', 'Code Violation Fines', 'HOA Dues');
    WHEN 'Vehicle & Transportation' THEN
      RETURN p_subcategory IN ('Parking Tickets', 'Parking Permits', 'Vehicle Stickers', 'Traffic Fines', 'Toll or Bridge Fees');
    WHEN 'Licensing & Registration' THEN
      RETURN p_subcategory IN ('Business Licenses', 'Pet Licenses', 'Rental Property Registration', 'Short-Term Rental Permits', 'Solicitor Permits', 'Liquor Licenses');
    WHEN 'Administrative & Civic Fees' THEN
      RETURN p_subcategory IN ('Public Records Requests (FOIA)', 'Notary Services', 'Document Certification', 'Copy & Printing Fees');
    WHEN 'Court & Legal' THEN
      RETURN p_subcategory IN ('Court Fines', 'Probation Fees', 'Warrants / Bonds', 'Restitution Payments', 'Court Filing Fees');
    WHEN 'Community Programs & Education' THEN
      RETURN p_subcategory IN ('Recreation Program Fees', 'Library Fines or Fees', 'Facility Rentals');
    WHEN 'Police / Fire / Emergency Services' THEN
      RETURN p_subcategory IN ('False Alarm Fines', 'Fire Inspection Fees', 'Police Reports', 'Fingerprinting / Background Checks');
    WHEN 'Health & Sanitation' THEN
      RETURN p_subcategory IN ('Health Permits', 'Septic Tank Inspection Fees', 'Food Safety Licenses');
    WHEN 'Other Specialized Payments' THEN
      RETURN p_subcategory IN ('Impact Fees', 'Development Review Fees', 'Tree Removal / Arborist Permits', 'Cemetery Plot or Burial Fees', 'Inspections', 'Consulting');
    WHEN 'Other' THEN
      RETURN p_subcategory = 'Other';
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Fix existing data: Map common misaligned categories to correct structure
UPDATE master_bills 
SET 
  category = CASE 
    WHEN category = 'Business Licenses' THEN 'Licensing & Registration'
    WHEN category = 'Property Taxes' THEN 'Property-Related'
    WHEN category = 'Traffic Fines' THEN 'Vehicle & Transportation'
    WHEN category = 'Court Fines' THEN 'Court & Legal'
    WHEN category = 'Water' THEN 'Utilities & Services'
    WHEN category = 'Sewer' THEN 'Utilities & Services'
    WHEN category = 'Electric' THEN 'Utilities & Services'
    WHEN category = 'Parking Tickets' THEN 'Vehicle & Transportation'
    WHEN category = 'Health Permits' THEN 'Health & Sanitation'
    WHEN category = 'Pet Licenses' THEN 'Licensing & Registration'
    WHEN category = 'Special Assessments' THEN 'Property-Related'
    WHEN category = 'Permit Fees' THEN 'Property-Related'
    WHEN category = 'False Alarm Fines' THEN 'Police / Fire / Emergency Services'
    WHEN category = 'Recreation Program Fees' THEN 'Community Programs & Education'
    WHEN category = 'Impact Fees' THEN 'Other Specialized Payments'
    WHEN category = 'Development Review Fees' THEN 'Other Specialized Payments'
    WHEN category = 'Inspections' THEN 'Other Specialized Payments'
    WHEN category = 'Consulting' THEN 'Other Specialized Payments'
    ELSE category
  END,
  subcategory = CASE 
    WHEN category = 'Business Licenses' THEN 'Business Licenses'
    WHEN category = 'Property Taxes' THEN 'Property Taxes'
    WHEN category = 'Traffic Fines' THEN 'Traffic Fines'
    WHEN category = 'Court Fines' THEN 'Court Fines'
    WHEN category = 'Water' THEN 'Water'
    WHEN category = 'Sewer' THEN 'Sewer'
    WHEN category = 'Electric' THEN 'Electric'
    WHEN category = 'Parking Tickets' THEN 'Parking Tickets'
    WHEN category = 'Health Permits' THEN 'Health Permits'
    WHEN category = 'Pet Licenses' THEN 'Pet Licenses'
    WHEN category = 'Special Assessments' THEN 'Special Assessments'
    WHEN category = 'Permit Fees' THEN 'Permit Fees'
    WHEN category = 'False Alarm Fines' THEN 'False Alarm Fines'
    WHEN category = 'Recreation Program Fees' THEN 'Recreation Program Fees'
    WHEN category = 'Impact Fees' THEN 'Impact Fees'
    WHEN category = 'Development Review Fees' THEN 'Development Review Fees'
    WHEN category = 'Inspections' THEN 'Inspections'
    WHEN category = 'Consulting' THEN 'Consulting'
    ELSE subcategory
  END
WHERE category IN (
  'Business Licenses', 'Property Taxes', 'Traffic Fines', 'Court Fines', 'Water', 'Sewer', 'Electric',
  'Parking Tickets', 'Health Permits', 'Pet Licenses', 'Special Assessments', 'Permit Fees',
  'False Alarm Fines', 'Recreation Program Fees', 'Impact Fees', 'Development Review Fees',
  'Inspections', 'Consulting'
);

-- Set default values for NULL categories/subcategories
UPDATE master_bills 
SET 
  category = 'Other',
  subcategory = 'Other'
WHERE category IS NULL OR subcategory IS NULL;

-- Add check constraints to ensure valid category/subcategory combinations
ALTER TABLE master_bills 
ADD CONSTRAINT valid_category_subcategory 
CHECK (validate_merchant_category_subcategory(category, subcategory));

-- Add check constraint to ensure category is from valid list
ALTER TABLE master_bills
ADD CONSTRAINT valid_category
CHECK (category IN (
  'Utilities & Services',
  'Property-Related', 
  'Vehicle & Transportation',
  'Licensing & Registration',
  'Administrative & Civic Fees',
  'Court & Legal',
  'Community Programs & Education',
  'Police / Fire / Emergency Services',
  'Health & Sanitation',
  'Other Specialized Payments',
  'Other'
));