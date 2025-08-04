-- Fix permit number sequence collision by setting correct starting sequence
-- Find the highest existing permit number for year '25' and update sequence table

DO $$
DECLARE
  max_sequence_num INTEGER := 0;
  current_year_code TEXT := '25';
BEGIN
  -- Find the highest sequence number from existing permit numbers for current year
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN permit_number ~ '^PM25\d{4}$' 
        THEN CAST(SUBSTRING(permit_number FROM 5) AS INTEGER)
        ELSE 0
      END
    ), 0
  ) INTO max_sequence_num
  FROM public.permit_applications
  WHERE permit_number LIKE 'PM25%';
  
  -- Update the sequence table to start from the next available number
  INSERT INTO public.permit_number_sequences (year_code, next_sequence, updated_at)
  VALUES (current_year_code, max_sequence_num + 1, NOW())
  ON CONFLICT (year_code) 
  DO UPDATE SET 
    next_sequence = max_sequence_num + 1,
    updated_at = NOW();
    
  -- Log the operation for debugging
  RAISE NOTICE 'Updated permit sequence for year % to start from %', current_year_code, max_sequence_num + 1;
END $$;