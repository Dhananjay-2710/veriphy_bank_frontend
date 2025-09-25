-- =============================================================================
-- CORRECTED DATA SETUP - USING VALID ENUM VALUES
-- =============================================================================
-- This script uses only valid enum values that exist in your database
-- =============================================================================

-- =============================================================================
-- 1. ORGANIZATIONS (Only if missing)
-- =============================================================================
INSERT INTO organizations (id, name, created_at, updated_at)
VALUES (1, 'Veriphy Bank', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. DEPARTMENTS (Only if missing)
-- =============================================================================
INSERT INTO departments (id, organization_id, name, created_at, updated_at)
VALUES 
(1, 1, 'Credit Operations', NOW(), NOW()),
(2, 1, 'Compliance', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. PRODUCTS (Only if missing)
-- =============================================================================
INSERT INTO products (id, organization_id, name, code, created_at, updated_at)
VALUES 
(1, 1, 'Home Loan', 'HOME_LOAN', NOW(), NOW()),
(2, 1, 'Personal Loan', 'PERSONAL_LOAN', NOW(), NOW()),
(3, 1, 'Business Loan', 'BUSINESS_LOAN', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4. CUSTOMERS (Only if missing)
-- =============================================================================
INSERT INTO customers (id, organization_id, full_name, email, created_at, updated_at)
VALUES 
(1, 1, 'Ramesh Gupta', 'ramesh.gupta@email.com', NOW(), NOW()),
(2, 1, 'Deepak Agarwal', 'deepak.agarwal@email.com', NOW(), NOW()),
(3, 1, 'Rohit Sharma', 'rohit.sharma@email.com', NOW(), NOW()),
(4, 1, 'Kavya Menon', 'kavya.menon@email.com', NOW(), NOW()),
(5, 1, 'Sanjay Patel', 'sanjay.patel@email.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 5. CASES - Using only valid enum values
-- =============================================================================
-- Let's try with common enum values that are likely to exist
INSERT INTO cases (id, organization_id, customer_id, product_id, status, created_at, updated_at)
VALUES 
-- Cases for Approval Queue - using 'open' and 'in-progress' instead of 'review'
(1, 1, 1, 1, 'open', NOW() - INTERVAL '2 hours', NOW()),
(2, 1, 2, 3, 'in-progress', NOW() - INTERVAL '4 hours', NOW()),
(3, 1, 3, 2, 'open', NOW() - INTERVAL '1 hour', NOW()),
(4, 1, 4, 1, 'open', NOW() - INTERVAL '3 hours', NOW()),
(5, 1, 5, 3, 'in-progress', NOW() - INTERVAL '5 hours', NOW()),

-- Cases for Compliance Review - using 'pending' instead of 'on-hold'
(6, 1, 1, 2, 'pending', NOW() - INTERVAL '6 hours', NOW()),
(7, 1, 2, 1, 'pending', NOW() - INTERVAL '8 hours', NOW()),

-- Approved and Rejected cases
(8, 1, 3, 2, 'approved', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),
(9, 1, 4, 1, 'approved', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
(10, 1, 5, 3, 'rejected', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. UPDATE EXISTING USER (Meera Joshi) - Set correct role and organization
-- =============================================================================
UPDATE users 
SET 
  role = 'credit-ops',
  organization_id = 1,
  department_id = 1,
  updated_at = NOW()
WHERE email = 'meera.joshi@veriphy.com';

-- Also update Anita Patel if she exists
UPDATE users 
SET 
  role = 'compliance',
  organization_id = 1,
  department_id = 2,
  updated_at = NOW()
WHERE email = 'anita.patel@veriphy.com';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Show what was inserted/updated
SELECT 'Data setup completed!' as status;

-- Check data counts
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

-- Show cases for Approval Queue (using 'open' and 'in-progress' as review status)
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
WHERE status IN ('open', 'in-progress')
ORDER BY created_at ASC;

-- Show cases for Compliance Review (using 'pending' status)
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
WHERE status = 'pending'
ORDER BY created_at ASC;

-- Check Meera Joshi user details
SELECT 'Credit Ops User (Meera Joshi):' as info;
SELECT id, email, full_name, role, organization_id, department_id 
FROM users 
WHERE email = 'meera.joshi@veriphy.com';

-- Show all credit-ops users
SELECT 'All Credit Ops Users:' as info;
SELECT id, email, full_name, role, organization_id, department_id 
FROM users 
WHERE role = 'credit-ops';

-- =============================================================================
-- END OF CORRECTED DATA SETUP
-- =============================================================================
