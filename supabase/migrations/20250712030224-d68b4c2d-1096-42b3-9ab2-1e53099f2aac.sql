-- Add card tracking columns to payment_history table
ALTER TABLE public.payment_history 
ADD COLUMN card_brand text,
ADD COLUMN card_last_four text;