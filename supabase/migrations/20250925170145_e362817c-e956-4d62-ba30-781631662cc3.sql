-- Check if tax_submissions table exists and add missing unified payment fields
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'tax_submissions' AND table_schema = 'public';