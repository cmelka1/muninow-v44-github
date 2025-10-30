-- Fix column name: permit_applications uses permit_id, not id
CREATE OR REPLACE FUNCTION public.create_permit_status_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  action_url TEXT;
  permit_type_name TEXT;
BEGIN
  -- Only create notifications for status changes
  IF OLD.application_status IS DISTINCT FROM NEW.application_status THEN
    
    -- Get permit type name from permit_types_v2
    SELECT ptv2.name INTO permit_type_name
    FROM public.permit_types_v2 ptv2
    WHERE ptv2.id = NEW.permit_type_id;
    
    -- Build notification content based on status
    CASE NEW.application_status
      WHEN 'submitted' THEN
        notification_title := 'Permit Application Submitted';
        notification_message := CONCAT(
          'Your permit application #',
          COALESCE(NEW.permit_number, 'Pending'),
          ' has been submitted successfully.'
        );
      
      WHEN 'under_review' THEN
        notification_title := 'Application Under Review';
        notification_message := CONCAT(
          'Your permit application #',
          COALESCE(NEW.permit_number, 'Pending'),
          ' is now under review.'
        );
      
      WHEN 'information_requested' THEN
        notification_title := 'Information Requested';
        notification_message := CONCAT(
          'Additional information is needed for your permit application #',
          COALESCE(NEW.permit_number, 'Pending'),
          '. Please check your application for details.'
        );
      
      WHEN 'approved' THEN
        notification_title := 'Permit Approved';
        notification_message := CONCAT(
          'Congratulations! Your permit application #',
          COALESCE(NEW.permit_number, 'Pending'),
          ' has been approved.'
        );
      
      WHEN 'denied' THEN
        notification_title := 'Permit Denied';
        notification_message := CONCAT(
          'Your permit application #',
          COALESCE(NEW.permit_number, 'Pending'),
          ' has been denied. Please review the details for more information.'
        );
      
      WHEN 'issued' THEN
        notification_title := 'Permit Issued';
        notification_message := CONCAT(
          'Your permit #',
          COALESCE(NEW.permit_number, 'Pending'),
          ' has been issued and is now active.'
        );
      
      ELSE
        notification_title := 'Status Update';
        notification_message := CONCAT(
          'Your permit application #',
          COALESCE(NEW.permit_number, 'Pending'),
          ' status has been updated.'
        );
    END CASE;
    
    -- Final safety check
    IF notification_message IS NULL OR TRIM(notification_message) = '' THEN
      notification_message := 'Your permit application status has been updated.';
    END IF;
    
    -- FIXED: Use permit_id instead of id
    action_url := '/permits/' || NEW.permit_id;
    
    -- Insert notification with unified structure
    INSERT INTO public.user_notifications (
      user_id,
      notification_type,
      title,
      message,
      service_type,
      service_number,
      update_type,
      status_change_from,
      status_change_to,
      related_entity_type,
      related_entity_id,
      action_url,
      entity_details
    ) VALUES (
      NEW.user_id,
      'service_update',
      notification_title,
      notification_message,
      'permit',
      COALESCE(NEW.permit_number, 'Pending'),
      'status_change',
      OLD.application_status::text,
      NEW.application_status::text,
      'permit',
      NEW.permit_id,  -- FIXED: Use permit_id instead of id
      action_url,
      jsonb_build_object(
        'permit_number', COALESCE(NEW.permit_number, 'Pending'),
        'permit_type', COALESCE(permit_type_name, 'Building Permit'),
        'status', NEW.application_status::text
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;