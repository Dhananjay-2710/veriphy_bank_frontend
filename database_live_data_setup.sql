-- =============================================================================
-- LIVE DATA SETUP FOR VERIPHY BANK FRONTEND COMPONENTS
-- =============================================================================
-- This script populates the database with data needed for:
-- 1. Approval Queue
-- 2. Compliance Reports
-- 3. Compliance Review
-- 4. Pending Reviews
-- =============================================================================

-- First, ensure all required tables exist and have proper structure
-- =============================================================================

-- Create case_status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE case_status AS ENUM ('new', 'in-progress', 'review', 'approved', 'rejected', 'on-hold');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create priority_level enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create compliance_issue_status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE compliance_issue_status AS ENUM ('open', 'in_progress', 'resolved', 'escalated', 'closed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create compliance_issue_severity enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE compliance_issue_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- 1. ORGANIZATIONS AND DEPARTMENTS
-- =============================================================================

-- Insert organizations if they don't exist
INSERT INTO organizations (id, name, code, description, email, phone, address, created_at, updated_at)
VALUES 
(1, 'Veriphy Bank Main Branch', 'VB001', 'Main banking branch for Veriphy Bank', 'main@veriphy.com', '+91-11-23456789', '123 Banking Street, Mumbai, Maharashtra', NOW(), NOW()),
(2, 'Veriphy Bank Delhi Branch', 'VB002', 'Delhi regional branch', 'delhi@veriphy.com', '+91-11-23456790', '456 Finance Avenue, New Delhi', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert departments
INSERT INTO departments (id, organization_id, name, code, description, created_at, updated_at)
VALUES 
(1, 1, 'Credit Operations', 'CREDIT_OPS', 'Credit operations and loan processing', NOW(), NOW()),
(2, 1, 'Compliance', 'COMPLIANCE', 'Compliance and risk management', NOW(), NOW()),
(3, 1, 'Sales', 'SALES', 'Sales and customer acquisition', NOW(), NOW()),
(4, 1, 'Documentation', 'DOCS', 'Document verification and management', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. USERS (Credit Ops and Compliance Staff)
-- =============================================================================

-- Insert users for testing
INSERT INTO users (id, email, full_name, mobile, role, organization_id, department_id, status, created_at, updated_at)
VALUES 
(1, 'meera.joshi@veriphy.com', 'Meera Joshi', '+91-9876543210', 'credit-ops', 1, 1, 'active', NOW(), NOW()),
(2, 'anita.patel@veriphy.com', 'Anita Patel', '+91-9876543211', 'compliance', 1, 2, 'active', NOW(), NOW()),
(3, 'priya.sharma@veriphy.com', 'Priya Sharma', '+91-9876543212', 'credit-ops', 1, 1, 'active', NOW(), NOW()),
(4, 'vikram.joshi@veriphy.com', 'Vikram Joshi', '+91-9876543213', 'manager', 1, 1, 'active', NOW(), NOW()),
(5, 'arjun.reddy@veriphy.com', 'Arjun Reddy', '+91-9876543214', 'credit-ops', 1, 1, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. PRODUCTS (Loan Products)
-- =============================================================================

-- Insert loan products
INSERT INTO products (id, organization_id, name, description, category, interest_rate, max_amount, min_amount, created_at, updated_at)
VALUES 
(1, 1, 'Home Loan', 'Home loan for property purchase', 'home', 8.5, 50000000, 500000, NOW(), NOW()),
(2, 1, 'Personal Loan', 'Personal loan for various purposes', 'personal', 12.0, 2000000, 50000, NOW(), NOW()),
(3, 1, 'Business Loan', 'Business loan for entrepreneurs', 'business', 10.5, 10000000, 100000, NOW(), NOW()),
(4, 1, 'Auto Loan', 'Vehicle financing', 'auto', 9.0, 3000000, 100000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4. CUSTOMERS
-- =============================================================================

-- Insert customers
INSERT INTO customers (id, user_id, organization_id, full_name, email, mobile, pan_number, aadhaar_number, kyc_status, monthly_income, created_at, updated_at)
VALUES 
(1, NULL, 1, 'Ramesh & Sunita Gupta', 'ramesh.gupta@email.com', '+91-9876543210', 'ABCDE1234F', '123456789012', 'verified', 75000, NOW(), NOW()),
(2, NULL, 1, 'Deepak Agarwal', 'deepak.agarwal@email.com', '+91-9876543211', 'FGHIJ5678K', '234567890123', 'verified', 120000, NOW(), NOW()),
(3, NULL, 1, 'Rohit Sharma', 'rohit.sharma@email.com', '+91-9876543212', 'LMNOP9012Q', '345678901234', 'verified', 45000, NOW(), NOW()),
(4, NULL, 1, 'Kavya Menon', 'kavya.menon@email.com', '+91-9876543213', 'RSTUV3456W', '456789012345', 'verified', 85000, NOW(), NOW()),
(5, NULL, 1, 'Sanjay Patel', 'sanjay.patel@email.com', '+91-9876543214', 'WXYZ7890A', '567890123456', 'verified', 95000, NOW(), NOW()),
(6, NULL, 1, 'Meera Krishnan', 'meera.krishnan@email.com', '+91-9876543215', 'BCDEF1234G', '678901234567', 'verified', 65000, NOW(), NOW()),
(7, NULL, 1, 'Rajesh Kumar', 'rajesh.kumar@email.com', '+91-9876543216', 'HIJKL5678M', '789012345678', 'verified', 55000, NOW(), NOW()),
(8, NULL, 1, 'Ananya Sharma', 'ananya.sharma@email.com', '+91-9876543217', 'NOPQR9012S', '890123456789', 'verified', 80000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 5. CASES (Loan Applications)
-- =============================================================================

-- Insert cases with different statuses for testing
INSERT INTO cases (id, organization_id, case_number, customer_id, assigned_to, product_id, loan_type, loan_amount, status, priority, notes, created_at, updated_at)
VALUES 
-- Cases for Approval Queue (status: review, in-progress, new)
(1, 1, 'CASE-001', 1, 1, 1, 'Home Loan', 5000000, 'review', 'high', 'High priority home loan case', NOW() - INTERVAL '2 hours', NOW()),
(2, 1, 'CASE-002', 2, 2, 3, 'Business Loan', 2500000, 'in-progress', 'high', 'Business loan for expansion', NOW() - INTERVAL '4 hours', NOW()),
(3, 1, 'CASE-003', 3, 1, 2, 'Personal Loan', 300000, 'new', 'medium', 'Personal loan application', NOW() - INTERVAL '1 hour', NOW()),
(4, 1, 'CASE-004', 4, 2, 1, 'Home Loan', 3500000, 'review', 'medium', 'Home loan for new property', NOW() - INTERVAL '3 hours', NOW()),
(5, 1, 'CASE-005', 5, 1, 3, 'Business Loan', 1500000, 'in-progress', 'high', 'Business working capital', NOW() - INTERVAL '5 hours', NOW()),

-- Cases for Compliance Review (status: on-hold for compliance issues)
(6, 1, 'CASE-006', 6, 2, 2, 'Personal Loan', 200000, 'on-hold', 'high', 'Compliance review required', NOW() - INTERVAL '6 hours', NOW()),
(7, 1, 'CASE-007', 7, 2, 4, 'Auto Loan', 800000, 'on-hold', 'medium', 'Document verification pending', NOW() - INTERVAL '8 hours', NOW()),
(8, 1, 'CASE-008', 8, 1, 1, 'Home Loan', 4000000, 'on-hold', 'high', 'KYC verification required', NOW() - INTERVAL '7 hours', NOW()),

-- Approved and Rejected cases
(9, 1, 'CASE-009', 1, 1, 2, 'Personal Loan', 150000, 'approved', 'low', 'Approved personal loan', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours'),
(10, 1, 'CASE-010', 2, 2, 4, 'Auto Loan', 600000, 'approved', 'medium', 'Approved auto loan', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
(11, 1, 'CASE-011', 3, 1, 3, 'Business Loan', 500000, 'rejected', 'low', 'Rejected due to insufficient income', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. COMPLIANCE ISSUE TYPES
-- =============================================================================

-- Insert compliance issue types
INSERT INTO compliance_issue_types (id, name, description, category, severity, created_at, updated_at)
VALUES 
(1, 'Document Mismatch', 'Income declared in application does not match bank statements', 'document_verification', 'high', NOW(), NOW()),
(2, 'KYC Verification', 'Customer identity verification pending', 'kyc_verification', 'medium', NOW(), NOW()),
(3, 'Income Verification', 'Employment verification document missing', 'income_verification', 'medium', NOW(), NOW()),
(4, 'Credit Score Drop', 'Credit score dropped since application', 'credit_assessment', 'low', NOW(), NOW()),
(5, 'PEP List Check', 'Customer appears on Politically Exposed Person list', 'aml_check', 'high', NOW(), NOW()),
(6, 'Address Verification', 'Business address verification pending', 'address_verification', 'medium', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. COMPLIANCE ISSUES
-- =============================================================================

-- Insert compliance issues for testing
INSERT INTO compliance_issues (id, organization_id, issue_type_id, case_id, customer_id, title, description, status, severity, priority, assigned_to, reported_by, reported_at, due_date, created_at, updated_at)
VALUES 
(1, 1, 1, 1, 1, 'Income Document Mismatch', 'Income declared in application does not match bank statements provided', 'open', 'high', 'high', 2, 1, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '2 days', NOW(), NOW()),
(2, 1, 2, 4, 4, 'KYC Verification Pending', 'Customer identity verification pending from field team', 'in_progress', 'medium', 'medium', 2, 1, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '1 day', NOW(), NOW()),
(3, 1, 4, 6, 6, 'Credit Score Drop', 'Credit score dropped by 15 points since application submission', 'resolved', 'low', 'low', 2, 1, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '1 hour', NOW(), NOW()),
(4, 1, 5, 7, 7, 'PEP List Alert', 'Customer appears on PEP (Politically Exposed Person) list', 'escalated', 'high', 'high', 4, 2, NOW() - INTERVAL '8 hours', NOW() + INTERVAL '1 day', NOW(), NOW()),
(5, 1, 6, 8, 8, 'Business Address Verification', 'Business address verification pending from field team', 'open', 'medium', 'medium', 2, 1, NOW() - INTERVAL '7 hours', NOW() + INTERVAL '2 days', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 8. DOCUMENTS
-- =============================================================================

-- Insert document types
INSERT INTO document_types (id, organization_id, name, description, category, is_required, created_at, updated_at)
VALUES 
(1, 1, 'PAN Card', 'Permanent Account Number card', 'identity', true, NOW(), NOW()),
(2, 1, 'Aadhaar Card', 'Aadhaar identification card', 'identity', true, NOW(), NOW()),
(3, 1, 'Bank Statements', 'Bank statements for last 6 months', 'financial', true, NOW(), NOW()),
(4, 1, 'Salary Slips', 'Last 3 months salary slips', 'income', true, NOW(), NOW()),
(5, 1, 'Property Documents', 'Property ownership documents', 'collateral', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert documents for cases
INSERT INTO documents (id, organization_id, customer_id, document_type_id, status, submitted_at, verified_by, verified_on, created_at, updated_at)
VALUES 
(1, 1, 1, 1, 'verified', NOW() - INTERVAL '1 day', 2, NOW() - INTERVAL '1 day', NOW(), NOW()),
(2, 1, 1, 2, 'verified', NOW() - INTERVAL '1 day', 2, NOW() - INTERVAL '1 day', NOW(), NOW()),
(3, 1, 1, 3, 'pending', NOW() - INTERVAL '2 hours', NULL, NULL, NOW(), NOW()),
(4, 1, 1, 4, 'verified', NOW() - INTERVAL '1 day', 2, NOW() - INTERVAL '1 day', NOW(), NOW()),
(5, 1, 2, 1, 'verified', NOW() - INTERVAL '2 days', 2, NOW() - INTERVAL '2 days', NOW(), NOW()),
(6, 1, 2, 2, 'verified', NOW() - INTERVAL '2 days', 2, NOW() - INTERVAL '2 days', NOW(), NOW()),
(7, 1, 2, 3, 'verified', NOW() - INTERVAL '2 days', 2, NOW() - INTERVAL '2 days', NOW(), NOW()),
(8, 1, 2, 4, 'verified', NOW() - INTERVAL '2 days', 2, NOW() - INTERVAL '2 days', NOW(), NOW()),
(9, 1, 3, 1, 'pending', NOW() - INTERVAL '1 hour', NULL, NULL, NOW(), NOW()),
(10, 1, 3, 2, 'pending', NOW() - INTERVAL '1 hour', NULL, NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 9. TASKS
-- =============================================================================

-- Insert tasks for workload management
INSERT INTO tasks (id, organization_id, title, description, status, priority, assigned_to, due_date, created_at, updated_at)
VALUES 
(1, 1, 'Review Case CASE-001', 'Review home loan application for Ramesh Gupta', 'open', 'high', 1, NOW() + INTERVAL '1 day', NOW(), NOW()),
(2, 1, 'Verify Documents CASE-002', 'Verify business loan documents for Deepak Agarwal', 'open', 'high', 2, NOW() + INTERVAL '2 days', NOW(), NOW()),
(3, 1, 'Compliance Check CASE-006', 'Perform compliance check for personal loan case', 'open', 'medium', 2, NOW() + INTERVAL '1 day', NOW(), NOW()),
(4, 1, 'KYC Verification CASE-008', 'Complete KYC verification for home loan case', 'open', 'high', 2, NOW() + INTERVAL '3 days', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 10. AUDIT LOGS (for system activity)
-- =============================================================================

-- Insert audit logs for system activity
INSERT INTO logs (id, organization_id, user_id, action, entity_type, entity_id, description, log_type, metadata, ip_address, user_agent, created_at, updated_at)
VALUES 
(1, 1, 1, 'LOGIN', 'user', 1, 'User logged in successfully', 'info', '{"login_time": "2025-01-22T10:30:00.000Z"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW(), NOW()),
(2, 1, 1, 'CREATE', 'case', 1, 'New loan application created', 'info', '{"case_number": "CASE-001", "loan_type": "Home Loan"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW(), NOW()),
(3, 1, 2, 'UPDATE', 'case', 1, 'Case status updated to review', 'info', '{"old_status": "new", "new_status": "review"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW(), NOW()),
(4, 1, 2, 'CREATE', 'compliance_issue', 1, 'Compliance issue created', 'warning', '{"issue_type": "Document Mismatch", "severity": "high"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW(), NOW()),
(5, 1, 1, 'APPROVE', 'case', 9, 'Loan application approved', 'success', '{"case_number": "CASE-009", "approved_amount": 150000}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify data was inserted correctly
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
SELECT 'Compliance Issues', COUNT(*) FROM compliance_issues
UNION ALL
SELECT 'Documents', COUNT(*) FROM documents
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM logs;

-- Show cases by status for verification
SELECT status, COUNT(*) as count FROM cases GROUP BY status ORDER BY status;

-- Show compliance issues by status
SELECT status, COUNT(*) as count FROM compliance_issues GROUP BY status ORDER BY status;

-- Show recent audit logs
SELECT action, entity_type, description, created_at FROM logs ORDER BY created_at DESC LIMIT 10;

-- =============================================================================
-- END OF SCRIPT
-- =============================================================================
