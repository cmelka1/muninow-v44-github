-- Phase 1: Create new service application status enum
CREATE TYPE service_application_status_enum AS ENUM (
  'draft',
  'submitted', 
  'under_review',
  'information_requested',
  'approved',
  'denied',
  'paid',
  'completed',
  'withdrawn',
  'expired'
);

-- Phase 2: Backup existing data before dropping table
CREATE TABLE municipal_service_applications_backup AS 
SELECT * FROM municipal_service_applications;

-- Phase 3: Drop existing table and recreate with new structure
DROP TABLE IF EXISTS municipal_service_applications CASCADE;

CREATE TABLE municipal_service_applications (
  -- Core Application Fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number TEXT,
  user_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  tile_id UUID NOT NULL,
  
  -- Applicant Information (extracted from form_data)
  applicant_name TEXT,
  applicant_email TEXT,
  applicant_phone TEXT,
  business_legal_name TEXT,
  
  -- Address Information
  street_address TEXT,
  apt_number TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',
  
  -- Application Status & Workflow
  status service_application_status_enum DEFAULT 'draft',
  assigned_reviewer_id UUID,
  review_notes TEXT,
  
  -- Workflow Timestamps
  submitted_at TIMESTAMPTZ,
  under_review_at TIMESTAMPTZ,
  information_requested_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  denied_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Payment Information
  amount_cents BIGINT,
  service_fee_cents BIGINT DEFAULT 0,
  total_amount_cents BIGINT DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  payment_id UUID,
  payment_method_type TEXT,
  payment_instrument_id TEXT,
  payment_processed_at TIMESTAMPTZ,
  
  -- Finix Integration Fields
  finix_transfer_id TEXT,
  fraud_session_id TEXT,
  idempotency_id TEXT,
  transfer_state TEXT DEFAULT 'PENDING',
  
  -- Merchant & Fee Fields
  merchant_id UUID,
  merchant_name TEXT,
  finix_merchant_id TEXT,
  merchant_finix_identity_id TEXT,
  finix_identity_id TEXT,
  merchant_fee_profile_id UUID,
  basis_points INTEGER,
  fixed_fee INTEGER,
  ach_basis_points INTEGER,
  ach_fixed_fee INTEGER,
  
  -- Additional Information
  additional_information TEXT,
  service_specific_data JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 4: Create indexes for performance
CREATE INDEX idx_municipal_service_applications_user_id ON municipal_service_applications(user_id);
CREATE INDEX idx_municipal_service_applications_customer_id ON municipal_service_applications(customer_id);
CREATE INDEX idx_municipal_service_applications_tile_id ON municipal_service_applications(tile_id);
CREATE INDEX idx_municipal_service_applications_status ON municipal_service_applications(status);
CREATE INDEX idx_municipal_service_applications_payment_id ON municipal_service_applications(payment_id);
CREATE INDEX idx_municipal_service_applications_application_number ON municipal_service_applications(application_number);

-- Phase 5: Create application number generation function
CREATE OR REPLACE FUNCTION generate_service_application_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER;
BEGIN
  -- Get the current year
  SELECT EXTRACT(year FROM NOW())::TEXT INTO new_number;
  
  -- Get count of applications this year and add 1
  SELECT COUNT(*) + 1 INTO counter
  FROM municipal_service_applications 
  WHERE application_number LIKE new_number || '%';
  
  -- Format as YYYY-NNNNNN
  new_number := new_number || '-' || LPAD(counter::TEXT, 6, '0');
  
  RETURN new_number;
END;
$$;

-- Phase 6: Create trigger for auto-generating application numbers
CREATE OR REPLACE FUNCTION set_service_application_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.application_number IS NULL THEN
    NEW.application_number := generate_service_application_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_service_application_number
  BEFORE INSERT ON municipal_service_applications
  FOR EACH ROW
  EXECUTE FUNCTION set_service_application_number();

-- Phase 7: Create status timestamp management trigger
CREATE OR REPLACE FUNCTION update_service_application_status_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set submitted_at when status changes to submitted
  IF NEW.status = 'submitted' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.submitted_at = NOW();
  END IF;
  
  -- Set under_review_at when status changes to under_review
  IF NEW.status = 'under_review' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.under_review_at = NOW();
  END IF;
  
  -- Set information_requested_at when status changes to information_requested
  IF NEW.status = 'information_requested' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.information_requested_at = NOW();
  END IF;
  
  -- Set approved_at when status changes to approved
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.approved_at = NOW();
  END IF;
  
  -- Set denied_at when status changes to denied
  IF NEW.status = 'denied' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.denied_at = NOW();
  END IF;
  
  -- Set paid_at when status changes to paid
  IF NEW.status = 'paid' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.paid_at = NOW();
  END IF;
  
  -- Set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_service_application_status_timestamps
  BEFORE UPDATE ON municipal_service_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_service_application_status_timestamps();

-- Phase 8: Create updated_at trigger
CREATE TRIGGER trigger_update_service_applications_updated_at
  BEFORE UPDATE ON municipal_service_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Phase 9: Enable RLS
ALTER TABLE municipal_service_applications ENABLE ROW LEVEL SECURITY;

-- Phase 10: Create RLS policies
CREATE POLICY "Users can insert their own service applications"
ON municipal_service_applications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own service applications"
ON municipal_service_applications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own service applications"
ON municipal_service_applications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Municipal users can view applications for their customer"
ON municipal_service_applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.account_type = 'municipal'
    AND profiles.customer_id = municipal_service_applications.customer_id
  )
);

