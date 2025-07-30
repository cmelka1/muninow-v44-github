-- Insert a test document record for the first permit we found
INSERT INTO permit_documents (
  permit_id,
  user_id,
  customer_id,
  merchant_id,
  file_name,
  document_type,
  storage_path,
  file_size,
  content_type,
  uploaded_at,
  created_at,
  updated_at
) VALUES (
  '8abcc7ae-166a-4424-a4dd-8e7242507aaa'::uuid,
  '24ed7570-d3ff-4015-abed-8dec75318b44'::uuid, -- Extracted from storage path
  '24ed7570-d3ff-4015-abed-8dec75318b44'::uuid, -- Same as user for now
  '8abcc7ae-166a-4424-a4dd-8e7242507aaa'::uuid, -- Using permit_id as merchant_id for now
  'MuniNow Banner No Logo.png',
  'uploaded_document',
  '24ed7570-d3ff-4015-abed-8dec75318b44/permits/8abcc7ae-166a-4424-a4dd-8e7242507aaa/1753826768659-MuniNow Banner No Logo.png',
  500000, -- Approximate file size
  'image/png',
  '2025-07-29 22:06:08.915934+00',
  now(),
  now()
);