-- Complete Hinsdale Customer and Profile Cleanup - Handle ALL Dependencies

-- Step 1: Delete user role assignment for Charles Melka (cmelka@muninow.com)
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'cmelka@muninow.com'
);

-- Step 2: Delete all municipal service tiles that reference Hinsdale merchants
DELETE FROM public.municipal_service_tiles 
WHERE merchant_id IN (
  SELECT id FROM public.merchants WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Step 3: Delete all municipal permit questions that reference Hinsdale merchants
DELETE FROM public.municipal_permit_questions 
WHERE merchant_id IN (
  SELECT id FROM public.merchants WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Step 4: Delete merchant fee profiles for Hinsdale merchants
DELETE FROM public.merchant_fee_profiles 
WHERE merchant_id IN (
  SELECT id FROM public.merchants WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Step 5: Delete merchant payout profiles for Hinsdale merchants
DELETE FROM public.merchant_payout_profiles 
WHERE merchant_id IN (
  SELECT id FROM public.merchants WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Step 6: Delete all references to Charles Melka's profile ID from various tables
-- Delete municipal service application comments by reviewer
DELETE FROM public.municipal_service_application_comments 
WHERE reviewer_id IN (
  SELECT id FROM public.profiles WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Step 7: Delete municipal team members that reference Charles Melka's profile as admin
DELETE FROM public.municipal_team_members 
WHERE admin_id IN (
  SELECT id FROM public.profiles WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Step 8: Delete any remaining municipal team members for Hinsdale customer  
DELETE FROM public.municipal_team_members 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';

-- Step 9: Update business license applications to remove reviewer references
UPDATE public.business_license_applications 
SET assigned_reviewer_id = NULL 
WHERE assigned_reviewer_id IN (
  SELECT id FROM public.profiles WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Step 10: Update permit applications to remove reviewer references
UPDATE public.permit_applications 
SET assigned_reviewer_id = NULL 
WHERE assigned_reviewer_id IN (
  SELECT id FROM public.profiles WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Step 11: Delete all merchants for Hinsdale customer
DELETE FROM public.merchants 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';

-- Step 12: Delete Charles Melka's profile
DELETE FROM public.profiles 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';

-- Step 13: Finally delete the Hinsdale customer record
DELETE FROM public.customers 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';