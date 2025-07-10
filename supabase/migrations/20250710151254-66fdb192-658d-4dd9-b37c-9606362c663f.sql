-- Add three new columns to merchants table for internal tracking
ALTER TABLE public.merchants 
ADD COLUMN data_source_system TEXT,
ADD COLUMN category TEXT,
ADD COLUMN subcategory TEXT;