-- Complete Hinsdale Customer and Profile Cleanup - All References

-- Step 1: Delete user role assignment for Charles Melka (cmelka@muninow.com)
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'cmelka@muninow.com'
);

-- Step 2: Delete all references to Charles Melka's profile ID from various tables
WITH melka_profile AS (
  SELECT id FROM public.profiles WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
)
-- Delete municipal service application comments by reviewer
DELETE FROM public.municipal_service_application_comments 
WHERE reviewer_id IN (SELECT id FROM melka_profile);

-- Step 3: Delete municipal team members that reference Charles Melka's profile as admin
DELETE FROM public.municipal_team_members 
WHERE admin_id IN (
  SELECT id FROM public.profiles WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Step 4: Delete any remaining municipal team members for Hinsdale customer  
DELETE FROM public.municipal_team_members 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';

-- Step 5: Delete business license applications where assigned_reviewer_id references the profile
UPDATE public.business_license_applications 
SET assigned_reviewer_id = NULL 
WHERE assigned_reviewer_id IN (
  SELECT id FROM public.profiles WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Step 6: Delete permit applications where assigned_reviewer_id references the profile
UPDATE public.permit_applications 
SET assigned_reviewer_id = NULL 
WHERE assigned_reviewer_id IN (
  SELECT id FROM public.profiles WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687'
);

-- Step 7: Delete Charles Melka's profile
DELETE FROM public.profiles 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';

-- Step 8: Finally delete the Hinsdale customer record
DELETE FROM public.customers 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';