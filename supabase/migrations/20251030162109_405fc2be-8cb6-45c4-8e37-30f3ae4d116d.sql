-- Backdate business license OAK-2025-000002 to 2024 for renewal demonstration
UPDATE business_license_applications
SET 
  license_number = 'OAK-2024-000002',
  submitted_at = '2024-10-30 16:15:48.424099+00',
  approved_at = '2024-10-30 16:16:22.818922+00',
  issued_at = '2024-10-30 16:16:54.206243+00',
  original_issue_date = '2024-10-30 16:16:54.206243+00',
  expires_at = '2025-10-30 16:16:54.206243+00',
  renewal_status = 'expired',
  updated_at = NOW()
WHERE id = 'e59351de-6c98-426e-be35-eec8485661ff'
  AND license_number = 'OAK-2025-000002';