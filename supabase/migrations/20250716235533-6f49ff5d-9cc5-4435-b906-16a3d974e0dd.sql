-- Update existing merchant verification_status to use proper capitalization
UPDATE public.merchants 
SET verification_status = 
  CASE 
    WHEN LOWER(verification_status) = 'pending' THEN 'Pending'
    WHEN LOWER(verification_status) = 'approved' THEN 'Approved'
    WHEN LOWER(verification_status) = 'rejected' THEN 'Rejected'
    ELSE verification_status
  END
WHERE verification_status IS NOT NULL;

-- Update existing merchant onboarding_state to use proper capitalization
UPDATE public.merchants 
SET onboarding_state = 
  CASE 
    WHEN UPPER(onboarding_state) = 'APPROVED' THEN 'Approved'
    WHEN UPPER(onboarding_state) = 'PROVISIONING' THEN 'Provisioning'
    WHEN UPPER(onboarding_state) = 'ENABLED' THEN 'Enabled'
    WHEN UPPER(onboarding_state) = 'REJECTED' THEN 'Rejected'
    WHEN UPPER(onboarding_state) = 'DISABLED' THEN 'Disabled'
    ELSE onboarding_state
  END
WHERE onboarding_state IS NOT NULL;