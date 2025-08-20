-- Insert business license types for Village of Hinsdale
INSERT INTO public.business_license_types (
  customer_id,
  name,
  description,
  base_fee_cents,
  processing_days,
  requires_inspection,
  is_active
) VALUES
  (
    'd20b3740-65ff-4408-b8ec-8cba38a8a687',
    'Retail & Trade',
    'License for retail businesses, sales operations, and trade establishments',
    7500,
    7,
    false,
    true
  ),
  (
    'd20b3740-65ff-4408-b8ec-8cba38a8a687',
    'Professional Services',
    'License for professional service providers including consultants, lawyers, accountants, and other professional practices',
    7500,
    7,
    false,
    true
  ),
  (
    'd20b3740-65ff-4408-b8ec-8cba38a8a687',
    'Construction & Contracting',
    'License for construction companies, contractors, builders, and related trades',
    7500,
    7,
    true,
    true
  ),
  (
    'd20b3740-65ff-4408-b8ec-8cba38a8a687',
    'Industrial & Manufacturing',
    'License for industrial operations, manufacturing facilities, and production businesses',
    7500,
    7,
    false,
    true
  ),
  (
    'd20b3740-65ff-4408-b8ec-8cba38a8a687',
    'Personal Services',
    'License for personal service businesses including salons, fitness centers, cleaning services, and similar establishments',
    7500,
    7,
    false,
    true
  ),
  (
    'd20b3740-65ff-4408-b8ec-8cba38a8a687',
    'Hospitality & Lodging',
    'License for hotels, restaurants, catering, bars, and other hospitality businesses',
    7500,
    7,
    true,
    true
  ),
  (
    'd20b3740-65ff-4408-b8ec-8cba38a8a687',
    'Other',
    'General business license for operations not covered by other specific categories',
    7500,
    7,
    false,
    true
  );