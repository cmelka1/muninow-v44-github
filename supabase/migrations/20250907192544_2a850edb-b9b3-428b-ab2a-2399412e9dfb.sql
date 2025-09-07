-- Fix payment_instrument_id column type mismatch
-- Change from uuid to text to match Finix payment instrument IDs

ALTER TABLE public.payment_history 
ALTER COLUMN payment_instrument_id TYPE text;