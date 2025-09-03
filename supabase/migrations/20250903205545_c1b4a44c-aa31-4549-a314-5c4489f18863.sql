-- Fix account type case sensitivity for cmelka@muninow.com
UPDATE public.profiles 
SET account_type = 'superadmin' 
WHERE email = 'cmelka@muninow.com' AND account_type = 'superAdmin';

-- Verify the update
SELECT email, account_type FROM public.profiles WHERE email = 'cmelka@muninow.com';