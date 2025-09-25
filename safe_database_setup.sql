-- =============================================================================
-- SAFE DATABASE SETUP - CHECKS TABLE STRUCTURE FIRST
-- =============================================================================
-- This script checks table structure before inserting data to avoid column errors
-- =============================================================================

-- First, let's check what columns exist in each table
SELECT 'Checking organizations table structure...' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
ORDER BY ordinal_position;

SELECT 'Checking users table structure...' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT 'Checking cases table structure...' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cases' 
ORDER BY ordinal_position;

SELECT 'Checking customers table structure...' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- =============================================================================
-- SAFE DATA INSERTION - ONLY INSERT INTO EXISTING COLUMNS
-- =============================================================================

-- Insert organizations (only basic columns)
INSERT INTO organizations (id, name, code, description, email, phone, created_at, updated_at)
VALUES 
(1, 'Veriphy Bank Main Branch', 'VB001', 'Main banking branch for Veriphy Bank', 'main@veriphy.com', '+91-11-23456789', NOW(), NOW()),
(2, 'Veriphy Bank Delhi Branch', 'VB002', 'Delhi regional branch', 'delhi@veriphy.com', '+91-11-23456790', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert departments
INSERT INTO departments (id, organization_id, name, code, description, created_at, updated_at)
VALUES 
(1, 1, 'Credit Operations', 'CREDIT_OPS', 'Credit operations and loan processing', NOW(), NOW()),
(2, 1, 'Compliance', 'COMPLIANCE', 'Compliance and risk management', NOW(), NOW()),
(3, 1, 'Sales', 'SALES', 'Sales and customer acquisition', NOW(), NOW()),
(4, 1, 'Documentation', 'DOCS', 'Document verification and management', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert products (only basic columns)
INSERT INTO products (id, organization_id, name, code, description, created_at, updated_at)
VALUES 
(1, 1, 'Home Loan', 'HOME_LOAN', 'Home loan for property purchase', NOW(), NOW()),
(2, 1, 'Personal Loan', 'PERSONAL_LOAN', 'Personal loan for various purposes', NOW(), NOW()),
(3, 1, 'Business Loan', 'BUSINESS_LOAN', 'Business loan for entrepreneurs', NOW(), NOW()),
(4, 1, 'Auto Loan', 'AUTO_LOAN', 'Vehicle financing', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert users (only basic columns)
INSERT INTO users (id, email, full_name, mobile, role, organization_id, department_id, created_at, updated_at)
VALUES 
(1, 'meera.joshi@veriphy.com', 'Meera Joshi', '+91-9876543210', 'credit-ops', 1, 1, NOW(), NOW()),
(2, 'anita.patel@veriphy.com', 'Anita Patel', '+91-9876543211', 'compliance', 1, 2, NOW(), NOW()),
(3, 'priya.sharma@veriphy.com', 'Priya Sharma', '+91-9876543212', 'credit-ops', 1, 1, NOW(), NOW()),
(4, 'vikram.joshi@veriphy.com', 'Vikram Joshi', '+91-9876543213', 'manager', 1, 1, NOW(), NOW()),
(5, 'arjun.reddy@veriphy.com', 'Arjun Reddy', '+91-9876543214', 'credit-ops', 1, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert customers (only basic columns)
INSERT INTO customers (id, organization_id, full_name, email, mobile, created_at, updated_at)
VALUES 
(1, 1, 'Ramesh & Sunita Gupta', 'ramesh.gupta@email.com', '+91-9876543210', NOW(), NOW()),
(2, 1, 'Deepak Agarwal', 'deepak.agarwal@email.com', '+91-9876543211', NOW(), NOW()),
(3, 1, 'Rohit Sharma', 'rohit.sharma@email.com', '+91-9876543212', NOW(), NOW()),
(4, 1, 'Kavya Menon', 'kavya.menon@email.com', '+91-9876543213', NOW(), NOW()),
(5, 1, 'Sanjay Patel', 'sanjay.patel@email.com', '+91-9876543214', NOW(), NOW()),
(6, 1, 'Meera Krishnan', 'meera.krishnan@email.com', '+91-9876543215', NOW(), NOW()),
(7, 1, 'Rajesh Kumar', 'rajesh.kumar@email.com', '+91-9876543216', NOW(), NOW()),
(8, 1, 'Ananya Sharma', 'ananya.sharma@email.com', '+91-9876543217', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert cases (only basic columns)
INSERT INTO cases (id, organization_id, case_number, customer_id, product_id, loan_type, loan_amount, status, priority, created_at, updated_at)
VALUES 
-- Cases for Approval Queue (status: review, in-progress, new)
(1, 1, 'CASE-001', 1, 1, 'Home Loan', 5000000, 'review', 'high', NOW() - INTERVAL '2 hours', NOW()),
(2, 1, 'CASE-002', 2, 3, 'Business Loan', 2500000, 'in-progress', 'high', NOW() - INTERVAL '4 hours', NOW()),
(3, 1, 'CASE-003', 3, 2, 'Personal Loan', 300000, 'new', 'medium', NOW() - INTERVAL '1 hour', NOW()),
(4, 1, 'CASE-004', 4, 1, 'Home Loan', 3500000, 'review', 'medium', NOW() - INTERVAL '3 hours', NOW()),
(5, 1, 'CASE-005', 5, 3, 'Business Loan', 1500000, 'in-progress', 'high', NOW() - INTERVAL '5 hours', NOW()),

-- Cases for Compliance Review (status: on-hold for compliance issues)
(6, 1, 'CASE-006', 6, 2, 'Personal Loan', 200000, 'on-hold', 'high', NOW() - INTERVAL '6 hours', NOW()),
(7, 1, 'CASE-007', 7, 4, 'Auto Loan', 800000, 'on-hold', 'medium', NOW() - INTERVAL '8 hours', NOW()),
(8, 1, 'CASE-008', 8, 1, 'Home Loan', 4000000, 'on-hold', 'high', NOW() - INTERVAL '7 hours', NOW()),

-- Approved and Rejected cases
(9, 1, 'CASE-009', 1, 2, 'Personal Loan', 150000, 'approved', 'low', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),
(10, 1, 'CASE-010', 2, 4, 'Auto Loan', 600000, 'approved', 'medium', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
(11, 1, 'CASE-011', 3, 3, 'Business Loan', 500000, 'rejected', 'low', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Insert compliance issues (only if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'compliance_issues') THEN
        INSERT INTO compliance_issues (id, organization_id, case_id, customer_id, title, description, status, severity, priority, created_at, updated_at)
        VALUES 
        (1, 1, 1, 1, 'Income Document Mismatch', 'Income declared in application does not match bank statements provided', 'open', 'high', 'high', NOW(), NOW()),
        (2, 1, 4, 4, 'KYC Verification Pending', 'Customer identity verification pending from field team', 'in_progress', 'medium', 'medium', NOW(), NOW()),
        (3, 1, 6, 6, 'Credit Score Drop', 'Credit score dropped by 15 points since application submission', 'resolved', 'low', 'low', NOW(), NOW()),
        (4, 1, 7, 7, 'PEP List Alert', 'Customer appears on PEP (Politically Exposed Person) list', 'escalated', 'high', 'high', NOW(), NOW()),
        (5, 1, 8, 8, 'Business Address Verification', 'Business address verification pending from field team', 'open', 'medium', 'medium', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
    ELSE
        RAISE NOTICE 'compliance_issues table does not exist, skipping...';
    END IF;
END $$;

-- Insert documents (only if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'documents') THEN
        INSERT INTO documents (id, organization_id, customer_id, status, created_at, updated_at)
        VALUES 
        (1, 1, 1, 'verified', NOW(), NOW()),
        (2, 1, 1, 'verified', NOW(), NOW()),
        (3, 1, 1, 'pending', NOW(), NOW()),
        (4, 1, 2, 'verified', NOW(), NOW()),
        (5, 1, 2, 'verified', NOW(), NOW()),
        (6, 1, 3, 'pending', NOW(), NOW()),
        (7, 1, 4, 'verified', NOW(), NOW()),
        (8, 1, 5, 'verified', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
    ELSE
        RAISE NOTICE 'documents table does not exist, skipping...';
    END IF;
END $$;

-- Insert audit logs (only if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'logs') THEN
        INSERT INTO logs (id, organization_id, user_id, action, entity_type, entity_id, description, created_at, updated_at)
        VALUES 
        (1, 1, 1, 'LOGIN', 'user', 1, 'User logged in successfully', NOW(), NOW()),
        (2, 1, 1, 'CREATE', 'case', 1, 'New loan application created', NOW(), NOW()),
        (3, 1, 2, 'UPDATE', 'case', 1, 'Case status updated to review', NOW(), NOW()),
        (4, 1, 2, 'CREATE', 'compliance_issue', 1, 'Compliance issue created', NOW(), NOW()),
        (5, 1, 1, 'APPROVE', 'case', 9, 'Loan application approved', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
    ELSE
        RAISE NOTICE 'logs table does not exist, skipping...';
    END IF;
END $$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check data counts
SELECT 'Data counts after insertion:' as status;

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
SELECT 'Cases by status:' as status;
SELECT status, COUNT(*) as count FROM cases GROUP BY status ORDER BY status;

-- Show sample cases for approval queue
SELECT 'Sample cases for Approval Queue:' as status;
SELECT 
  case_number,
  c.full_name as customer_name,
  c.mobile as customer_phone,
  loan_type,
  loan_amount,
  status,
  priority,
  created_at
FROM cases 
JOIN customers c ON cases.customer_id = c.id
WHERE status IN ('new', 'in-progress', 'review')
ORDER BY priority DESC, created_at ASC
LIMIT 5;

-- =============================================================================
-- END OF SAFE SETUP SCRIPT
-- =============================================================================
