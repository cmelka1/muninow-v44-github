-- Complete Hinsdale Customer and Profile Cleanup

-- Step 1: Delete user role assignment for Charles Melka (cmelka@muninow.com)
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'cmelka@muninow.com'
);

-- Step 2: Delete Charles Melka's profile
DELETE FROM public.profiles 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';

-- Step 3: Delete any remaining municipal team members for Hinsdale customer
DELETE FROM public.municipal_team_members 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';

-- Step 4: Finally delete the Hinsdale customer record
DELETE FROM public.customers 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';