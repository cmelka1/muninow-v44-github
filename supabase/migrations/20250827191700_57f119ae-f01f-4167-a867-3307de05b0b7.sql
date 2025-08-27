-- Add payment_instrument_id column to payment_history table
ALTER TABLE payment_history 
ADD COLUMN payment_instrument_id UUID REFERENCES user_payment_instruments(id);

-- Add index for better query performance
CREATE INDEX idx_payment_history_payment_instrument_id ON payment_history(payment_instrument_id);