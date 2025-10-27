-- Drop the old overloaded function signature that was causing PGRST203 ambiguity error
-- This is the version from migration 20250904152955 with the old parameter ordering
DROP FUNCTION IF EXISTS public.create_municipal_business_license_type(
  uuid,     -- p_customer_id
  uuid,     -- p_business_license_type_id
  uuid,     -- p_merchant_id
  text,     -- p_merchant_name
  text,     -- p_municipal_label
  bigint,   -- p_base_fee_cents
  boolean,  -- p_is_custom
  integer   -- p_display_order
);

-- Add comment to the remaining function to document the fix and prevent future overloads
COMMENT ON FUNCTION public.create_municipal_business_license_type(
  UUID,     -- p_customer_id
  TEXT,     -- p_municipal_label
  BIGINT,   -- p_base_fee_cents
  UUID,     -- p_business_license_type_id
  UUID,     -- p_merchant_id
  TEXT,     -- p_merchant_name
  BOOLEAN,  -- p_is_custom
  INTEGER   -- p_display_order
) IS 'Creates a new municipal business license type. WARNING: Do not create overloads of this function - it will cause PGRST203 ambiguity errors. If parameter changes are needed, DROP the old signature first.';