-- Create missing municipal permit type records for all standard permit types for Lakewood
-- This ensures all permit types are available in the application dialog
INSERT INTO municipal_permit_types (
  customer_id,
  permit_type_id, 
  municipal_label,
  base_fee_cents,
  requires_inspection,
  processing_days,
  display_order,
  is_active
)
SELECT 
  '8fef8f5f-0c6b-4cf0-92f7-f41b14145d48'::uuid as customer_id,
  pt.id as permit_type_id,
  pt.name as municipal_label,
  pt.base_fee_cents,
  pt.requires_inspection,
  pt.processing_days,
  ROW_NUMBER() OVER (ORDER BY pt.name) as display_order,
  true as is_active
FROM permit_types pt
WHERE pt.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM municipal_permit_types mpt 
    WHERE mpt.customer_id = '8fef8f5f-0c6b-4cf0-92f7-f41b14145d48'
    AND mpt.permit_type_id = pt.id
  );