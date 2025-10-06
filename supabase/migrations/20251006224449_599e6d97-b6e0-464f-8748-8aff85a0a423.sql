-- Add merchant detail columns for denormalization and historical tracking
ALTER TABLE public.payment_transactions 
ADD COLUMN IF NOT EXISTS merchant_name TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS statement_descriptor TEXT;

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_payment_transactions_merchant_name 
ON public.payment_transactions(merchant_name) WHERE merchant_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_category 
ON public.payment_transactions(category) WHERE category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_subcategory 
ON public.payment_transactions(subcategory) WHERE subcategory IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.payment_transactions.merchant_name IS 'Denormalized merchant name at time of payment for historical accuracy and query performance';
COMMENT ON COLUMN public.payment_transactions.category IS 'Merchant category at time of payment (e.g., "Utilities & Services")';
COMMENT ON COLUMN public.payment_transactions.subcategory IS 'Merchant subcategory at time of payment (e.g., "Water", "Building Permits")';
COMMENT ON COLUMN public.payment_transactions.statement_descriptor IS 'Statement descriptor shown on customer payment statements';