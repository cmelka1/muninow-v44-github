-- Add a field to store information request details
ALTER TABLE permit_applications 
ADD COLUMN information_request_reason TEXT;