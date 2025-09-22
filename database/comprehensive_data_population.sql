-- =============================================================================
-- VERIPHY BANK - COMPREHENSIVE DATA POPULATION SCRIPT
-- =============================================================================
-- This script creates a complete demo environment with realistic data
-- for all user roles and business processes
-- =============================================================================

-- Clear existing data (optional - comment out if you want to preserve existing data)
-- TRUNCATE TABLE whatsapp_messages, compliance_logs, audit_logs, notifications, 
--     security_alerts, kyc_verifications, documents, cases, transactions, 
--     balances, accounts, customers, user_sessions, user_roles, users, 
--     system_settings CASCADE;

-- =============================================================================
-- 1. SYSTEM SETTINGS (Create missing table and populate)
-- =============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Insert comprehensive system settings
INSERT INTO system_settings (key, value, description, category) VALUES
-- Application Settings
('app_name', 'Veriphy Bank', 'Application name', 'general'),
('app_version', '1.0.0', 'Application version', 'general'),
('maintenance_mode', 'false', 'System maintenance mode', 'system'),

-- Security Settings
('max_login_attempts', '5', 'Maximum login attempts before lockout', 'security'),
('session_timeout_minutes', '60', 'Session timeout in minutes', 'security'),
('password_min_length', '8', 'Minimum password length', 'security'),
('password_require_special', 'true', 'Require special characters', 'security'),
('two_factor_auth_enabled', 'true', 'Two-factor authentication', 'security'),

-- Business Settings
('transaction_limit_daily', '100000', 'Daily transaction limit (INR)', 'business'),
('transaction_limit_monthly', '1000000', 'Monthly transaction limit (INR)', 'business'),
('kyc_verification_required', 'true', 'KYC verification required', 'business'),
('auto_approval_limit', '50000', 'Auto approval limit (INR)', 'business'),

-- Integration Settings
('whatsapp_enabled', 'true', 'WhatsApp integration', 'integration'),
('email_notifications_enabled', 'true', 'Email notifications', 'notification'),
('sms_notifications_enabled', 'true', 'SMS notifications', 'notification'),

-- File Management
('file_upload_max_size_mb', '10', 'Maximum file upload size', 'file'),
('supported_file_types', 'pdf,jpg,jpeg,png,doc,docx', 'Supported file types', 'file'),

-- System Settings
('audit_log_retention_days', '365', 'Audit log retention', 'system'),
('document_encryption_enabled', 'true', 'Document encryption', 'system'),
('backup_frequency_hours', '24', 'Backup frequency', 'system')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 2. COMPREHENSIVE USER POPULATION
-- =============================================================================

-- Update users table structure to match application expectations
-- Add missing columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id BIGINT DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id BIGINT DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);

-- Update existing users to have full_name
UPDATE users SET full_name = COALESCE(first_name || ' ' || last_name, email) WHERE full_name IS NULL;

-- Create Super Admin (if not exists)
INSERT INTO users (email, password_hash, full_name, mobile, is_active, role, organization_id, department_id) VALUES
('superadmin@veriphy.com', crypt('admin123', gen_salt('bf')), 'Super Admin', '+91-9999999999', true, 'super_admin', 1, 1)
ON CONFLICT (email) DO NOTHING;

-- Create comprehensive user base
INSERT INTO users (email, password_hash, full_name, mobile, is_active, role, organization_id, department_id) VALUES
-- Sales Team
('priya.sharma@veriphy.com', crypt('demo123', gen_salt('bf')), 'Priya Sharma', '+91-9876543210', true, 'salesperson', 1, 1),
('rajesh.kumar@veriphy.com', crypt('demo123', gen_salt('bf')), 'Rajesh Kumar', '+91-9876543211', true, 'salesperson', 1, 1),
('sneha.singh@veriphy.com', crypt('demo123', gen_salt('bf')), 'Sneha Singh', '+91-9876543212', true, 'salesperson', 1, 1),
('amit.patel@veriphy.com', crypt('demo123', gen_salt('bf')), 'Amit Patel', '+91-9876543213', true, 'salesperson', 1, 1),

