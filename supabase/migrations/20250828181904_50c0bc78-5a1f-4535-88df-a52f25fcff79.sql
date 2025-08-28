-- Drop conflicting old RLS policies for tax documents
-- These use the old file path approach and conflict with the new staging-based policies

-- Drop the old municipal policy that uses file path approach
DROP POLICY IF EXISTS "Municipal users can view tax documents for their customer" ON storage.objects;

-- Drop the old update policy that uses file path approach (UPDATE not needed for tax docs)
DROP POLICY IF EXISTS "Users can update their own tax documents" ON storage.objects;