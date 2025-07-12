-- Rerun the match score calculation for all bills using the smart_bill_matching function
DO $$
DECLARE
    bill_record RECORD;
BEGIN
    -- Loop through all bills for the user and call smart_bill_matching for each
    FOR bill_record IN 
        SELECT bill_id 
        FROM master_bills 
        WHERE profile_id = '24ed7570-d3ff-4015-abed-8dec75318b44'
          AND user_id = '24ed7570-d3ff-4015-abed-8dec75318b44'
          AND created_by_system = 'BILL_GENERATOR_v1.0'
    LOOP
        -- Call the smart matching function for each bill
        PERFORM smart_bill_matching(bill_record.bill_id);
    END LOOP;
END $$;