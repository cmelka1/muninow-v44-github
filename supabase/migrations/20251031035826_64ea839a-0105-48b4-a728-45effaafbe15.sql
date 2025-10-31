-- Fix permit block column names in create_communication_notification function
-- Corrects: applicant_id -> user_id, type_name -> name, status -> application_status

CREATE OR REPLACE FUNCTION public.create_communication_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  entity_type TEXT;
  entity_id UUID;
  recipient_id UUID;
  notification_title TEXT;
  notification_message TEXT;
  commenter_name TEXT;
  action_url TEXT;
  service_info JSONB;
  service_number TEXT;
BEGIN
  -- Determine entity type and ID based on which table triggered this
  IF TG_TABLE_NAME = 'permit_review_comments' THEN
    entity_type := 'permit';
    entity_id := NEW.permit_id;
    
    -- Get permit details - FIXED: Use correct column names
    SELECT 
      pa.user_id,                      -- FIXED: was applicant_id
      pa.permit_number,
      jsonb_build_object(
        'permit_type', pt.name,        -- FIXED: was type_name
        'permit_number', pa.permit_number,
        'permit_status', pa.application_status  -- FIXED: was status
      )
    INTO recipient_id, service_number, service_info
    FROM permit_applications pa
    LEFT JOIN permit_types_v2 pt ON pt.id = pa.permit_type_id
    WHERE pa.permit_id = NEW.permit_id;
    
    action_url := '/permit/' || entity_id::TEXT;
    
  ELSIF TG_TABLE_NAME = 'business_license_comments' THEN
    entity_type := 'business_license';
    entity_id := NEW.license_id;
    
    -- Get business license details - Already fixed
    SELECT 
      bla.user_id,
      bla.license_number,
      jsonb_build_object(
        'license_type', blt.name,
        'license_number', bla.license_number,
        'license_status', bla.application_status
      )
    INTO recipient_id, service_number, service_info
    FROM business_license_applications bla
    LEFT JOIN business_license_types_v2 blt ON blt.id = bla.license_type_id
    WHERE bla.id = NEW.license_id;
    
    action_url := '/business-license/' || entity_id::TEXT;
    
  ELSIF TG_TABLE_NAME = 'municipal_service_application_comments' THEN
    entity_type := 'service_application';
    entity_id := NEW.application_id;
    
    -- Get service application details - Already fixed
    SELECT 
      sa.user_id,
      sa.application_number,
      jsonb_build_object(
        'service_name', st.title,
        'application_number', sa.application_number,
        'application_status', sa.status
      )
    INTO recipient_id, service_number, service_info
    FROM municipal_service_applications sa
    LEFT JOIN municipal_service_tiles st ON st.id = sa.tile_id
    WHERE sa.id = NEW.application_id;
    
    action_url := '/other-services/' || entity_id::TEXT;
    
  ELSIF TG_TABLE_NAME = 'tax_submission_comments' THEN
    entity_type := 'tax_submission';
    entity_id := NEW.submission_id;
    
    -- Get tax submission details - Already fixed
    SELECT 
      ts.user_id,
      ts.id::TEXT,
      jsonb_build_object(
        'tax_type', ts.tax_type,
        'submission_id', ts.id,
        'submission_status', ts.submission_status
      )
    INTO recipient_id, service_number, service_info
    FROM tax_submissions ts
    WHERE ts.id = NEW.submission_id;
    
    action_url := '/taxes/' || entity_id::TEXT;
    
  ELSE
    RETURN NEW;
  END IF;

  -- Get commenter name
  SELECT COALESCE(first_name || ' ' || last_name, email, 'Municipal Staff')
  INTO commenter_name
  FROM profiles
  WHERE id = NEW.reviewer_id;

  -- Create notification title and message
  notification_title := 'New Comment on Your ' || 
    CASE entity_type
      WHEN 'permit' THEN 'Permit'
      WHEN 'business_license' THEN 'Business License'
      WHEN 'service_application' THEN 'Service Application'
      WHEN 'tax_submission' THEN 'Tax Submission'
    END;
  
  notification_message := commenter_name || ' added a comment: ' || LEFT(NEW.comment_text, 100);

  -- Insert notification with correct column names
  INSERT INTO public.user_notifications (
    user_id,
    notification_type,
    title,
    message,
    service_type,
    service_number,
    update_type,
    related_entity_type,
    related_entity_id,
    action_url,
    entity_details,
    communication_details
  ) VALUES (
    recipient_id,
    'comment',
    notification_title,
    notification_message,
    entity_type,
    service_number,
    'comment',
    entity_type,
    entity_id,
    action_url,
    jsonb_build_object('service_info', service_info),
    jsonb_build_object(
      'commenter_id', NEW.reviewer_id,
      'commenter_name', commenter_name,
      'comment_preview', LEFT(NEW.comment_text, 100)
    )
  );

  RETURN NEW;
END;
$$;