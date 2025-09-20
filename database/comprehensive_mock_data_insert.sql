-- =============================================================================
-- COMPREHENSIVE MOCK DATA INSERTION SCRIPT
-- =============================================================================
-- This script inserts dummy data into ALL tables from the veriphy_bank schema
-- Execute this script in your database to populate all tables with test data

-- Start transaction
BEGIN;

-- =============================================================================
-- 1. ORGANIZATIONS (Base table - referenced by many others)
-- =============================================================================
INSERT INTO organizations (id, name, address, metadata) VALUES
(1, 'Happy Bank Ltd', '123 Banking Street, Mumbai, Maharashtra 400001', '{"type": "bank", "license": "RBI-001", "established": "1995"}'),
(2, 'Trust Finance Corp', '456 Finance Avenue, Delhi, Delhi 110001', '{"type": "nbfc", "license": "RBI-002", "established": "2000"}'),
(3, 'Secure Loans Inc', '789 Loan Plaza, Bangalore, Karnataka 560001', '{"type": "nbfc", "license": "RBI-003", "established": "2005"}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. DEPARTMENTS
-- =============================================================================
INSERT INTO departments (id, name, description, organization_id, metadata) VALUES
(1, 'Sales Department', 'Customer acquisition and sales operations', 1, '{"type": "sales", "head": "Rajesh Kumar"}'),
(2, 'Credit Operations', 'Credit analysis and loan processing', 1, '{"type": "credit", "head": "Anita Patel"}'),
(3, 'Compliance', 'Risk management and regulatory compliance', 1, '{"type": "compliance", "head": "Suresh Krishnamurthy"}'),
(4, 'Administration', 'Administrative and support functions', 1, '{"type": "admin", "head": "Priya Sharma"}'),
(5, 'Sales Department', 'Customer acquisition and sales operations', 2, '{"type": "sales"}'),
(6, 'Credit Operations', 'Credit analysis and loan processing', 2, '{"type": "credit"}'),
(7, 'Sales Department', 'Customer acquisition and sales operations', 3, '{"type": "sales"}'),
(8, 'Credit Operations', 'Credit analysis and loan processing', 3, '{"type": "credit"}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. EMPLOYMENT TYPES
-- =============================================================================
INSERT INTO employment_types (id, name, description, organization_id, metadata) VALUES
(1, 'Permanent', 'Full-time permanent employment', 1, '{"benefits": ["health_insurance", "provident_fund"]}'),
(2, 'Contract', 'Fixed-term contract employment', 1, '{"duration": "12_months"}'),
(3, 'Consultant', 'Consulting and advisory role', 1, '{"billing": "hourly"}'),
(4, 'Intern', 'Internship position', 1, '{"duration": "6_months"}'),
(5, 'Permanent', 'Full-time permanent employment', 2, '{"benefits": ["health_insurance"]}'),
(6, 'Permanent', 'Full-time permanent employment', 3, '{"benefits": ["health_insurance"]}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4. ROLES
-- =============================================================================
INSERT INTO roles (id, name, description, organization_id, is_active, metadata) VALUES
(1, 'Super Admin', 'System administrator with full access', 1, true, '{"permissions": ["all"]}'),
(2, 'Admin', 'Organization administrator', 1, true, '{"permissions": ["manage_users", "manage_settings"]}'),
(3, 'Manager', 'Department manager', 1, true, '{"permissions": ["manage_team", "approve_cases"]}'),
(4, 'Credit Analyst', 'Credit analysis specialist', 1, true, '{"permissions": ["analyze_credit", "approve_loans"]}'),
(5, 'Sales Agent', 'Sales representative', 1, true, '{"permissions": ["create_cases", "view_cases"]}'),
(6, 'Compliance Officer', 'Compliance and risk specialist', 1, true, '{"permissions": ["review_compliance", "audit_cases"]}'),
(7, 'Super Admin', 'System administrator with full access', 2, true, '{"permissions": ["all"]}'),
(8, 'Admin', 'Organization administrator', 2, true, '{"permissions": ["manage_users"]}'),
(9, 'Super Admin', 'System administrator with full access', 3, true, '{"permissions": ["all"]}'),
(10, 'Admin', 'Organization administrator', 3, true, '{"permissions": ["manage_users"]}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 5. PERMISSIONS
-- =============================================================================
INSERT INTO permissions (id, name, description) VALUES
(1, 'view_cases', 'View loan application cases'),
(2, 'create_cases', 'Create new loan application cases'),
(3, 'update_cases', 'Update existing loan application cases'),
(4, 'delete_cases', 'Delete loan application cases'),
(5, 'approve_cases', 'Approve or reject loan applications'),
(6, 'manage_users', 'Manage user accounts and permissions'),
(7, 'manage_settings', 'Manage system and organization settings'),
(8, 'view_analytics', 'View analytics and reports'),
(9, 'manage_documents', 'Manage document types and requirements'),
(10, 'audit_logs', 'View audit logs and system activities'),
(11, 'whatsapp_integration', 'Access WhatsApp integration features'),
(12, 'credit_analysis', 'Perform credit analysis and scoring'),
(13, 'compliance_review', 'Review compliance requirements'),
(14, 'workflow_management', 'Manage workflow stages and processes'),
(15, 'notification_management', 'Manage notifications and alerts')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 6. ASSIGN PERMISSIONS (Role-Permission mapping)
-- =============================================================================
INSERT INTO assign_permission (role_id, permission_id) VALUES
-- Super Admin gets all permissions
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15),
-- Admin permissions
(2, 1), (2, 2), (2, 3), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11), (2, 14), (2, 15),
-- Manager permissions
(3, 1), (3, 2), (3, 3), (3, 5), (3, 8), (3, 11), (3, 14), (3, 15),
-- Credit Analyst permissions
(4, 1), (4, 3), (4, 5), (4, 8), (4, 12), (4, 13),
-- Sales Agent permissions
(5, 1), (5, 2), (5, 3), (5, 8), (5, 11),
-- Compliance Officer permissions
(6, 1), (6, 3), (6, 8), (6, 10), (6, 13),
-- Other organizations
(7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6), (7, 7), (7, 8), (7, 9), (7, 10), (7, 11), (7, 12), (7, 13), (7, 14), (7, 15),
(8, 1), (8, 2), (8, 3), (8, 6), (8, 7), (8, 8), (8, 9), (8, 10), (8, 11), (8, 14), (8, 15),
(9, 1), (9, 2), (9, 3), (9, 4), (9, 5), (9, 6), (9, 7), (9, 8), (9, 9), (9, 10), (9, 11), (9, 12), (9, 13), (9, 14), (9, 15),
(10, 1), (10, 2), (10, 3), (10, 6), (10, 7), (10, 8), (10, 9), (10, 10), (10, 11), (10, 14), (10, 15)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- 7. USERS
-- =============================================================================
INSERT INTO users (id, full_name, email, mobile, department_id, employment_type_id, organization_id, status, role, metadata) VALUES
(1, 'Super Admin', 'superadmin@veriphy.com', '+91-9876543214', 4, 1, 1, 'active', 'super_admin', '{"avatar": null, "last_login": "2025-01-09T10:00:00Z"}'),
(2, 'Priya Sharma', 'priya.sharma@happybank.in', '+91-9876543210', 1, 1, 1, 'active', 'salesperson', '{"avatar": "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg", "experience": "5_years"}'),
(3, 'Rajesh Kumar', 'rajesh.kumar@happybank.in', '+91-9876543211', 1, 1, 1, 'active', 'manager', '{"avatar": "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg", "experience": "8_years"}'),
(4, 'Anita Patel', 'anita.patel@happybank.in', '+91-9876543212', 2, 1, 1, 'active', 'credit-ops', '{"avatar": "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg", "experience": "6_years"}'),
(5, 'Suresh Krishnamurthy', 'suresh.krishnamurthy@happybank.in', '+91-9876543213', 3, 1, 1, 'active', 'admin', '{"avatar": "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg", "experience": "10_years"}'),
(6, 'Deepak Singh', 'deepak.singh@happybank.in', '+91-9876543215', 1, 2, 1, 'active', 'salesperson', '{"avatar": null, "experience": "2_years"}'),
(7, 'Meera Joshi', 'meera.joshi@happybank.in', '+91-9876543216', 2, 1, 1, 'active', 'credit-ops', '{"avatar": null, "experience": "4_years"}'),
(8, 'Vikram Reddy', 'vikram.reddy@happybank.in', '+91-9876543217', 3, 1, 1, 'active', 'compliance', '{"avatar": null, "experience": "7_years"}'),
(9, 'Admin User', 'admin@trustfinance.com', '+91-9876543218', 5, 5, 2, 'active', 'admin', '{"avatar": null}'),
(10, 'Sales User', 'sales@trustfinance.com', '+91-9876543219', 5, 5, 2, 'active', 'salesperson', '{"avatar": null}'),
(11, 'Admin User', 'admin@secureloans.com', '+91-9876543220', 7, 6, 3, 'active', 'admin', '{"avatar": null}'),
(12, 'Sales User', 'sales@secureloans.com', '+91-9876543221', 7, 6, 3, 'active', 'salesperson', '{"avatar": null}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 8. USER ROLES (User-Role mapping)
-- =============================================================================
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Super Admin
(2, 5), -- Sales Agent
(3, 3), -- Manager
(4, 4), -- Credit Analyst
(5, 2), -- Admin
(6, 5), -- Sales Agent
(7, 4), -- Credit Analyst
(8, 6), -- Compliance Officer
(9, 8), -- Admin (Org 2)
(10, 5), -- Sales Agent (Org 2)
(11, 10), -- Admin (Org 3)
(12, 5) -- Sales Agent (Org 3)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- =============================================================================
-- 9. PRODUCTS
-- =============================================================================
INSERT INTO products (id, name, code, description, status, organization_id, metadata) VALUES
(1, 'Home Loan', 'HL001', 'Residential property loan with competitive rates', 'active', 1, '{"min_amount": 500000, "max_amount": 50000000, "interest_rate": 0.085}'),
(2, 'Personal Loan', 'PL001', 'Unsecured personal loan for various purposes', 'active', 1, '{"min_amount": 50000, "max_amount": 2000000, "interest_rate": 0.120}'),
(3, 'Car Loan', 'CL001', 'Vehicle financing with quick approval', 'active', 1, '{"min_amount": 100000, "max_amount": 10000000, "interest_rate": 0.095}'),
(4, 'Business Loan', 'BL001', 'Working capital and business expansion loans', 'active', 1, '{"min_amount": 1000000, "max_amount": 100000000, "interest_rate": 0.110}'),
(5, 'Education Loan', 'EL001', 'Educational financing for students', 'active', 1, '{"min_amount": 100000, "max_amount": 5000000, "interest_rate": 0.075}'),
(6, 'Home Loan', 'HL002', 'Residential property loan', 'active', 2, '{"min_amount": 300000, "max_amount": 30000000, "interest_rate": 0.090}'),
(7, 'Personal Loan', 'PL002', 'Personal loan product', 'active', 2, '{"min_amount": 25000, "max_amount": 1000000, "interest_rate": 0.125}'),
(8, 'Home Loan', 'HL003', 'Residential property loan', 'active', 3, '{"min_amount": 400000, "max_amount": 40000000, "interest_rate": 0.088}'),
(9, 'Personal Loan', 'PL003', 'Personal loan product', 'active', 3, '{"min_amount": 30000, "max_amount": 1500000, "interest_rate": 0.115})
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 10. SUB PRODUCTS
-- =============================================================================
INSERT INTO sub_products (id, name, code, description, status, product_id, organization_id, metadata) VALUES
(1, 'Prime Home Loan', 'PHL001', 'Premium home loan with lowest rates', 'active', 1, 1, '{"rate_type": "fixed", "processing_fee": 5000}'),
(2, 'Standard Home Loan', 'SHL001', 'Standard home loan product', 'active', 1, 1, '{"rate_type": "floating", "processing_fee": 3000}'),
(3, 'Express Personal Loan', 'EPL001', 'Quick approval personal loan', 'active', 2, 1, '{"approval_time": "24_hours", "processing_fee": 2000}'),
(4, 'Regular Personal Loan', 'RPL001', 'Standard personal loan', 'active', 2, 1, '{"approval_time": "72_hours", "processing_fee": 1500}'),
(5, 'New Car Loan', 'NCL001', 'Loan for new vehicle purchase', 'active', 3, 1, '{"depreciation": "none", "processing_fee": 3000}'),
(6, 'Used Car Loan', 'UCL001', 'Loan for pre-owned vehicle', 'active', 3, 1, '{"depreciation": "standard", "processing_fee": 2500}'),
(7, 'Working Capital Loan', 'WCL001', 'Short-term working capital financing', 'active', 4, 1, '{"tenure": "12_months", "processing_fee": 10000}'),
(8, 'Equipment Finance', 'EFL001', 'Equipment and machinery financing', 'active', 4, 1, '{"tenure": "60_months", "processing_fee": 15000}'),
(9, 'Undergraduate Loan', 'UGL001', 'Loan for undergraduate studies', 'active', 5, 1, '{"moratorium": "6_months", "processing_fee": 1000}'),
(10, 'Postgraduate Loan', 'PGL001', 'Loan for postgraduate studies', 'active', 5, 1, '{"moratorium": "12_months", "processing_fee": 1500}'),
(11, 'Standard Home Loan', 'SHL002', 'Standard home loan', 'active', 6, 2, '{"processing_fee": 4000}'),
(12, 'Express Personal Loan', 'EPL002', 'Quick personal loan', 'active', 7, 2, '{"processing_fee": 1800}'),
(13, 'Premium Home Loan', 'PHL003', 'Premium home loan', 'active', 8, 3, '{"processing_fee": 4500}'),
(14, 'Standard Personal Loan', 'SPL003', 'Standard personal loan', 'active', 9, 3, '{"processing_fee": 2000})
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 11. DOCUMENT TYPES
-- =============================================================================
INSERT INTO document_types (id, name, description, organization_id, mime_types, metadata) VALUES
(1, 'Aadhaar Card', 'Government issued identity document', 1, '["application/pdf", "image/jpeg", "image/png"]', '{"category": "identity", "mandatory": true}'),
(2, 'PAN Card', 'Permanent Account Number card', 1, '["application/pdf", "image/jpeg", "image/png"]', '{"category": "identity", "mandatory": true}'),
(3, 'Bank Statements', 'Bank account statements for last 6 months', 1, '["application/pdf", "application/vnd.ms-excel"]', '{"category": "financial", "mandatory": true}'),
(4, 'Salary Certificate', 'Employment and salary certificate', 1, '["application/pdf", "image/jpeg", "image/png"]', '{"category": "employment", "mandatory": false}'),
(5, 'ITR Documents', 'Income Tax Return documents', 1, '["application/pdf"]', '{"category": "financial", "mandatory": false}'),
(6, 'Property Documents', 'Property related documents', 1, '["application/pdf", "image/jpeg", "image/png"]', '{"category": "property", "mandatory": false}'),
(7, 'GST Returns', 'GST return documents', 1, '["application/pdf"]', '{"category": "business", "mandatory": false}'),
(8, 'Business Registration', 'Business registration certificate', 1, '["application/pdf", "image/jpeg", "image/png"]', '{"category": "business", "mandatory": false}'),
(9, 'Driving License', 'Valid driving license', 1, '["application/pdf", "image/jpeg", "image/png"]', '{"category": "identity", "mandatory": false}'),
(10, 'Passport', 'Valid passport document', 1, '["application/pdf", "image/jpeg", "image/png"]', '{"category": "identity", "mandatory": false}'),
(11, 'Aadhaar Card', 'Government issued identity document', 2, '["application/pdf", "image/jpeg", "image/png"]', '{"category": "identity", "mandatory": true}'),
(12, 'PAN Card', 'Permanent Account Number card', 2, '["application/pdf", "image/jpeg", "image/png"]', '{"category": "identity", "mandatory": true}'),
(13, 'Aadhaar Card', 'Government issued identity document', 3, '["application/pdf", "image/jpeg", "image/png"]', '{"category": "identity", "mandatory": true}'),
(14, 'PAN Card', 'Permanent Account Number card', 3, '["application/pdf", "image/jpeg", "image/png"]', '{"category": "identity", "mandatory": true}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 12. TASK TYPES
-- =============================================================================
INSERT INTO task_types (id, name, description, organization_id, is_active, metadata) VALUES
(1, 'Document Collection', 'Collect required documents from customer', 1, true, '{"sla_hours": 24, "department": "sales"}'),
(2, 'Document Verification', 'Verify submitted documents', 1, true, '{"sla_hours": 48, "department": "credit"}'),
(3, 'Credit Analysis', 'Perform credit analysis and scoring', 1, true, '{"sla_hours": 72, "department": "credit"}'),
(4, 'Approval Decision', 'Make final approval decision', 1, true, '{"sla_hours": 24, "department": "credit"}'),
(5, 'Compliance Review', 'Review compliance requirements', 1, true, '{"sla_hours": 24, "department": "compliance"}'),
(6, 'Customer Communication', 'Communicate with customer', 1, true, '{"sla_hours": 12, "department": "sales"}'),
(7, 'Disbursement', 'Process loan disbursement', 1, true, '{"sla_hours": 48, "department": "operations"}'),
(8, 'Document Collection', 'Collect required documents', 2, true, '{"sla_hours": 24}'),
(9, 'Document Verification', 'Verify documents', 2, true, '{"sla_hours": 48}'),
(10, 'Document Collection', 'Collect required documents', 3, true, '{"sla_hours": 24}'),
(11, 'Document Verification', 'Verify documents', 3, true, '{"sla_hours": 48}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 13. TASK SLA POLICIES
-- =============================================================================
INSERT INTO task_sla_policies (id, task_type_id, target_time_minutes, escalation_level, organization_id, metadata) VALUES
(1, 1, 1440, 'high', 1, '{"escalation_hours": 12}'), -- Document Collection - 24 hours
(2, 2, 2880, 'medium', 1, '{"escalation_hours": 24}'), -- Document Verification - 48 hours
(3, 3, 4320, 'high', 1, '{"escalation_hours": 12}'), -- Credit Analysis - 72 hours
(4, 4, 1440, 'critical', 1, '{"escalation_hours": 6}'), -- Approval Decision - 24 hours
(5, 5, 1440, 'medium', 1, '{"escalation_hours": 24}'), -- Compliance Review - 24 hours
(6, 6, 720, 'low', 1, '{"escalation_hours": 48}'), -- Customer Communication - 12 hours
(7, 7, 2880, 'high', 1, '{"escalation_hours": 12}'), -- Disbursement - 48 hours
(8, 8, 1440, 'high', 2, '{"escalation_hours": 12}'),
(9, 9, 2880, 'medium', 2, '{"escalation_hours": 24}'),
(10, 10, 1440, 'high', 3, '{"escalation_hours": 12}'),
(11, 11, 2880, 'medium', 3, '{"escalation_hours": 24}')
ON CONFLICT (id) DO NOTHING;

-- Continue with more tables in the next part...
