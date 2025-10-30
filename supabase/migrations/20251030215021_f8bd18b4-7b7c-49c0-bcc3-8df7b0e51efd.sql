-- Fix RLS for municipal users viewing business license documents by joining through the license's customer_id
-- 1) Drop the existing municipal SELECT policy (name from current schema)
DROP POLICY IF EXISTS "Municipal users can view documents for their customer applicati" ON public.business_license_documents;

-- 2) Recreate a robust SELECT policy using the license's customer_id via JOIN
CREATE POLICY "Municipal users can view documents via license customer_id"
ON public.business_license_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.business_license_applications bla
    WHERE bla.id = public.business_license_documents.license_id
      AND has_municipal_access_to_customer(auth.uid(), bla.customer_id)
  )
);

-- Keep existing policies for super admins and end users intact
