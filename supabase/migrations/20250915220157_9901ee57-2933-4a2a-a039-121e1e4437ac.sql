-- Update municipal_service_applications to assign merchant_id when status changes to approved
-- This ensures service applications have the correct merchant for payment processing

CREATE OR REPLACE FUNCTION assign_merchant_to_service_application()
RETURNS TRIGGER AS $$
DECLARE
  default_merchant_id UUID;
BEGIN
  -- Only assign merchant when status changes to 'approved' and merchant_id is null
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.merchant_id IS NULL THEN
    -- Find the "Other" subcategory merchant for this customer
    SELECT id INTO default_merchant_id
    FROM merchants
    WHERE customer_id = NEW.customer_id 
      AND subcategory = 'Other'
    LIMIT 1;
    
    -- If we found a merchant, assign it
    IF default_merchant_id IS NOT NULL THEN
      NEW.merchant_id = default_merchant_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically assign merchant on approval
DROP TRIGGER IF EXISTS trigger_assign_merchant_to_service_application ON municipal_service_applications;
CREATE TRIGGER trigger_assign_merchant_to_service_application
  BEFORE UPDATE ON municipal_service_applications
  FOR EACH ROW
  EXECUTE FUNCTION assign_merchant_to_service_application();

-- Also ensure existing approved applications get assigned merchants
UPDATE municipal_service_applications
SET merchant_id = (
  SELECT id FROM merchants 
  WHERE customer_id = municipal_service_applications.customer_id 
    AND subcategory = 'Other'
  LIMIT 1
)
WHERE status = 'approved' 
  AND merchant_id IS NULL
  AND EXISTS (
    SELECT 1 FROM merchants 
    WHERE customer_id = municipal_service_applications.customer_id 
      AND subcategory = 'Other'
  );