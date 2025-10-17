-- Migration: Remove payment transactions for deleted Dog Permit applications
-- WARNING: This deletes financial records totaling $131.25 (5 transactions)
-- Created: 2025-10-17

-- Log what we're about to delete
DO $$
DECLARE
  total_amount BIGINT;
  transaction_count INTEGER;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(total_amount_cents), 0)
  INTO transaction_count, total_amount
  FROM public.payment_transactions
  WHERE service_application_id IN (
    '3ebd8a88-257c-451e-aa53-13c57d1b563a',
    '273c65fa-8c7c-4fd5-a562-af93ca1778c6',
    '321ff2f0-9505-4876-ab9d-e6ebf08705fe',
    '02c9848c-c93f-475c-b99d-a94e28393d06',
    'fe614692-5b26-4d30-833b-f59e71003dfa'
  );
  
  RAISE NOTICE 'About to delete % payment transaction(s) totaling % cents ($%.2f)', 
    transaction_count, total_amount, total_amount::numeric / 100;
END $$;

-- Delete the payment transactions for Dog Permit applications
DELETE FROM public.payment_transactions
WHERE service_application_id IN (
  '3ebd8a88-257c-451e-aa53-13c57d1b563a',
  '273c65fa-8c7c-4fd5-a562-af93ca1778c6',
  '321ff2f0-9505-4876-ab9d-e6ebf08705fe',
  '02c9848c-c93f-475c-b99d-a94e28393d06',
  'fe614692-5b26-4d30-833b-f59e71003dfa'
);

-- Verify deletion
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count
  FROM public.payment_transactions
  WHERE service_application_id IN (
    '3ebd8a88-257c-451e-aa53-13c57d1b563a',
    '273c65fa-8c7c-4fd5-a562-af93ca1778c6',
    '321ff2f0-9505-4876-ab9d-e6ebf08705fe',
    '02c9848c-c93f-475c-b99d-a94e28393d06',
    'fe614692-5b26-4d30-833b-f59e71003dfa'
  );
  
  RAISE NOTICE 'Remaining Dog Permit payment transactions after deletion: %', remaining_count;
END $$;