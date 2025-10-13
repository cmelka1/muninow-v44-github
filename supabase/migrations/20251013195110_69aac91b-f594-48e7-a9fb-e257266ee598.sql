-- Drop the old version of create_unified_payment_transaction that has p_idempotency_id
-- This resolves the function overloading conflict (PGRST203 error)
DROP FUNCTION IF EXISTS public.create_unified_payment_transaction(
  p_user_id uuid,
  p_customer_id uuid,
  p_merchant_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_base_amount_cents bigint,
  p_payment_instrument_id text,
  p_payment_type text,
  p_fraud_session_id text,
  p_idempotency_id text,
  p_idempotency_uuid uuid,
  p_idempotency_metadata jsonb,
  p_is_card boolean,
  p_card_brand text,
  p_card_last_four text,
  p_bank_last_four text,
  p_first_name text,
  p_last_name text,
  p_user_email text
);