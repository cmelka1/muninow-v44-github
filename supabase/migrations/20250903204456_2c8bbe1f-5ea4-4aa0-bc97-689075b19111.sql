-- Cleanup all profiles except cmelka@muninow.com and jnevins94@gmail.com

-- Step 1: Store the profile IDs we want to keep
WITH profiles_to_keep AS (
  SELECT id FROM public.profiles 
  WHERE email IN ('cmelka@muninow.com', 'jnevins94@gmail.com')
)

-- Step 2: Delete user_roles for profiles being removed  
DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT id FROM profiles_to_keep);

-- Step 3: Delete user_notifications for profiles being removed
DELETE FROM public.user_notifications 
WHERE user_id NOT IN (
  SELECT id FROM public.profiles 
  WHERE email IN ('cmelka@muninow.com', 'jnevins94@gmail.com')
);

-- Step 4: Delete municipal_team_members that reference profiles as admin_id or member_id
DELETE FROM public.municipal_team_members 
WHERE admin_id NOT IN (
  SELECT id FROM public.profiles 
  WHERE email IN ('cmelka@muninow.com', 'jnevins94@gmail.com')
) OR member_id NOT IN (
  SELECT id FROM public.profiles 
  WHERE email IN ('cmelka@muninow.com', 'jnevins94@gmail.com')
);

-- Step 5: Delete permit_notifications for profiles being removed
DELETE FROM public.permit_notifications 
WHERE user_id NOT IN (
  SELECT id FROM public.profiles 
  WHERE email IN ('cmelka@muninow.com', 'jnevins94@gmail.com')
);

-- Step 6: Delete municipal_service_application_comments for profiles being removed
DELETE FROM public.municipal_service_application_comments 
WHERE reviewer_id NOT IN (
  SELECT id FROM public.profiles 
  WHERE email IN ('cmelka@muninow.com', 'jnevins94@gmail.com')
);

-- Step 7: Update master_bills to set profile_id = NULL for removed profiles
UPDATE public.master_bills 
SET profile_id = NULL 
WHERE profile_id NOT IN (
  SELECT id FROM public.profiles 
  WHERE email IN ('cmelka@muninow.com', 'jnevins94@gmail.com')
);

-- Step 8: Update business_license_applications to remove reviewer references
UPDATE public.business_license_applications 
SET assigned_reviewer_id = NULL 
WHERE assigned_reviewer_id NOT IN (
  SELECT id FROM public.profiles 
  WHERE email IN ('cmelka@muninow.com', 'jnevins94@gmail.com')
);

-- Step 9: Update permit_applications to remove reviewer references  
UPDATE public.permit_applications 
SET assigned_reviewer_id = NULL 
WHERE assigned_reviewer_id NOT IN (
  SELECT id FROM public.profiles 
  WHERE email IN ('cmelka@muninow.com', 'jnevins94@gmail.com')
);

-- Step 10: Delete all profiles except the two we want to keep
DELETE FROM public.profiles 
WHERE email NOT IN ('cmelka@muninow.com', 'jnevins94@gmail.com');

-- Verification: Show remaining profiles
SELECT COUNT(*) as remaining_profiles_count FROM public.profiles;