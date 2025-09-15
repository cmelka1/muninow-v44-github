-- Fix license number generation to handle both BL-YYYY-NNNNNN and YYYY-NNNNNN formats
-- This prevents duplicate key violations by considering all existing formats

CREATE OR REPLACE FUNCTION public.generate_license_number()
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  new_number TEXT;
  counter INTEGER;
  max_retries INTEGER := 10;
  retry_count INTEGER := 0;
  current_year TEXT;
BEGIN
  LOOP
    -- Get the current year
    SELECT EXTRACT(year FROM NOW())::TEXT INTO current_year;
    
    -- Get the highest existing license number for this year from BOTH formats
    -- Look for both "BL-YYYY-NNNNNN" and "YYYY-NNNNNN" patterns
    SELECT COALESCE(
      MAX(
        CASE 
          -- Handle BL-YYYY-NNNNNN format
          WHEN license_number LIKE 'BL-' || current_year || '-%' THEN 
            CAST(SPLIT_PART(license_number, '-', 3) AS INTEGER)
          -- Handle YYYY-NNNNNN format  
          WHEN license_number LIKE current_year || '-%' AND license_number NOT LIKE 'BL-%' THEN 
            CAST(SPLIT_PART(license_number, '-', 2) AS INTEGER)
          ELSE 0
        END
      ), 0
    ) + 1 INTO counter
    FROM business_license_applications 
    WHERE license_number IS NOT NULL
      AND (
        license_number LIKE 'BL-' || current_year || '-%' OR 
        license_number LIKE current_year || '-%'
      );
    
    -- Format as YYYY-NNNNNN (without BL- prefix for new records)
    new_number := current_year || '-' || LPAD(counter::TEXT, 6, '0');
    
    -- Check if this number already exists (should be rare with MAX approach)
    IF NOT EXISTS (
      SELECT 1 FROM business_license_applications 
      WHERE license_number = new_number OR license_number = 'BL-' || new_number
    ) THEN
      RETURN new_number;
    END IF;
    
    -- If we get here, there was still a conflict, retry
    retry_count := retry_count + 1;
    IF retry_count >= max_retries THEN
      -- As a last resort, add a random suffix
      new_number := new_number || '-' || FLOOR(RANDOM() * 1000)::TEXT;
      RETURN new_number;
    END IF;
    
    -- Small delay before retry to reduce collision probability
    PERFORM pg_sleep(0.01);
  END LOOP;
END;
$function$;