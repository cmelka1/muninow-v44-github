-- Add merchant_id column to payment_history table
ALTER TABLE payment_history 
ADD COLUMN merchant_id UUID REFERENCES merchants(id);

-- Add index for better query performance
CREATE INDEX idx_payment_history_merchant_id ON payment_history(merchant_id);