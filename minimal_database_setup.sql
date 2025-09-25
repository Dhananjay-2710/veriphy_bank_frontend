-- =============================================================================
-- MINIMAL DATABASE SETUP - ONLY REQUIRED DATA
-- =============================================================================
-- This script inserts only the minimum required data to make the components work
-- =============================================================================

-- Clear any existing test data first (optional - comment out if you want to keep existing data)
-- DELETE FROM cases WHERE case_number LIKE 'CASE-%';
-- DELETE FROM customers WHERE email LIKE '%@email.com';
-- DELETE FROM users WHERE email LIKE '%@veriphy.com';
-- DELETE FROM products WHERE name IN ('Home Loan', 'Personal Loan', 'Business Loan', 'Auto Loan');
-- DELETE FROM departments WHERE name IN ('Credit Operations', 'Compliance', 'Sales', 'Documentation');
-- DELETE FROM organizations WHERE name LIKE 'Veriphy Bank%';

-- =============================================================================
-- 1. ORGANIZATIONS (Minimal)
-- =============================================================================
INSERT INTO organizations (id, name, created_at, updated_at)
VALUES (1, 'Veriphy Bank', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  updated_at = NOW();

-- =============================================================================
-- 2. DEPARTMENTS (Minimal)
-- =============================================================================
INSERT INTO departments (id, organization_id, name, created_at, updated_at)
VALUES 
(1, 1, 'Credit Operations', NOW(), NOW()),
(2, 1, 'Compliance', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  updated_at = NOW();

-- =============================================================================
-- 3. PRODUCTS (Minimal - with required code)
-- =============================================================================
INSERT INTO products (id, organization_id, name, code, created_at, updated_at)
VALUES 
(1, 1, 'Home Loan', 'HOME_LOAN', NOW(), NOW()),
(2, 1, 'Personal Loan', 'PERSONAL_LOAN', NOW(), NOW()),
(3, 1, 'Business Loan', 'BUSINESS_LOAN', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  updated_at = NOW();

-- =============================================================================
-- 4. USERS (Minimal - Credit Ops User)
-- =============================================================================
-- Insert or update users, handling both id and email conflicts
INSERT INTO users (id, email, full_name, role, organization_id, department_id, created_at, updated_at)
VALUES 
(1, 'meera.joshi@veriphy.com', 'Meera Joshi', 'credit-ops', 1, 1, NOW(), NOW()),
(2, 'anita.patel@veriphy.com', 'Anita Patel', 'compliance', 1, 2, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  organization_id = EXCLUDED.organization_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW()
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  organization_id = EXCLUDED.organization_id,
  department_id = EXCLUDED.department_id,
  updated_at = NOW();

-- =============================================================================
-- 5. CUSTOMERS (Minimal)
-- =============================================================================
INSERT INTO customers (id, organization_id, full_name, email, created_at, updated_at)
VALUES 
(1, 1, 'Ramesh Gupta', 'ramesh.gupta@email.com', NOW(), NOW()),
(2, 1, 'Deepak Agarwal', 'deepak.agarwal@email.com', NOW(), NOW()),
(3, 1, 'Rohit Sharma', 'rohit.sharma@email.com', NOW(), NOW()),
(4, 1, 'Kavya Menon', 'kavya.menon@email.com', NOW(), NOW()),
(5, 1, 'Sanjay Patel', 'sanjay.patel@email.com', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = NOW();

-- =============================================================================
-- 6. CASES (Minimal - Only required columns)
-- =============================================================================
INSERT INTO cases (id, organization_id, customer_id, product_id, status, created_at, updated_at)
VALUES 
-- Cases for Approval Queue
(1, 1, 1, 1, 'review', NOW() - INTERVAL '2 hours', NOW()),
(2, 1, 2, 3, 'in-progress', NOW() - INTERVAL '4 hours', NOW()),
(3, 1, 3, 2, 'new', NOW() - INTERVAL '1 hour', NOW()),
(4, 1, 4, 1, 'review', NOW() - INTERVAL '3 hours', NOW()),
(5, 1, 5, 3, 'in-progress', NOW() - INTERVAL '5 hours', NOW()),

-- Cases for Compliance Review (on-hold)
(6, 1, 1, 2, 'on-hold', NOW() - INTERVAL '6 hours', NOW()),
(7, 1, 2, 1, 'on-hold', NOW() - INTERVAL '8 hours', NOW()),

-- Approved and Rejected cases
(8, 1, 3, 2, 'approved', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),
(9, 1, 4, 1, 'approved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
(10, 1, 5, 3, 'rejected', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  updated_at = NOW();

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Show what was inserted
SELECT 'Minimal data inserted successfully!' as status;

SELECT 'Data counts:' as info;
SELECT 'Organizations' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'Departments', COUNT(*) FROM departments
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Cases', COUNT(*) FROM cases;

-- Show cases by status
SELECT 'Cases by status:' as info;
SELECT status, COUNT(*) as count FROM cases GROUP BY status ORDER BY status;

-- Show sample cases for components
SELECT 'Cases for Approval Queue:' as info;
SELECT 
  id,
  c.full_name as customer_name,
  p.name as product_name,
  status,
  created_at
FROM cases 
JOIN customers c ON cases.customer_id = c.id
JOIN products p ON cases.product_id = p.id
WHERE status IN ('new', 'in-progress', 'review')
ORDER BY created_at ASC;

SELECT 'Cases for Compliance Review:' as info;
SELECT 
  id,
  c.full_name as customer_name,
  p.name as product_name,
  status,
  created_at
FROM cases 
JOIN customers c ON cases.customer_id = c.id
JOIN products p ON cases.product_id = p.id
WHERE status = 'on-hold'
ORDER BY created_at ASC;

-- Check if Meera Joshi user exists
SELECT 'Credit Ops User (Meera Joshi):' as info;
SELECT id, email, full_name, role, organization_id, department_id 
FROM users 
WHERE email = 'meera.joshi@veriphy.com';

-- =============================================================================
-- END OF MINIMAL SETUP
-- =============================================================================
