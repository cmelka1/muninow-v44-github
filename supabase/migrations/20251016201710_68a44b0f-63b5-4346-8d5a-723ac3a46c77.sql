-- Fix ambiguous license_number column reference in check_expiring_licenses function
CREATE OR REPLACE FUNCTION check_expiring_licenses()
RETURNS TABLE(
  license_id UUID,
  user_id UUID,
  license_number TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  days_until_expiration INTEGER,
  old_status TEXT,
  new_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH updated_licenses AS (
    UPDATE business_license_applications
    SET 
      renewal_status = CASE
        WHEN business_license_applications.expires_at < NOW() THEN 'expired'
        WHEN business_license_applications.expires_at <= NOW() + INTERVAL '30 days' THEN 'expiring_soon'
        ELSE 'active'
      END,
      updated_at = NOW()
    WHERE 
      application_status = 'issued'
      AND renewal_status IN ('active', 'expiring_soon', 'grace_period')
      AND business_license_applications.expires_at IS NOT NULL
      AND (
        (business_license_applications.expires_at < NOW() AND renewal_status != 'expired')
        OR (business_license_applications.expires_at <= NOW() + INTERVAL '30 days' 
            AND business_license_applications.expires_at >= NOW() 
            AND renewal_status != 'expiring_soon')
        OR (business_license_applications.expires_at > NOW() + INTERVAL '30 days' 
            AND renewal_status != 'active')
      )
    RETURNING 
      id,
      business_license_applications.user_id,
      business_license_applications.license_number,
      business_license_applications.expires_at,
      EXTRACT(DAY FROM (business_license_applications.expires_at - NOW()))::INTEGER as days_until_expiration,
      LAG(renewal_status) OVER (PARTITION BY id ORDER BY updated_at) as old_status,
      renewal_status as new_status
  )
  SELECT * FROM updated_licenses;
END;
$$;

COMMENT ON FUNCTION check_expiring_licenses() IS 
  'Checks all issued licenses and updates their renewal_status based on expiration dates. Returns list of updated licenses with all column references fully qualified.';