-- Management Team
('anita.reddy@veriphy.com', crypt('demo123', gen_salt('bf')), 'Anita Reddy', '+91-9876543214', true, 'manager', 1, 2),
('suresh.kumar@veriphy.com', crypt('demo123', gen_salt('bf')), 'Suresh Kumar', '+91-9876543215', true, 'manager', 1, 2),

-- Credit Operations Team
('meera.joshi@veriphy.com', crypt('demo123', gen_salt('bf')), 'Meera Joshi', '+91-9876543216', true, 'credit-ops', 1, 3),
('rahul.verma@veriphy.com', crypt('demo123', gen_salt('bf')), 'Rahul Verma', '+91-9876543217', true, 'credit-ops', 1, 3),
('kavya.nair@veriphy.com', crypt('demo123', gen_salt('bf')), 'Kavya Nair', '+91-9876543218', true, 'credit-ops', 1, 3),

-- Admin Team
('arjun.singh@veriphy.com', crypt('demo123', gen_salt('bf')), 'Arjun Singh', '+91-9876543219', true, 'admin', 1, 4),
('deepika.rao@veriphy.com', crypt('demo123', gen_salt('bf')), 'Deepika Rao', '+91-9876543220', true, 'admin', 1, 4),

-- Compliance/Audit Team
('rohit.agarwal@veriphy.com', crypt('demo123', gen_salt('bf')), 'Rohit Agarwal', '+91-9876543221', true, 'compliance', 1, 5),
('shilpa.mehta@veriphy.com', crypt('demo123', gen_salt('bf')), 'Shilpa Mehta', '+91-9876543222', true, 'compliance', 1, 5)
ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- 3. CUSTOMER POPULATION (Realistic Demo Data)
-- =============================================================================

-- Update customers table structure to match application expectations
-- Add missing columns if they don't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS full_name VARCHAR(200);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create realistic customers with proper Indian names and data
INSERT INTO customers (user_id, pan_number, aadhaar_number, date_of_birth, gender, marital_status, employment_type, risk_profile, kyc_status, full_name, phone, email) VALUES
(2, 'ABCDE1234F', '123456789012', '1985-03-15', 'female', 'married', 'salaried', 'low', 'verified', 'Priya Sharma', '+91-9876543210', 'priya.sharma@veriphy.com'),
(3, 'FGHIJ5678G', '234567890123', '1988-07-22', 'male', 'single', 'salaried', 'medium', 'verified', 'Rajesh Kumar', '+91-9876543211', 'rajesh.kumar@veriphy.com'),
(4, 'KLMNO9012H', '345678901234', '1990-11-08', 'female', 'married', 'self-employed', 'medium', 'verified', 'Sneha Singh', '+91-9876543212', 'sneha.singh@veriphy.com'),
(5, 'PQRST3456I', '456789012345', '1982-12-03', 'male', 'married', 'salaried', 'low', 'verified', 'Amit Patel', '+91-9876543213', 'amit.patel@veriphy.com'),
(6, 'UVWXY7890J', '567890123456', '1987-05-18', 'female', 'single', 'salaried', 'medium', 'verified', 'Anita Reddy', '+91-9876543214', 'anita.reddy@veriphy.com'),
(7, 'ZABCD1234K', '678901234567', '1983-09-25', 'male', 'married', 'self-employed', 'high', 'in-progress', 'Suresh Kumar', '+91-9876543215', 'suresh.kumar@veriphy.com'),
(8, 'EFGHI5678L', '789012345678', '1991-02-14', 'female', 'single', 'salaried', 'low', 'verified', 'Meera Joshi', '+91-9876543216', 'meera.joshi@veriphy.com'),
(9, 'JKLMN9012M', '890123456789', '1986-08-30', 'male', 'married', 'salaried', 'medium', 'verified', 'Rahul Verma', '+91-9876543217', 'rahul.verma@veriphy.com'),
(10, 'OPQRS3456N', '901234567890', '1984-06-12', 'female', 'married', 'self-employed', 'medium', 'verified', 'Kavya Nair', '+91-9876543218', 'kavya.nair@veriphy.com'),
(11, 'TUVWX7890O', '012345678901', '1989-04-07', 'male', 'single', 'salaried', 'low', 'verified', 'Arjun Singh', '+91-9876543219', 'arjun.singh@veriphy.com'),
(12, 'YZABC1234P', '112233445566', '1987-10-19', 'female', 'married', 'salaried', 'medium', 'verified', 'Deepika Rao', '+91-9876543220', 'deepika.rao@veriphy.com'),
(13, 'DEFGH5678Q', '223344556677', '1985-01-26', 'male', 'married', 'self-employed', 'high', 'in-progress', 'Rohit Agarwal', '+91-9876543221', 'rohit.agarwal@veriphy.com'),
(14, 'IJKLM9012R', '334455667788', '1990-03-11', 'female', 'single', 'salaried', 'low', 'verified', 'Shilpa Mehta', '+91-9876543222', 'shilpa.mehta@veriphy.com'),
(15, 'NOPQR3456S', '445566778899', '1988-07-05', 'male', 'married', 'salaried', 'medium', 'verified', 'Vikram Gupta', '+91-9876543223', 'vikram.gupta@veriphy.com'),
(16, 'STUVW7890T', '556677889900', '1983-12-17', 'female', 'married', 'self-employed', 'medium', 'verified', 'Kiran Desai', '+91-9876543224', 'kiran.desai@veriphy.com');

