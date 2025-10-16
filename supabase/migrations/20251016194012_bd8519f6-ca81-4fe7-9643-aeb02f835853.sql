-- Phase 1: Business License Renewal - Database Schema Changes (Fixed)

-- 1. Add renewal tracking columns to business_license_applications
ALTER TABLE business_license_applications
  ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN original_issue_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN renewal_status TEXT DEFAULT 'active',
  ADD COLUMN parent_license_id UUID REFERENCES business_license_applications(id),
  ADD COLUMN is_renewal BOOLEAN DEFAULT false,
  ADD COLUMN renewal_generation INTEGER DEFAULT 0,
  ADD COLUMN renewal_notified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN renewal_reminder_count INTEGER DEFAULT 0;

-- Add check constraint for renewal_status
ALTER TABLE business_license_applications
  ADD CONSTRAINT check_renewal_status 
  CHECK (renewal_status IN ('active', 'expiring_soon', 'expired', 'renewed', 'grace_period'));

-- 2. Backfill existing issued licenses with expiration dates
UPDATE business_license_applications
SET 
  original_issue_date = COALESCE(issued_at, approved_at, created_at),
  expires_at = COALESCE(issued_at, approved_at, created_at) + INTERVAL '1 year',
  renewal_status = 'active'
WHERE application_status = 'issued'
  AND expires_at IS NULL;

-- 3. Add constraint: issued licenses must have expiration (now safe after backfill)
ALTER TABLE business_license_applications
  ADD CONSTRAINT check_issued_has_expiration
  CHECK ((application_status != 'issued') OR (expires_at IS NOT NULL));

-- 4. Create indexes for performance
CREATE INDEX idx_licenses_expiring 
  ON business_license_applications(expires_at, renewal_status) 
  WHERE renewal_status IN ('active', 'expiring_soon', 'grace_period');

CREATE INDEX idx_parent_license 
  ON business_license_applications(parent_license_id) 
  WHERE parent_license_id IS NOT NULL;

CREATE INDEX idx_renewal_notifications
  ON business_license_applications(user_id, expires_at, renewal_notified_at)
  WHERE renewal_status = 'expiring_soon';

-- 5. Create trigger function for auto-setting expiration dates
CREATE OR REPLACE FUNCTION set_license_expiration()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only set expiration when status changes TO 'issued'
  IF NEW.application_status = 'issued' AND (OLD.application_status IS NULL OR OLD.application_status != 'issued') THEN
    
    -- For renewals, use original_issue_date anniversary
    IF NEW.is_renewal = true AND NEW.original_issue_date IS NOT NULL THEN
      NEW.expires_at = NEW.original_issue_date + INTERVAL '1 year' * (NEW.renewal_generation + 1);
    
    -- For new licenses, set expiration 1 year from now and record original issue date
    ELSE
      NEW.original_issue_date = NOW();
      NEW.expires_at = NOW() + INTERVAL '1 year';
    END IF;
    
    NEW.renewal_status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER trigger_set_license_expiration
  BEFORE UPDATE ON business_license_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_license_expiration();

-- 6. Create business_license_renewal_history table
CREATE TABLE business_license_renewal_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_license_id UUID REFERENCES business_license_applications(id) NOT NULL,
  renewed_license_id UUID REFERENCES business_license_applications(id) NOT NULL,
  renewal_generation INTEGER NOT NULL,
  renewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  renewed_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Enable RLS on renewal history table
ALTER TABLE business_license_renewal_history ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for renewal history

-- Users can view their own renewal history
CREATE POLICY "Users can view their renewal history"
  ON business_license_renewal_history FOR SELECT
  USING (
    renewed_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM business_license_applications
      WHERE id = original_license_id AND user_id = auth.uid()
    )
  );

-- Municipal users can view renewal history for their customer
CREATE POLICY "Municipal users can view renewal history for their customer"
  ON business_license_renewal_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_license_applications bla
      JOIN profiles p ON p.id = auth.uid()
      WHERE bla.id = original_license_id 
        AND bla.customer_id = p.customer_id
        AND p.account_type IN ('municipal', 'municipaladmin', 'municipaluser')
    )
  );

-- Super admins can view all renewal history
CREATE POLICY "Super admins can view all renewal history"
  ON business_license_renewal_history FOR SELECT
  USING (is_current_user_super_admin());