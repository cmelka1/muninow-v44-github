-- Update empty municipal_label fields with permit type names for Lakewood
UPDATE municipal_permit_types 
SET municipal_label = pt.name
FROM permit_types pt 
WHERE municipal_permit_types.permit_type_id = pt.id 
  AND municipal_permit_types.customer_id = '8fef8f5f-0c6b-4cf0-92f7-f41b14145d48'
  AND (municipal_permit_types.municipal_label IS NULL OR municipal_permit_types.municipal_label = '');