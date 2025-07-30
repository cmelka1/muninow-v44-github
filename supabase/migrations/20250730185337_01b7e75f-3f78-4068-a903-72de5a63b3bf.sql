-- Add RLS policies for permit_documents table
-- Enable RLS if not already enabled
ALTER TABLE permit_documents ENABLE ROW LEVEL SECURITY;

-- Policy for municipal users to view permit documents for their customer
CREATE POLICY "Municipal users can view permit documents for their customer" 
ON permit_documents 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.account_type = 'municipal' 
  AND profiles.customer_id = permit_documents.customer_id
));

-- Policy for users to view their own permit documents
CREATE POLICY "Users can view their own permit documents" 
ON permit_documents 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy for municipal users to insert permit documents for their customer
CREATE POLICY "Municipal users can insert permit documents for their customer" 
ON permit_documents 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.account_type = 'municipal' 
  AND profiles.customer_id = permit_documents.customer_id
));

-- Policy for users to insert permit documents for their own permits
CREATE POLICY "Users can insert permit documents for their own permits" 
ON permit_documents 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Policy for municipal users to update permit documents for their customer
CREATE POLICY "Municipal users can update permit documents for their customer" 
ON permit_documents 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.account_type = 'municipal' 
  AND profiles.customer_id = permit_documents.customer_id
));

-- Policy for users to update their own permit documents
CREATE POLICY "Users can update their own permit documents" 
ON permit_documents 
FOR UPDATE 
USING (user_id = auth.uid());

-- Policy for municipal users to delete permit documents for their customer
CREATE POLICY "Municipal users can delete permit documents for their customer" 
ON permit_documents 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.account_type = 'municipal' 
  AND profiles.customer_id = permit_documents.customer_id
));

-- Policy for users to delete their own permit documents
CREATE POLICY "Users can delete their own permit documents" 
ON permit_documents 
FOR DELETE 
USING (user_id = auth.uid());