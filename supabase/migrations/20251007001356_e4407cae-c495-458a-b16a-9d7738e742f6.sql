-- Add 'issued' status to tax_submissions submission_status constraint
ALTER TABLE tax_submissions 
DROP CONSTRAINT IF EXISTS tax_submissions_submission_status_check;

ALTER TABLE tax_submissions 
ADD CONSTRAINT tax_submissions_submission_status_check 
CHECK (submission_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'issued'));