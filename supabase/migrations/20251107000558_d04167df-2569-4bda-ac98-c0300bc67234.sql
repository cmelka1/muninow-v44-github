-- Phase 1A: Add enum values first (must be committed before use)
ALTER TYPE service_application_status_enum ADD VALUE IF NOT EXISTS 'reserved';
ALTER TYPE service_application_status_enum ADD VALUE IF NOT EXISTS 'cancelled';