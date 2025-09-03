-- Phase 2: Delete payment history records for Hinsdale customer
-- This removes payment records that reference Hinsdale applications/bills
DELETE FROM public.payment_history 
WHERE customer_id = 'd20b3740-65ff-4408-b8ec-8cba38a8a687';