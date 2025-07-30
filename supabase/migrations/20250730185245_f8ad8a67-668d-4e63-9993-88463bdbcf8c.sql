-- Insert document records for the existing permit
-- Since the storage files have different permit IDs, let's create a sample document for the real permit
INSERT INTO permit_documents (
  permit_id,
  user_id,
  customer_id,
  merchant_id,
  file_name,
  document_type,
  description,
  storage_path,
  file_size,
  content_type,
  uploaded_at,
  created_at,
  updated_at
) VALUES (
  '72394750-0907-40f2-8868-12e07b21bf8e'::uuid,
  '24ed7570-d3ff-4015-abed-8dec75318b44'::uuid,
  'd20b3740-65ff-4408-b8ec-8cba38a8a687'::uuid,
  '72394750-0907-40f2-8868-12e07b21bf8e'::uuid,
  'MuniNow Banner No Logo.png',
  'uploaded_document',
  'Sample permit document',
  '24ed7570-d3ff-4015-abed-8dec75318b44/permits/72394750-0907-40f2-8868-12e07b21bf8e/1753826768659-MuniNow Banner No Logo.png',
  500000,
  'image/png',
  now(),
  now(),
  now()
);