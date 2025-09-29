-- Add performance indexes for user_payment_instruments table
CREATE INDEX IF NOT EXISTS idx_user_payment_instruments_user_enabled 
ON user_payment_instruments(user_id, enabled) 
WHERE enabled = true;

CREATE INDEX IF NOT EXISTS idx_user_payment_instruments_finix_id 
ON user_payment_instruments(finix_payment_instrument_id);

-- Add missing bank account fields that are available from Finix but not being stored
ALTER TABLE user_payment_instruments 
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS bank_code text,
ADD COLUMN IF NOT EXISTS bank_masked_account_number text;