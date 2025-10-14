-- =====================================================
-- Migration: Consolidate Duplicate Customer Columns
-- Date: 2025-10-10
-- Description: Remove duplicate columns (dob/date_of_birth, mobile/phone)
-- =====================================================

-- ============================================
-- STEP 1: DATA CONSOLIDATION
-- ============================================

-- Consolidate date_of_birth into dob (keep dob as primary)
-- If dob is null but date_of_birth has a value, copy it over
UPDATE customers
SET dob = COALESCE(dob, date_of_birth)
WHERE dob IS NULL AND date_of_birth IS NOT NULL;

-- Consolidate phone into mobile (keep mobile as primary)
-- If mobile is null but phone has a value, copy it over
UPDATE customers
SET mobile = COALESCE(mobile, phone)
WHERE mobile IS NULL AND phone IS NOT NULL;

-- ============================================
-- STEP 2: DROP REDUNDANT COLUMNS
-- ============================================

-- Drop the redundant date_of_birth column
ALTER TABLE customers 
DROP COLUMN IF EXISTS date_of_birth;

-- Drop the redundant phone column
ALTER TABLE customers 
DROP COLUMN IF EXISTS phone;

-- ============================================
-- STEP 3: ADD HELPFUL COMMENTS
-- ============================================

COMMENT ON COLUMN customers.dob IS 'Date of birth (consolidated from dob/date_of_birth)';
COMMENT ON COLUMN customers.mobile IS 'Mobile/phone number (consolidated from mobile/phone)';

-- ============================================
-- STEP 4: VERIFICATION QUERY
-- ============================================

-- Verify the changes
DO $$
DECLARE
    customer_count INTEGER;
    customers_with_dob INTEGER;
    customers_with_mobile INTEGER;
BEGIN
    SELECT COUNT(*) INTO customer_count FROM customers;
    SELECT COUNT(*) INTO customers_with_dob FROM customers WHERE dob IS NOT NULL;
    SELECT COUNT(*) INTO customers_with_mobile FROM customers WHERE mobile IS NOT NULL;
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Customer Column Consolidation Complete!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Total customers: %', customer_count;
    RAISE NOTICE 'Customers with DOB: %', customers_with_dob;
    RAISE NOTICE 'Customers with mobile: %', customers_with_mobile;
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Columns removed: date_of_birth, phone';
    RAISE NOTICE 'Columns kept: dob, mobile';
    RAISE NOTICE '==============================================';
END $$;

-- ============================================
-- STEP 5: UPDATE ANY VIEWS OR FUNCTIONS
-- ============================================

-- If you have any views that reference the old columns, they need to be updated
-- Example (uncomment if you have such views):
-- DROP VIEW IF EXISTS customer_summary;
-- CREATE VIEW customer_summary AS
-- SELECT 
--   id,
--   full_name,
--   email,
--   mobile,  -- Now uses consolidated mobile field
--   dob,     -- Now uses consolidated dob field
--   kyc_status,
--   organization_id
-- FROM customers
-- WHERE deleted_at IS NULL;

-- ============================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================

/*
-- If you need to rollback this migration, run:

-- Add back the columns
ALTER TABLE customers ADD COLUMN date_of_birth DATE;
ALTER TABLE customers ADD COLUMN phone VARCHAR(20);

-- Copy data back (though you'll lose any distinctions)
UPDATE customers SET date_of_birth = dob WHERE dob IS NOT NULL;
UPDATE customers SET phone = mobile WHERE mobile IS NOT NULL;

-- Add comments
COMMENT ON COLUMN customers.date_of_birth IS 'Date of birth (restored from rollback)';
COMMENT ON COLUMN customers.phone IS 'Phone number (restored from rollback)';
*/

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Migration 009: Customer column consolidation completed successfully!' AS status;

