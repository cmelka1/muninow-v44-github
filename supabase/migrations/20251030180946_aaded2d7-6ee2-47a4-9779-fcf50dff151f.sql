-- Fix renewal_status for Business License #OAK-2024-000002
UPDATE business_license_applications
SET renewal_status = 'expiring_soon',
    updated_at = NOW()
WHERE license_number = 'OAK-2024-000002';