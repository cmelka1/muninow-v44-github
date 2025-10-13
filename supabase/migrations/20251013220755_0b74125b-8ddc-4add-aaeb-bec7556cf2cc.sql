-- Enable payment collection for approved reviewable service applications
CREATE OR REPLACE FUNCTION enable_payment_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When a service application is approved, check if payment is needed
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    -- Check if the service tile has a fee
    IF EXISTS (
      SELECT 1 FROM municipal_service_tiles 
      WHERE id = NEW.tile_id 
      AND (amount_cents > 0 OR allow_user_defined_amount = true)
    ) THEN
      -- Enable payment for this application
      NEW.payment_status := 'unpaid';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enable_payment_on_service_approval
  BEFORE UPDATE ON municipal_service_applications
  FOR EACH ROW
  EXECUTE FUNCTION enable_payment_on_approval();