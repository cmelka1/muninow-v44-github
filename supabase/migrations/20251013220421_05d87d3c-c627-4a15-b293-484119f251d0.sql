-- Fix stuck service applications that were paid but not issued
-- Both Dog Permit applications have requires_review = false, so should auto-issue

UPDATE municipal_service_applications
SET 
  status = 'issued',
  issued_at = payment_processed_at,
  updated_at = now()
WHERE id IN (
  '321ff2f0-9505-4876-ab9d-e6ebf08705fe',
  '02c9848c-c93f-475c-b99d-a94e28393d06'
)
AND payment_status = 'paid'
AND status = 'draft';

-- Verification: Check for any remaining paid but not issued service applications
-- where requires_review = false
DO $$
DECLARE
  stuck_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO stuck_count
  FROM municipal_service_applications msa
  JOIN municipal_service_tiles mst ON mst.id = msa.tile_id
  WHERE msa.payment_status = 'paid'
    AND msa.status != 'issued'
    AND mst.requires_review = false;
  
  IF stuck_count > 0 THEN
    RAISE NOTICE 'WARNING: % service applications still stuck (paid but not issued with requires_review=false)', stuck_count;
  ELSE
    RAISE NOTICE 'SUCCESS: All paid service applications with requires_review=false are now issued';
  END IF;
END $$;