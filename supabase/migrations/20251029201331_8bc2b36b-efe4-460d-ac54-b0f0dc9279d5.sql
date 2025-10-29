-- Phase 2: Business License Types Migration to business_license_types_v2
-- This migration creates a unified business license types table, migrates data,
-- updates foreign keys, and deprecates old tables

-- Step 1: Create business_license_types_v2 table
CREATE TABLE IF NOT EXISTS public.business_license_types_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(customer_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_fee_cents BIGINT NOT NULL DEFAULT 0,
  processing_days INTEGER NOT NULL DEFAULT 7,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
  merchant_name TEXT,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_business_license_type_name_per_customer UNIQUE(customer_id, name),
  CONSTRAINT valid_processing_days CHECK (processing_days > 0),
  CONSTRAINT valid_base_fee CHECK (base_fee_cents >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_business_license_types_v2_customer_id ON public.business_license_types_v2(customer_id);
CREATE INDEX idx_business_license_types_v2_customer_active ON public.business_license_types_v2(customer_id, is_active) WHERE is_active = true;
CREATE INDEX idx_business_license_types_v2_merchant_id ON public.business_license_types_v2(merchant_id) WHERE merchant_id IS NOT NULL;
CREATE INDEX idx_business_license_types_v2_display_order ON public.business_license_types_v2(customer_id, display_order);

-- Step 2: Migrate data from municipal_business_license_types
INSERT INTO public.business_license_types_v2 (
  customer_id,
  name,
  base_fee_cents,
  processing_days,
  merchant_id,
  merchant_name,
  is_custom,
  display_order,
  is_active,
  created_at,
  updated_at
)
SELECT 
  mblt.customer_id,
  mblt.municipal_label as name,
  mblt.base_fee_cents,
  7 as processing_days,
  mblt.merchant_id,
  mblt.merchant_name,
  mblt.is_custom,
  mblt.display_order,
  mblt.is_active,
  mblt.created_at,
  mblt.updated_at
FROM public.municipal_business_license_types mblt
WHERE mblt.is_active = true
ON CONFLICT (customer_id, name) DO NOTHING;

-- Step 3: Update business_license_applications table FK
ALTER TABLE public.business_license_applications 
ADD COLUMN IF NOT EXISTS license_type_id_v2 UUID;

-- Migrate FK references
UPDATE public.business_license_applications bla
SET license_type_id_v2 = (
  SELECT bltv2.id 
  FROM public.business_license_types_v2 bltv2
  JOIN public.municipal_business_license_types mblt ON (
    mblt.customer_id = bltv2.customer_id 
    AND mblt.municipal_label = bltv2.name
  )
  WHERE mblt.id = bla.license_type_id
  LIMIT 1
)
WHERE bla.license_type_id IS NOT NULL
AND bla.license_type_id_v2 IS NULL;

-- Make new column NOT NULL
ALTER TABLE public.business_license_applications 
ALTER COLUMN license_type_id_v2 SET NOT NULL;

-- Add FK constraint
ALTER TABLE public.business_license_applications
ADD CONSTRAINT fk_business_license_applications_license_type_v2 
FOREIGN KEY (license_type_id_v2) 
REFERENCES public.business_license_types_v2(id) 
ON DELETE RESTRICT;

-- Create index
CREATE INDEX idx_business_license_applications_license_type_v2 
ON public.business_license_applications(license_type_id_v2);

-- Drop old FK column
ALTER TABLE public.business_license_applications DROP COLUMN IF EXISTS license_type_id;

-- Rename new column to final name
ALTER TABLE public.business_license_applications 
RENAME COLUMN license_type_id_v2 TO license_type_id;

-- Rename constraint
ALTER TABLE public.business_license_applications 
RENAME CONSTRAINT fk_business_license_applications_license_type_v2 
TO fk_business_license_applications_license_type;

-- Rename index
ALTER INDEX idx_business_license_applications_license_type_v2 
RENAME TO idx_business_license_applications_license_type;

-- Step 4: Create RLS policies
ALTER TABLE public.business_license_types_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY municipal_manage_business_license_types_v2 ON public.business_license_types_v2
  FOR ALL
  USING (has_municipal_access_to_customer(auth.uid(), customer_id))
  WITH CHECK (has_municipal_access_to_customer(auth.uid(), customer_id));

CREATE POLICY public_read_active_business_license_types_v2 ON public.business_license_types_v2
  FOR SELECT
  USING (is_active = true);

CREATE POLICY super_admin_manage_business_license_types_v2 ON public.business_license_types_v2
  FOR ALL
  USING (is_current_user_super_admin());

-- Step 5: Create updated_at trigger
CREATE TRIGGER set_updated_at_business_license_types_v2
  BEFORE UPDATE ON public.business_license_types_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Deprecate old tables
ALTER TABLE IF EXISTS public.business_license_types 
  RENAME TO business_license_types_deprecated;

ALTER TABLE IF EXISTS public.municipal_business_license_types 
  RENAME TO municipal_business_license_types_deprecated;

-- Add comments
COMMENT ON TABLE public.business_license_types_v2 IS 'Unified business license types table with customer-specific configurations. Replaces business_license_types + municipal_business_license_types.';

COMMENT ON TABLE public.business_license_types_deprecated IS 
  'DEPRECATED: Replaced by business_license_types_v2. Scheduled for deletion after 2025-11-28. Do not use.';

COMMENT ON TABLE public.municipal_business_license_types_deprecated IS 
  'DEPRECATED: Replaced by business_license_types_v2. Scheduled for deletion after 2025-11-28. Do not use.';

COMMENT ON COLUMN public.business_license_applications.license_type_id IS 'References business_license_types_v2 table. Replaced old license_type_id referencing municipal_business_license_types.';

-- Drop old RPC functions
DROP FUNCTION IF EXISTS public.get_municipal_business_license_types(UUID);
DROP FUNCTION IF EXISTS public.create_municipal_business_license_type(UUID, TEXT, BIGINT, UUID, UUID, TEXT, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS public.update_municipal_business_license_type(UUID, TEXT, BIGINT, BOOLEAN, INTEGER);