-- =============================================================================
-- 4. ACCOUNT CREATION
-- =============================================================================

-- Create accounts for customers
INSERT INTO accounts (customer_id, account_type_id, account_number, balance, status) VALUES
(1, 1, 'SB001234567890', 25000.00, 'active'),
(2, 1, 'SB001234567891', 15000.00, 'active'),
(3, 2, 'CA001234567892', 75000.00, 'active'),
(4, 1, 'SB001234567893', 45000.00, 'active'),
(5, 1, 'SB001234567894', 30000.00, 'active'),
(6, 2, 'CA001234567895', 120000.00, 'active'),
(7, 1, 'SB001234567896', 20000.00, 'active'),
(8, 1, 'SB001234567897', 35000.00, 'active'),
(9, 2, 'CA001234567898', 95000.00, 'active'),
(10, 1, 'SB001234567899', 40000.00, 'active'),
(11, 1, 'SB001234567900', 28000.00, 'active'),
(12, 2, 'CA001234567901', 85000.00, 'active'),
(13, 1, 'SB001234567902', 22000.00, 'active'),
(14, 1, 'SB001234567903', 38000.00, 'active'),
(15, 2, 'CA001234567904', 110000.00, 'active');

-- Create balances for accounts
INSERT INTO balances (account_id, balance, available_balance, frozen_amount) VALUES
(1, 25000.00, 25000.00, 0.00),
(2, 15000.00, 15000.00, 0.00),
(3, 75000.00, 75000.00, 0.00),
(4, 45000.00, 45000.00, 0.00),
(5, 30000.00, 30000.00, 0.00),
(6, 120000.00, 120000.00, 0.00),
(7, 20000.00, 20000.00, 0.00),
(8, 35000.00, 35000.00, 0.00),
(9, 95000.00, 95000.00, 0.00),
(10, 40000.00, 40000.00, 0.00),
(11, 28000.00, 28000.00, 0.00),
(12, 85000.00, 85000.00, 0.00),
(13, 22000.00, 22000.00, 0.00),
(14, 38000.00, 38000.00, 0.00),
(15, 110000.00, 110000.00, 0.00);

-- =============================================================================
-- 5. COMPREHENSIVE CASE/LOAN APPLICATION DATA
-- =============================================================================

