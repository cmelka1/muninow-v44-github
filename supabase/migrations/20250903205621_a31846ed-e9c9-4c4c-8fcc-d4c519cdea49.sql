-- Check current constraint on account_type
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%account_type%';

-- Also check if there's an enum type
SELECT typname, enumlabel 
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname LIKE '%account%';

-- Check table constraints directly
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'c';