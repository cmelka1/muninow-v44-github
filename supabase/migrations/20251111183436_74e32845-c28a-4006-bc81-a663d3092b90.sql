-- Update existing application with NULL submitted_at to use created_at
UPDATE municipal_service_applications
SET submitted_at = created_at
WHERE id = '9db2dd30-8833-41de-b87e-b627bad5c88c' AND submitted_at IS NULL;