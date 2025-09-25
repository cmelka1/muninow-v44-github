-- Drop the redundant total_amount_cents column from tax_submissions table
-- This column is redundant with total_amount_due_cents and was causing NOT NULL constraint violations

ALTER TABLE public.tax_submissions DROP COLUMN IF EXISTS total_amount_cents;