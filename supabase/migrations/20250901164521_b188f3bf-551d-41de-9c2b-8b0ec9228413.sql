-- Add payment tracking fields to municipal_service_applications table
ALTER TABLE public.municipal_service_applications 
ADD COLUMN payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed')),
ADD COLUMN paid_at timestamp with time zone,
ADD COLUMN finix_transfer_id text,
ADD COLUMN service_fee_cents bigint DEFAULT 0,
ADD COLUMN total_amount_cents bigint DEFAULT 0,
ADD COLUMN payment_id uuid REFERENCES public.payment_history(id),
ADD COLUMN idempotency_id text,
ADD COLUMN fraud_session_id text;