INSERT INTO cases (case_number, customer_id, assigned_to, loan_type, loan_amount, status, priority, description) VALUES
-- Active Cases
('CASE000001', 1, 2, 'personal_loan', 150000.00, 'in-progress', 'high', 'Personal loan for medical expenses'),
('CASE000002', 2, 3, 'home_loan', 2500000.00, 'review', 'medium', 'Home loan for property purchase'),
('CASE000003', 3, 4, 'business_loan', 800000.00, 'new', 'high', 'Business expansion loan'),
('CASE000004', 4, 5, 'car_loan', 600000.00, 'in-progress', 'medium', 'Vehicle loan for car purchase'),
('CASE000005', 5, 2, 'personal_loan', 200000.00, 'review', 'low', 'Personal loan for education'),
('CASE000006', 6, 3, 'business_loan', 1200000.00, 'approved', 'high', 'Working capital loan'),
('CASE000007', 7, 4, 'home_loan', 1800000.00, 'in-progress', 'medium', 'Home improvement loan'),
('CASE000008', 8, 5, 'personal_loan', 100000.00, 'new', 'low', 'Personal loan for wedding'),
('CASE000009', 9, 2, 'car_loan', 800000.00, 'review', 'medium', 'Luxury car loan'),
('CASE000010', 10, 3, 'business_loan', 1500000.00, 'approved', 'high', 'Equipment financing'),
('CASE000011', 11, 4, 'personal_loan', 300000.00, 'rejected', 'medium', 'Personal loan - insufficient income'),
('CASE000012', 12, 5, 'home_loan', 3500000.00, 'in-progress', 'high', 'New home purchase loan'),
('CASE000013', 13, 2, 'business_loan', 900000.00, 'on-hold', 'medium', 'Business loan - pending documents'),
('CASE000014', 14, 3, 'car_loan', 500000.00, 'review', 'low', 'Second-hand car loan'),
('CASE000015', 15, 4, 'personal_loan', 250000.00, 'new', 'medium', 'Personal loan for home renovation');

-- =============================================================================
-- 6. DOCUMENT MANAGEMENT DATA
-- =============================================================================