CREATE POLICY "Municipal users can update applications for their customer"
ON municipal_service_applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.account_type = 'municipal'
    AND profiles.customer_id = municipal_service_applications.customer_id
  )
);

CREATE POLICY "Super admins can manage all service applications"
ON municipal_service_applications
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'superAdmin'
  )
);

-- Phase 11: Migrate existing data from backup
INSERT INTO municipal_service_applications (
  id,
  user_id,
  customer_id,
  tile_id,
  status,
  amount_cents,
  payment_status,
  payment_id,
  fraud_session_id,
  idempotency_id,
  assigned_reviewer_id,
  review_notes,
  applicant_name,
  applicant_email,
  applicant_phone,
  business_legal_name,
  additional_information,
  service_specific_data,
  created_at,
  updated_at
)
SELECT 
  id,
  user_id,
  customer_id,
  tile_id,
  CASE 
    WHEN status = 'draft' THEN 'draft'::service_application_status_enum
    WHEN status = 'submitted' THEN 'submitted'::service_application_status_enum
    WHEN status = 'under_review' THEN 'under_review'::service_application_status_enum
    WHEN status = 'approved' THEN 'approved'::service_application_status_enum
    WHEN status = 'denied' THEN 'denied'::service_application_status_enum
    WHEN status = 'paid' THEN 'paid'::service_application_status_enum
    ELSE 'draft'::service_application_status_enum
  END,
  amount_cents,
  payment_status,
  payment_id,
  fraud_session_id,
  idempotency_id,
  reviewed_by,
  review_notes,
  form_data->>'name',
  form_data->>'email', 
  form_data->>'phone',
  form_data->>'business_legal_name',
  form_data->>'additional_information',
  form_data,
  created_at,
  updated_at
FROM municipal_service_applications_backup;

-- Phase 12: Create notification trigger
CREATE OR REPLACE FUNCTION create_service_application_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  tile_title TEXT;
  action_url TEXT;
BEGIN
  -- Only create notifications on status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get tile title for notification
    SELECT title INTO tile_title
    FROM municipal_service_tiles
    WHERE id = NEW.tile_id;
    
    -- Set notification content based on new status
    CASE NEW.status
      WHEN 'submitted' THEN
        notification_title := 'Service Application Submitted';
        notification_message := 'Your application for "' || tile_title || '" has been submitted successfully.';
      WHEN 'under_review' THEN
        notification_title := 'Application Under Review';
        notification_message := 'Your application for "' || tile_title || '" is now under review.';
      WHEN 'information_requested' THEN
        notification_title := 'Additional Information Requested';
        notification_message := 'Additional information has been requested for "' || tile_title || '".';
      WHEN 'approved' THEN
        notification_title := 'Application Approved';
        notification_message := 'Your application for "' || tile_title || '" has been approved and is ready for payment.';
      WHEN 'denied' THEN
        notification_title := 'Application Denied';
        notification_message := 'Your application for "' || tile_title || '" has been denied. Please check the review notes for details.';
      WHEN 'paid' THEN
        notification_title := 'Payment Complete';
        notification_message := 'Payment for "' || tile_title || '" has been processed successfully.';
      WHEN 'completed' THEN
        notification_title := 'Application Complete';
        notification_message := 'Your application for "' || tile_title || '" is now complete.';
      ELSE
        RETURN NEW; -- No notification for other statuses
    END CASE;
    
    -- Set action URL
    action_url := '/other-services';
    
    -- Insert notification
    INSERT INTO user_notifications (
      user_id,
      notification_type,
      title,
      message,
      related_entity_type,
      related_entity_id,
      action_url
    ) VALUES (
      NEW.user_id,
      'service_application_status',
      notification_title,
      notification_message,
      'service_application',
      NEW.id,
      action_url
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_service_application_notification
  AFTER UPDATE ON municipal_service_applications
  FOR EACH ROW
  EXECUTE FUNCTION create_service_application_notification();

-- Clean up backup table (optional - comment out if you want to keep it)
-- DROP TABLE municipal_service_applications_backup;