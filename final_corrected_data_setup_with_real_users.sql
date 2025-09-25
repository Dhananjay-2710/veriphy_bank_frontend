-- =============================================================================
-- FINAL CORRECTED DATA SETUP - USING REAL USER IDs AND DEPARTMENTS
-- =============================================================================
-- This script uses the actual user IDs and department IDs from your database
-- =============================================================================

-- =============================================================================
-- 1. ORGANIZATIONS (Only if missing)
-- =============================================================================
INSERT INTO organizations (id, name, created_at, updated_at)
VALUES (1, 'Veriphy Bank', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. DEPARTMENTS (Only if missing) - Based on user department assignments
-- =============================================================================
INSERT INTO departments (id, organization_id, name, created_at, updated_at)
VALUES 
(1, 1, 'Sales', NOW(), NOW()),
(2, 1, 'Management', NOW(), NOW()),
(3, 1, 'Credit Operations', NOW(), NOW()),
(4, 1, 'Administration', NOW(), NOW()),
(5, 1, 'Compliance', NOW(), NOW())
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
-- 4. CUSTOMERS (Only if missing) - Using valid kyc_status values
-- =============================================================================
INSERT INTO customers (id, organization_id, full_name, email, kyc_status, created_at, updated_at)
VALUES 
(1, 1, 'Ramesh Gupta', 'ramesh.gupta@email.com', 'verified', NOW(), NOW()),
(2, 1, 'Deepak Agarwal', 'deepak.agarwal@email.com', 'pending', NOW(), NOW()),
(3, 1, 'Rohit Sharma', 'rohit.sharma@email.com', 'verified', NOW(), NOW()),
(4, 1, 'Kavya Menon', 'kavya.menon@email.com', 'pending', NOW(), NOW()),
(5, 1, 'Sanjay Patel', 'sanjay.patel@email.com', 'rejected', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 5. CASES - Using valid case_status and case_priority values with real user IDs
-- =============================================================================
INSERT INTO cases (id, organization_id, case_number, customer_id, product_id, assigned_to, status, priority, created_at, updated_at)
VALUES 
-- Cases for Approval Queue - using 'open' and 'in_progress' status
(1, 1, 'CASE-2024-001', 1, 1, 47, 'open', 'high', NOW() - INTERVAL '2 hours', NOW()),
(2, 1, 'CASE-2024-002', 2, 3, 48, 'in_progress', 'medium', NOW() - INTERVAL '4 hours', NOW()),
(3, 1, 'CASE-2024-003', 3, 2, 49, 'open', 'high', NOW() - INTERVAL '1 hour', NOW()),
(4, 1, 'CASE-2024-004', 4, 1, 47, 'open', 'low', NOW() - INTERVAL '3 hours', NOW()),
(5, 1, 'CASE-2024-005', 5, 3, 48, 'in_progress', 'medium', NOW() - INTERVAL '5 hours', NOW()),

-- Cases for Compliance Review - using 'open' status (will be filtered by other criteria)
(6, 1, 'CASE-2024-006', 1, 2, 52, 'open', 'high', NOW() - INTERVAL '6 hours', NOW()),
(7, 1, 'CASE-2024-007', 2, 1, 53, 'open', 'medium', NOW() - INTERVAL '8 hours', NOW()),

-- Approved and Rejected cases
(8, 1, 'CASE-2024-008', 3, 2, 47, 'closed', 'low', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),
(9, 1, 'CASE-2024-009', 4, 1, 48, 'closed', 'medium', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
(10, 1, 'CASE-2024-010', 5, 3, 49, 'rejected', 'high', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. DOCUMENTS - Using valid doc_status values
-- =============================================================================
INSERT INTO documents (id, organization_id, customer_id, status, created_at, updated_at)
VALUES 
(1, 1, 1, 'verified', NOW() - INTERVAL '1 hour', NOW()),
(2, 1, 2, 'pending', NOW() - INTERVAL '2 hours', NOW()),
(3, 1, 3, 'verified', NOW() - INTERVAL '30 minutes', NOW()),
(4, 1, 4, 'pending', NOW() - INTERVAL '3 hours', NOW()),
(5, 1, 5, 'rejected', NOW() - INTERVAL '4 hours', NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. TASKS - Using valid task_status and task_priority values with real user IDs
-- =============================================================================
INSERT INTO tasks (id, organization_id, assigned_to, title, status, priority, created_at, updated_at)
VALUES 
(1, 1, 47, 'Review Ramesh Gupta Application', 'open', 'high', NOW() - INTERVAL '1 hour', NOW()),
(2, 1, 48, 'Verify Deepak Agarwal Documents', 'in_progress', 'normal', NOW() - INTERVAL '2 hours', NOW()),
(3, 1, 49, 'Process Rohit Sharma Loan', 'completed', 'high', NOW() - INTERVAL '3 hours', NOW()),
(4, 1, 47, 'Check Kavya Menon KYC', 'open', 'low', NOW() - INTERVAL '4 hours', NOW()),
(5, 1, 48, 'Follow up Sanjay Patel', 'overdue', 'high', NOW() - INTERVAL '5 hours', NOW()),
(6, 1, 52, 'Compliance Review - Ramesh Gupta', 'open', 'high', NOW() - INTERVAL '6 hours', NOW()),
(7, 1, 53, 'Compliance Review - Deepak Agarwal', 'in_progress', 'normal', NOW() - INTERVAL '7 hours', NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 8. UPDATE EXISTING USERS - Set correct department assignments
-- =============================================================================
-- Update Meera Joshi (ID: 47) - Credit Ops
UPDATE users 
SET 
  department_id = 3,
  updated_at = NOW()
WHERE id = 47;

-- Update Rahul Verma (ID: 48) - Credit Ops
UPDATE users 
SET 
  department_id = 3,
  updated_at = NOW()
WHERE id = 48;

-- Update Kavya Nair (ID: 49) - Credit Ops
UPDATE users 
SET 
  department_id = 3,
  updated_at = NOW()
WHERE id = 49;

-- Update Rohit Agarwal (ID: 52) - Compliance
UPDATE users 
SET 
  department_id = 5,
  updated_at = NOW()
WHERE id = 52;

-- Update Shilpa Mehta (ID: 53) - Compliance
UPDATE users 
SET 
  department_id = 5,
  updated_at = NOW()
WHERE id = 53;

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
SELECT 'Cases', COUNT(*) FROM cases
UNION ALL
SELECT 'Documents', COUNT(*) FROM documents
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks;

-- Show cases by status
SELECT 'Cases by status:' as info;
SELECT status, COUNT(*) as count FROM cases GROUP BY status ORDER BY status;

-- Show cases by priority
SELECT 'Cases by priority:' as info;
SELECT priority, COUNT(*) as count FROM cases GROUP BY priority ORDER BY priority;

-- Show customers by KYC status
SELECT 'Customers by KYC status:' as info;
SELECT kyc_status, COUNT(*) as count FROM customers GROUP BY kyc_status ORDER BY kyc_status;

-- Show documents by status
SELECT 'Documents by status:' as info;
SELECT status, COUNT(*) as count FROM documents GROUP BY status ORDER BY status;

-- Show tasks by status
SELECT 'Tasks by status:' as info;
SELECT status, COUNT(*) as count FROM tasks GROUP BY status ORDER BY status;

-- Show cases for Approval Queue (using 'open' and 'in_progress' status)
SELECT 'Cases for Approval Queue:' as info;
SELECT 
  c.id,
  cust.full_name as customer_name,
  p.name as product_name,
  u.full_name as assigned_to,
  c.status,
  c.priority,
  c.created_at
FROM cases c
JOIN customers cust ON c.customer_id = cust.id
JOIN products p ON c.product_id = p.id
LEFT JOIN users u ON c.assigned_to = u.id
WHERE c.status IN ('open', 'in_progress')
ORDER BY c.created_at ASC;

-- Show cases for Compliance Review (using 'open' status)
SELECT 'Cases for Compliance Review:' as info;
SELECT 
  c.id,
  cust.full_name as customer_name,
  p.name as product_name,
  u.full_name as assigned_to,
  c.status,
  c.priority,
  c.created_at
FROM cases c
JOIN customers cust ON c.customer_id = cust.id
JOIN products p ON c.product_id = p.id
LEFT JOIN users u ON c.assigned_to = u.id
WHERE c.status = 'open'
ORDER BY c.created_at ASC;

-- Show Credit Ops users
SELECT 'Credit Ops Users:' as info;
SELECT id, email, full_name, role, organization_id, department_id, status
FROM users 
WHERE role = 'credit-ops'
ORDER BY id;

-- Show Compliance users
SELECT 'Compliance Users:' as info;
SELECT id, email, full_name, role, organization_id, department_id, status
FROM users 
WHERE role = 'compliance'
ORDER BY id;

-- Show all users by department
SELECT 'Users by Department:' as info;
SELECT 
  d.name as department_name,
  u.full_name,
  u.role,
  u.status
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
ORDER BY d.name, u.full_name;

-- =============================================================================
-- END OF FINAL CORRECTED DATA SETUP WITH REAL USERS
-- =============================================================================