INSERT INTO documents (case_id, document_type_id, file_name, file_path, file_size, file_type, status, uploaded_at, verified_at, reviewed_by, notes) VALUES
-- Documents for Case 1
(1, 1, 'aadhaar_case1.pdf', '/documents/case1/aadhaar.pdf', 1024000, 'pdf', 'verified', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 7, 'Document verified successfully'),
(1, 2, 'pan_case1.pdf', '/documents/case1/pan.pdf', 512000, 'pdf', 'verified', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 7, 'PAN card verified'),
(1, 7, 'salary_slip_case1.pdf', '/documents/case1/salary_slip.pdf', 768000, 'pdf', 'verified', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', 7, 'Salary slip verified'),

-- Documents for Case 2
(2, 1, 'aadhaar_case2.pdf', '/documents/case2/aadhaar.pdf', 1024000, 'pdf', 'verified', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days', 8, 'Aadhaar verified'),
(2, 2, 'pan_case2.pdf', '/documents/case2/pan.pdf', 512000, 'pdf', 'verified', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days', 8, 'PAN verified'),
(2, 7, 'salary_slip_case2.pdf', '/documents/case2/salary_slip.pdf', 768000, 'pdf', 'verified', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days', 8, 'Salary documents verified'),
(2, 20, 'property_docs_case2.pdf', '/documents/case2/property.pdf', 2048000, 'pdf', 'verified', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days', 8, 'Property documents verified'),

-- Documents for Case 3
(3, 1, 'aadhaar_case3.pdf', '/documents/case3/aadhaar.pdf', 1024000, 'pdf', 'verified', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', 9, 'Aadhaar verified'),
(3, 2, 'pan_case3.pdf', '/documents/case3/pan.pdf', 512000, 'pdf', 'verified', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', 9, 'PAN verified'),
(3, 8, 'itr_case3.pdf', '/documents/case3/itr.pdf', 1536000, 'pdf', 'verified', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 9, 'ITR verified'),
(3, 19, 'gst_case3.pdf', '/documents/case3/gst.pdf', 1024000, 'pdf', 'verified', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 9, 'GST registration verified');

-- =============================================================================
-- 7. TRANSACTION DATA
-- =============================================================================

INSERT INTO transactions (account_id, transaction_type_id, amount, reference_id, status, description, created_at, processed_at) VALUES
-- Recent transactions for various accounts
(1, 1, 5000.00, 'TXN001234567', 'completed', 'Cash deposit', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(1, 9, 2000.00, 'TXN001234568', 'completed', 'UPI transfer to merchant', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(2, 1, 10000.00, 'TXN001234569', 'completed', 'Salary credit', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(3, 11, 15000.00, 'TXN001234570', 'completed', 'Business payment', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(4, 1, 7500.00, 'TXN001234571', 'completed', 'Cash deposit', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(5, 12, 3000.00, 'TXN001234572', 'completed', 'Online purchase', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- =============================================================================
-- 8. NOTIFICATIONS DATA
-- =============================================================================

INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES
-- Notifications for various users
(2, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000001', false, NOW() - INTERVAL '1 hour'),
(3, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000002', false, NOW() - INTERVAL '2 hours'),
(4, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000003', false, NOW() - INTERVAL '3 hours'),
(5, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000004', false, NOW() - INTERVAL '4 hours'),
(7, 'document_verified', 'Document Verified', 'Document verification completed for Case CASE000001', true, NOW() - INTERVAL '5 hours'),
(8, 'case_approved', 'Case Approved', 'Case CASE000006 has been approved', true, NOW() - INTERVAL '6 hours'),
(9, 'case_rejected', 'Case Rejected', 'Case CASE000011 has been rejected - insufficient income', true, NOW() - INTERVAL '7 hours');

-- =============================================================================
-- 9. AUDIT LOGS
-- =============================================================================

INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, created_at) VALUES
(2, 'case_created', 'case', 1, NULL, '{"case_number": "CASE000001", "status": "new"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '1 day'),
(3, 'case_updated', 'case', 2, '{"status": "new"}', '{"status": "review"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '12 hours'),
(7, 'document_verified', 'document', 1, '{"status": "pending"}', '{"status": "verified"}', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '6 hours'),
(8, 'case_approved', 'case', 6, '{"status": "review"}', '{"status": "approved"}', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '3 hours');

-- =============================================================================
-- 10. WHATSAPP MESSAGES
-- =============================================================================

INSERT INTO whatsapp_messages (case_id, message_type, content, sender, timestamp, created_at) VALUES
(1, 'outbound', 'Hello! Your loan application CASE000001 has been received and is under review. We will update you soon.', 'bank', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(1, 'inbound', 'Thank you for the update. When can I expect the approval?', 'customer', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '20 hours'),
(1, 'outbound', 'Your application is being processed. We will inform you within 2-3 business days.', 'bank', NOW() - INTERVAL '19 hours', NOW() - INTERVAL '19 hours'),
(2, 'outbound', 'Your home loan application CASE000002 requires additional documents. Please upload your property papers.', 'bank', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2, 'inbound', 'I have uploaded the property documents. Please check.', 'customer', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- =============================================================================
-- 11. COMPLIANCE LOGS
-- =============================================================================

INSERT INTO compliance_logs (case_id, action, user_id, details, log_type, created_at) VALUES
(1, 'kyc_verification', 7, 'Customer KYC documents verified successfully', 'success', NOW() - INTERVAL '3 days'),
(2, 'income_verification', 8, 'Customer income documents verified', 'success', NOW() - INTERVAL '2 days'),
(3, 'document_collection', 9, 'All required documents collected', 'info', NOW() - INTERVAL '1 day'),
(11, 'application_rejection', 8, 'Application rejected due to insufficient income verification', 'warning', NOW() - INTERVAL '5 hours'),
(6, 'final_approval', 8, 'Application approved after thorough review', 'success', NOW() - INTERVAL '6 hours');

-- =============================================================================
-- 12. SECURITY ALERTS
-- =============================================================================

INSERT INTO security_alerts (customer_id, alert_type, severity, description, status, created_at) VALUES
(7, 'suspicious_activity', 'medium', 'Multiple failed login attempts detected', 'open', NOW() - INTERVAL '2 hours'),
(12, 'document_tampering', 'high', 'Possible document tampering detected in uploaded files', 'open', NOW() - INTERVAL '1 hour'),
(5, 'unusual_transaction', 'low', 'Large transaction amount detected', 'resolved', NOW() - INTERVAL '1 day');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify data population
SELECT 'Data Population Complete' as status;
SELECT 'Users: ' || COUNT(*) as user_count FROM users;
SELECT 'Customers: ' || COUNT(*) as customer_count FROM customers;
SELECT 'Cases: ' || COUNT(*) as case_count FROM cases;
SELECT 'Documents: ' || COUNT(*) as document_count FROM documents;
SELECT 'Accounts: ' || COUNT(*) as account_count FROM accounts;
SELECT 'Transactions: ' || COUNT(*) as transaction_count FROM transactions;
SELECT 'Notifications: ' || COUNT(*) as notification_count FROM notifications;
SELECT 'System Settings: ' || COUNT(*) as settings_count FROM system_settings;
