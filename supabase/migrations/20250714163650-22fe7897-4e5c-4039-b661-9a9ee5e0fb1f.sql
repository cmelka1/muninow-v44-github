-- Add customer_id column to refunds table
ALTER TABLE public.refunds ADD COLUMN customer_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- Remove the temporary default after adding the column
ALTER TABLE public.refunds ALTER COLUMN customer_id DROP DEFAULT;