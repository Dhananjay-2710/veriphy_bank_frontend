-- =============================================================================
-- DATABASE STRUCTURE CHECK
-- =============================================================================
-- Run this first to see what tables and columns actually exist in your database
-- =============================================================================

-- Check if all required tables exist
SELECT 'Checking if required tables exist...' as status;

SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations') 
    THEN '✅ organizations table exists' 
    ELSE '❌ organizations table missing' 
  END as organizations_status,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') 
    THEN '✅ users table exists' 
    ELSE '❌ users table missing' 
  END as users_status,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cases') 
    THEN '✅ cases table exists' 
    ELSE '❌ cases table missing' 
  END as cases_status,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') 
    THEN '✅ customers table exists' 
    ELSE '❌ customers table missing' 
  END as customers_status;

-- Show all available tables
SELECT 'All tables in your database:' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check organizations table structure
SELECT 'Organizations table structure:' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'organizations' 
ORDER BY ordinal_position;

-- Check users table structure
SELECT 'Users table structure:' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check cases table structure
SELECT 'Cases table structure:' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cases' 
ORDER BY ordinal_position;

-- Check customers table structure
SELECT 'Customers table structure:' as status;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- Check if optional tables exist
SELECT 'Optional tables status:' as status;
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'compliance_issues') 
    THEN '✅ compliance_issues table exists' 
    ELSE '❌ compliance_issues table missing' 
  END as compliance_issues_status,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documents') 
    THEN '✅ documents table exists' 
    ELSE '❌ documents table missing' 
  END as documents_status,
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'logs') 
    THEN '✅ logs table exists' 
    ELSE '❌ logs table missing' 
  END as logs_status;

-- Check existing data
SELECT 'Existing data counts:' as status;
SELECT 'Organizations' as table_name, COUNT(*) as count FROM organizations WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'organizations')
UNION ALL
SELECT 'Users', COUNT(*) FROM users WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')
UNION ALL
SELECT 'Cases', COUNT(*) FROM cases WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cases')
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers');

-- Check if Meera Joshi user exists (for credit-ops testing)
SELECT 'Checking for Meera Joshi user...' as status;
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM users WHERE email = 'meera.joshi@veriphy.com') 
    THEN '✅ Meera Joshi user exists' 
    ELSE '❌ Meera Joshi user missing' 
  END as meera_status;

-- If Meera exists, show her details
SELECT 'Meera Joshi user details:' as status;
SELECT id, email, full_name, role, organization_id, department_id 
FROM users 
WHERE email = 'meera.joshi@veriphy.com';

-- =============================================================================
-- END OF STRUCTURE CHECK
-- =============================================================================
