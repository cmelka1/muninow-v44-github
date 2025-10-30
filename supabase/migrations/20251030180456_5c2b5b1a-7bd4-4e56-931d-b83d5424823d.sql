-- Update Business License #OAK-2024-000002 to expire in 15 days (expiring_soon status)
UPDATE business_license_applications
SET expires_at = NOW() + INTERVAL '15 days',
    updated_at = NOW()
WHERE license_number = 'OAK-2024-000002';

-- Trigger renewal status recalculation
SELECT check_expiring_licenses();