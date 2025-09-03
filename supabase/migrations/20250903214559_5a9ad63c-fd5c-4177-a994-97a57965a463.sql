-- Fix RLS policies to use lowercase role names
-- This updates all existing RLS policies that reference camelCase role names

-- First, get all policies that reference the old camelCase role names
DO $$
DECLARE
    policy_record RECORD;
    new_definition TEXT;
BEGIN
    -- Update all policies that reference 'superAdmin' role
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname, definition
        FROM pg_policies 
        WHERE definition LIKE '%superAdmin%'
    LOOP
        -- Replace 'superAdmin' with 'superadmin' in the policy definition
        new_definition := REPLACE(policy_record.definition, '''superAdmin''', '''superadmin''');
        
        -- Drop and recreate the policy with the new definition
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename);
            
        -- Extract the policy type and using/check clauses from the definition
        -- This is a simplified approach - we'll recreate the most common policy patterns
        IF policy_record.definition LIKE '%FOR SELECT%' THEN
            IF policy_record.definition LIKE '%USING%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR SELECT USING (%s)', 
                    policy_record.policyname,
                    policy_record.schemaname,
                    policy_record.tablename,
                    SUBSTRING(new_definition FROM 'USING \((.*)\)'));
            END IF;
        ELSIF policy_record.definition LIKE '%FOR INSERT%' THEN
            IF policy_record.definition LIKE '%WITH CHECK%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR INSERT WITH CHECK (%s)', 
                    policy_record.policyname,
                    policy_record.schemaname,
                    policy_record.tablename,
                    SUBSTRING(new_definition FROM 'WITH CHECK \((.*)\)'));
            END IF;
        ELSIF policy_record.definition LIKE '%FOR UPDATE%' THEN
            IF policy_record.definition LIKE '%USING%' AND policy_record.definition LIKE '%WITH CHECK%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR UPDATE USING (%s) WITH CHECK (%s)', 
                    policy_record.policyname,
                    policy_record.schemaname,
                    policy_record.tablename,
                    SUBSTRING(new_definition FROM 'USING \((.*?)\)'),
                    SUBSTRING(new_definition FROM 'WITH CHECK \((.*)\)'));
            ELSIF policy_record.definition LIKE '%USING%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR UPDATE USING (%s)', 
                    policy_record.policyname,
                    policy_record.schemaname,
                    policy_record.tablename,
                    SUBSTRING(new_definition FROM 'USING \((.*)\)'));
            END IF;
        ELSIF policy_record.definition LIKE '%FOR DELETE%' THEN
            IF policy_record.definition LIKE '%USING%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR DELETE USING (%s)', 
                    policy_record.policyname,
                    policy_record.schemaname,
                    policy_record.tablename,
                    SUBSTRING(new_definition FROM 'USING \((.*)\)'));
            END IF;
        ELSIF policy_record.definition LIKE '%FOR ALL%' THEN
            IF policy_record.definition LIKE '%USING%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING (%s)', 
                    policy_record.policyname,
                    policy_record.schemaname,
                    policy_record.tablename,
                    SUBSTRING(new_definition FROM 'USING \((.*)\)'));
            END IF;
        END IF;
    END LOOP;
    
    -- Update policies that reference other camelCase roles
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname, definition
        FROM pg_policies 
        WHERE definition LIKE '%residentAdmin%' 
           OR definition LIKE '%businessAdmin%' 
           OR definition LIKE '%municipalAdmin%'
    LOOP
        -- Replace all camelCase role names with lowercase versions
        new_definition := policy_record.definition;
        new_definition := REPLACE(new_definition, '''residentAdmin''', '''residentadmin''');
        new_definition := REPLACE(new_definition, '''businessAdmin''', '''businessadmin''');
        new_definition := REPLACE(new_definition, '''municipalAdmin''', '''municipaladmin''');
        
        -- Drop and recreate the policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            policy_record.policyname, 
            policy_record.schemaname, 
            policy_record.tablename);
            
        -- Recreate based on policy type
        IF policy_record.definition LIKE '%FOR SELECT%' THEN
            IF policy_record.definition LIKE '%USING%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR SELECT USING (%s)', 
                    policy_record.policyname,
                    policy_record.schemaname,
                    policy_record.tablename,
                    SUBSTRING(new_definition FROM 'USING \((.*)\)'));
            END IF;
        ELSIF policy_record.definition LIKE '%FOR INSERT%' THEN
            IF policy_record.definition LIKE '%WITH CHECK%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR INSERT WITH CHECK (%s)', 
                    policy_record.policyname,
                    policy_record.schemaname,
                    policy_record.tablename,
                    SUBSTRING(new_definition FROM 'WITH CHECK \((.*)\)'));
            END IF;
        ELSIF policy_record.definition LIKE '%FOR UPDATE%' THEN
            IF policy_record.definition LIKE '%USING%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR UPDATE USING (%s)', 
                    policy_record.policyname,
                    policy_record.schemaname,
                    policy_record.tablename,
                    SUBSTRING(new_definition FROM 'USING \((.*)\)'));
            END IF;
        ELSIF policy_record.definition LIKE '%FOR DELETE%' THEN
            IF policy_record.definition LIKE '%USING%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR DELETE USING (%s)', 
                    policy_record.policyname,
                    policy_record.schemaname,
                    policy_record.tablename,
                    SUBSTRING(new_definition FROM 'USING \((.*)\)'));
            END IF;
        ELSIF policy_record.definition LIKE '%FOR ALL%' THEN
            IF policy_record.definition LIKE '%USING%' THEN
                EXECUTE format('CREATE POLICY %I ON %I.%I FOR ALL USING (%s)', 
                    policy_record.policyname,
                    policy_record.schemaname,
                    policy_record.tablename,
                    SUBSTRING(new_definition FROM 'USING \((.*)\)'));
            END IF;
        END IF;
    END LOOP;
END
$$;