-- Update validation function to use "Building Permits" instead of "Permit Fees"
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
      RETURN p_subcategory IN ('Property Taxes', 'Special Assessments', 'Lien Payments', 'Building Permits', 'Zoning & Planning Fees', 'Code Violation Fines', 'HOA Dues');
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

-- Update existing data to use "Building Permits" instead of "Permit Fees"
UPDATE merchants 
SET subcategory = 'Building Permits' 
WHERE subcategory = 'Permit Fees';

UPDATE master_bills 
SET subcategory = 'Building Permits' 
WHERE subcategory = 'Permit Fees';