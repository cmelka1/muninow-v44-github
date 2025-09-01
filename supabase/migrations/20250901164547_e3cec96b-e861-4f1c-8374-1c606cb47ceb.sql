-- Add missing payment tracking fields to municipal_service_applications table
ALTER TABLE public.municipal_service_applications 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed')),
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS finix_transfer_id text,
ADD COLUMN IF NOT EXISTS service_fee_cents bigint DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount_cents bigint DEFAULT 0;