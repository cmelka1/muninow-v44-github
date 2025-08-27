-- Remove tax type restriction to allow custom municipality tax types
ALTER TABLE tax_submissions DROP CONSTRAINT tax_submissions_tax_type_check;