-- Update service application dates for testing renewal functionality
-- This sets the Dog Permit application to expire in ~19 days, within the 30-day renewal window

UPDATE municipal_service_applications
SET expires_at = '2025-11-05 00:00:00+00'::timestamptz,
    issued_at = '2024-11-05 00:00:00+00'::timestamptz,
    original_issue_date = '2024-11-05 00:00:00+00'::timestamptz
WHERE id = '4e282abe-de8c-4ff4-adc0-86f18dc4c72b';