-- =====================================================
-- Migration: Create permit_types_v2 and migrate data
-- =====================================================

-- Step 1: Create the new unified permit types table
CREATE TABLE IF NOT EXISTS public.permit_types_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(customer_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_fee_cents BIGINT NOT NULL DEFAULT 0,
  processing_days INTEGER NOT NULL DEFAULT 30,
  requires_inspection BOOLEAN NOT NULL DEFAULT false,
  merchant_id UUID REFERENCES public.merchants(id) ON DELETE SET NULL,
  merchant_name TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_permit_type_name_per_customer UNIQUE(customer_id, name),
  CONSTRAINT valid_processing_days CHECK (processing_days > 0),
  CONSTRAINT valid_base_fee CHECK (base_fee_cents >= 0)
);

-- Step 2: Create indexes for performance
CREATE INDEX idx_permit_types_v2_customer_id ON public.permit_types_v2(customer_id);
CREATE INDEX idx_permit_types_v2_customer_active ON public.permit_types_v2(customer_id, is_active) WHERE is_active = true;
CREATE INDEX idx_permit_types_v2_merchant_id ON public.permit_types_v2(merchant_id) WHERE merchant_id IS NOT NULL;
CREATE INDEX idx_permit_types_v2_display_order ON public.permit_types_v2(customer_id, display_order);

-- Step 3: Migrate data from municipal_permit_types
-- This captures all existing customized permit types
INSERT INTO public.permit_types_v2 (
  customer_id,
  name,
  description,
  base_fee_cents,
  processing_days,
  requires_inspection,
  merchant_id,
  merchant_name,
  display_order,
  is_active,
  created_at,
  updated_at
)
SELECT 
  mpt.customer_id,
  mpt.municipal_label as name,
  mpt.description,
  mpt.base_fee_cents,
  COALESCE(mpt.processing_days, 30) as processing_days,
  COALESCE(mpt.requires_inspection, false) as requires_inspection,
  mpt.merchant_id,
  mpt.merchant_name,
  COALESCE(mpt.display_order, 0) as display_order,
  COALESCE(mpt.is_active, true) as is_active,
  mpt.created_at,
  mpt.updated_at
FROM public.municipal_permit_types mpt
WHERE mpt.is_active = true
ON CONFLICT (customer_id, name) DO NOTHING;

-- Step 4: For municipalities without municipal_permit_types entries,
-- seed standard permit types from the global permit_types table
WITH customers_needing_types AS (
  SELECT DISTINCT c.customer_id
  FROM public.customers c
  WHERE NOT EXISTS (
    SELECT 1 FROM public.permit_types_v2 ptv2
    WHERE ptv2.customer_id = c.customer_id
  )
  AND EXISTS (
    SELECT 1 FROM public.merchants m
    WHERE m.customer_id = c.customer_id
    AND m.subcategory = 'Building Permits'
  )
)
INSERT INTO public.permit_types_v2 (
  customer_id,
  name,
  description,
  base_fee_cents,
  processing_days,
  requires_inspection,
  merchant_id,
  merchant_name,
  display_order,
  is_active
)
SELECT 
  cnt.customer_id,
  pt.name,
  pt.description,
  pt.base_fee_cents,
  pt.processing_days,
  pt.requires_inspection,
  NULL as merchant_id,
  NULL as merchant_name,
  0 as display_order,
  true as is_active
FROM customers_needing_types cnt
CROSS JOIN public.permit_types pt
WHERE pt.is_active = true
ON CONFLICT (customer_id, name) DO NOTHING;

-- Step 5: Enable RLS
ALTER TABLE public.permit_types_v2 ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies
CREATE POLICY municipal_manage_permit_types_v2 ON public.permit_types_v2
  FOR ALL
  USING (has_municipal_access_to_customer(auth.uid(), customer_id))
  WITH CHECK (has_municipal_access_to_customer(auth.uid(), customer_id));

CREATE POLICY public_read_active_permit_types_v2 ON public.permit_types_v2
  FOR SELECT
  USING (is_active = true);

CREATE POLICY super_admin_manage_permit_types_v2 ON public.permit_types_v2
  FOR ALL
  USING (is_current_user_super_admin());

-- Step 7: Create updated_at trigger
CREATE TRIGGER set_updated_at_permit_types_v2
  BEFORE UPDATE ON public.permit_types_v2
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.permit_types_v2 IS 'Unified permit types table with customer-specific configurations. Replaces permit_types + municipal_permit_types.';