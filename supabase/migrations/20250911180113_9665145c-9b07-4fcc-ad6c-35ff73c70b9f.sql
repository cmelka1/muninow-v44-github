-- Phase 3: Fix remaining RLS policies for municipal data access

-- Update permit_applications policies
DROP POLICY IF EXISTS "Municipal users can view permits for their customer" ON public.permit_applications;
DROP POLICY IF EXISTS "Municipal users can update permits for their customer" ON public.permit_applications;

CREATE POLICY "Municipal users can view permits for their customer" 
ON public.permit_applications 
FOR SELECT 
USING (public.has_municipal_access_to_customer(auth.uid(), customer_id));

CREATE POLICY "Municipal users can update permits for their customer" 
ON public.permit_applications 
FOR UPDATE 
USING (public.has_municipal_access_to_customer(auth.uid(), customer_id));

-- Update permit_documents policies
DROP POLICY IF EXISTS "Municipal users can view documents for their customer permits" ON public.permit_documents;

CREATE POLICY "Municipal users can view documents for their customer permits" 
ON public.permit_documents 
FOR SELECT 
USING (public.has_municipal_access_to_customer(auth.uid(), customer_id));

-- Update tax_submissions policies  
DROP POLICY IF EXISTS "Municipal users can view tax submissions for their customer" ON public.tax_submissions;
DROP POLICY IF EXISTS "Municipal users can update tax submissions for their customer" ON public.tax_submissions;

CREATE POLICY "Municipal users can view tax submissions for their customer" 
ON public.tax_submissions 
FOR SELECT 
USING (public.has_municipal_access_to_customer(auth.uid(), customer_id));

CREATE POLICY "Municipal users can update tax submissions for their customer" 
ON public.tax_submissions 
FOR UPDATE 
USING (public.has_municipal_access_to_customer(auth.uid(), customer_id));

-- Update municipal_service_applications policies
DROP POLICY IF EXISTS "Municipal users can view applications for their customer" ON public.municipal_service_applications;
DROP POLICY IF EXISTS "Municipal users can update applications for their customer" ON public.municipal_service_applications;

CREATE POLICY "Municipal users can view applications for their customer" 
ON public.municipal_service_applications 
FOR SELECT 
USING (public.has_municipal_access_to_customer(auth.uid(), customer_id));

CREATE POLICY "Municipal users can update applications for their customer" 
ON public.municipal_service_applications 
FOR UPDATE 
USING (public.has_municipal_access_to_customer(auth.uid(), customer_id));

-- Update payment_history policies
DROP POLICY IF EXISTS "Municipal users can view payment history for their customer" ON public.payment_history;

CREATE POLICY "Municipal users can view payment history for their customer" 
ON public.payment_history 
FOR SELECT 
USING (public.has_municipal_access_to_customer(auth.uid(), customer_id));

-- Update municipal_permit_merchants policies
DROP POLICY IF EXISTS "Municipal users can insert their permit merchants" ON public.municipal_permit_merchants;
DROP POLICY IF EXISTS "Municipal users can update their permit merchants" ON public.municipal_permit_merchants;
DROP POLICY IF EXISTS "Municipal users can view their permit merchants" ON public.municipal_permit_merchants;

CREATE POLICY "Municipal users can insert their permit merchants" 
ON public.municipal_permit_merchants 
FOR INSERT 
WITH CHECK (public.has_municipal_access_to_customer(auth.uid(), customer_id));

CREATE POLICY "Municipal users can update their permit merchants" 
ON public.municipal_permit_merchants 
FOR UPDATE 
USING (public.has_municipal_access_to_customer(auth.uid(), customer_id));

CREATE POLICY "Municipal users can view their permit merchants" 
ON public.municipal_permit_merchants 
FOR SELECT 
USING (public.has_municipal_access_to_customer(auth.uid(), customer_id));