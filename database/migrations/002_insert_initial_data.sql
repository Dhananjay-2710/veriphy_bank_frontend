-- Veriphy Bank Database
-- Initial data insertion for lookup tables and system configuration

-- Insert roles
INSERT INTO roles (name, description) VALUES
('salesperson', 'Sales personnel who handle customer acquisition and initial case processing'),
('manager', 'Managers who oversee sales teams and approve cases'),
('credit-ops', 'Credit operations team responsible for risk assessment and final approvals'),
('admin', 'System administrators with full access'),
('auditor', 'Auditors who can view all data for compliance purposes');

-- Insert permissions
INSERT INTO permissions (name, resource, action) VALUES
-- User management permissions
('users.create', 'users', 'create'),
('users.read', 'users', 'read'),
('users.update', 'users', 'update'),
('users.delete', 'users', 'delete'),

-- Customer management permissions
('customers.create', 'customers', 'create'),
('customers.read', 'customers', 'read'),
('customers.update', 'customers', 'update'),
('customers.delete', 'customers', 'delete'),

-- Account management permissions
('accounts.create', 'accounts', 'create'),
('accounts.read', 'accounts', 'read'),
('accounts.update', 'accounts', 'update'),
('accounts.delete', 'accounts', 'delete'),

-- Transaction permissions
('transactions.create', 'transactions', 'create'),
('transactions.read', 'transactions', 'read'),
('transactions.update', 'transactions', 'update'),
('transactions.delete', 'transactions', 'delete'),

-- Case management permissions
('cases.create', 'cases', 'create'),
('cases.read', 'cases', 'read'),
('cases.update', 'cases', 'update'),
('cases.delete', 'cases', 'delete'),
('cases.assign', 'cases', 'assign'),
('cases.approve', 'cases', 'approve'),
('cases.reject', 'cases', 'reject'),

-- Document management permissions
('documents.upload', 'documents', 'upload'),
('documents.read', 'documents', 'read'),
('documents.verify', 'documents', 'verify'),
('documents.reject', 'documents', 'reject'),

-- Compliance permissions
('compliance.read', 'compliance', 'read'),
('compliance.audit', 'compliance', 'audit'),
('compliance.report', 'compliance', 'report'),

-- Admin permissions
('admin.system', 'system', 'admin'),
('admin.settings', 'settings', 'admin'),
('admin.users', 'users', 'admin');

-- Assign permissions to roles
-- Salesperson permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'salesperson' 
AND p.name IN (
    'customers.create', 'customers.read', 'customers.update',
    'cases.create', 'cases.read', 'cases.update',
    'documents.upload', 'documents.read',
    'transactions.read'
);

-- Manager permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'manager' 
AND p.name IN (
    'customers.create', 'customers.read', 'customers.update',
    'cases.create', 'cases.read', 'cases.update', 'cases.assign',
    'documents.read', 'documents.verify',
    'transactions.read', 'compliance.read'
);

-- Credit Ops permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'credit-ops' 
AND p.name IN (
    'customers.read', 'customers.update',
    'cases.read', 'cases.update', 'cases.approve', 'cases.reject',
    'documents.read', 'documents.verify', 'documents.reject',
    'transactions.read', 'compliance.read', 'compliance.report'
);

-- Admin permissions (all permissions)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'admin';

-- Auditor permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'auditor' 
AND p.name IN (
    'users.read', 'customers.read', 'accounts.read', 
    'transactions.read', 'cases.read', 'documents.read',
    'compliance.read', 'compliance.audit', 'compliance.report'
);

-- Insert account types
INSERT INTO account_types (name, description, min_balance, interest_rate) VALUES
('savings', 'Regular savings account', 1000.00, 3.50),
('current', 'Current account for business', 5000.00, 1.00),
('fixed_deposit', 'Fixed deposit account', 10000.00, 6.50),
('recurring_deposit', 'Recurring deposit account', 500.00, 6.00),
('loan_account', 'Loan disbursement account', 0.00, 0.00);

-- Insert transaction types
INSERT INTO transaction_types (name, category, description, is_debit) VALUES
-- Deposit transactions
('cash_deposit', 'deposit', 'Cash deposit at branch', false),
('cheque_deposit', 'deposit', 'Cheque deposit', false),
('neft_credit', 'deposit', 'NEFT credit transfer', false),
('rtgs_credit', 'deposit', 'RTGS credit transfer', false),
('upi_credit', 'deposit', 'UPI credit transfer', false),
('imps_credit', 'deposit', 'IMPS credit transfer', false),
('card_payment', 'deposit', 'Card payment received', false),

-- Withdrawal transactions
('cash_withdrawal', 'withdrawal', 'Cash withdrawal at branch', true),
('atm_withdrawal', 'withdrawal', 'ATM withdrawal', true),
('neft_debit', 'withdrawal', 'NEFT debit transfer', true),
('rtgs_debit', 'withdrawal', 'RTGS debit transfer', true),
('upi_debit', 'withdrawal', 'UPI debit transfer', true),
('imps_debit', 'withdrawal', 'IMPS debit transfer', true),
('card_purchase', 'withdrawal', 'Card purchase', true),

-- Transfer transactions
('internal_transfer', 'transfer', 'Internal account transfer', true),
('external_transfer', 'transfer', 'External bank transfer', true),

-- Loan transactions
('loan_disbursement', 'loan', 'Loan amount disbursed', false),
('loan_repayment', 'loan', 'Loan repayment', true),
('interest_charge', 'loan', 'Interest charged on loan', true),
('penalty_charge', 'loan', 'Penalty charged', true),

-- Fee transactions
('account_fee', 'fee', 'Account maintenance fee', true),
('transaction_fee', 'fee', 'Transaction processing fee', true),
('late_fee', 'fee', 'Late payment fee', true),

-- Adjustment transactions
('balance_adjustment', 'adjustment', 'Balance adjustment', true),
('refund', 'adjustment', 'Refund processed', false),
('reversal', 'adjustment', 'Transaction reversal', true);

-- Insert document types
INSERT INTO document_types (name, category, is_required, priority) VALUES
-- Identity documents
('aadhaar_card', 'identity', true, 'high'),
('pan_card', 'identity', true, 'high'),
('passport', 'identity', false, 'medium'),
('driving_license', 'identity', false, 'medium'),
('voter_id', 'identity', false, 'low'),

-- Financial documents
('bank_statements', 'financial', true, 'high'),
('salary_slips', 'financial', true, 'high'),
('form_16', 'financial', true, 'high'),
('itr_returns', 'financial', true, 'high'),
('balance_sheet', 'financial', false, 'medium'),
('profit_loss_statement', 'financial', false, 'medium'),

-- Business documents
('gst_registration', 'business', true, 'high'),
('gst_returns', 'business', true, 'high'),
('business_registration', 'business', true, 'high'),
('partnership_deed', 'business', false, 'medium'),
('company_incorporation', 'business', false, 'medium'),

-- Property documents
('property_documents', 'property', true, 'high'),
('property_valuation', 'property', true, 'high'),
('noc_from_builder', 'property', false, 'medium'),
('sale_agreement', 'property', false, 'medium'),

-- Employment documents
('employment_letter', 'employment', true, 'high'),
('experience_certificate', 'employment', false, 'medium'),
('appointment_letter', 'employment', false, 'medium'),

-- Other documents
('photograph', 'other', true, 'high'),
('signature_specimen', 'other', true, 'high'),
('address_proof', 'other', true, 'high'),
('income_certificate', 'other', false, 'medium');

-- Insert loan products
INSERT INTO loan_products (name, description, min_amount, max_amount, interest_rate, tenure_months) VALUES
('home_loan', 'Home loan for property purchase', 500000, 50000000, 8.50, 360),
('personal_loan', 'Personal loan for various purposes', 50000, 2000000, 12.00, 60),
('business_loan', 'Business loan for working capital', 100000, 10000000, 10.50, 120),
('car_loan', 'Vehicle loan for car purchase', 100000, 5000000, 9.00, 84),
('education_loan', 'Education loan for studies', 50000, 2000000, 8.00, 120),
('gold_loan', 'Gold loan against gold ornaments', 10000, 1000000, 12.50, 36);

-- Insert system settings
INSERT INTO system_settings (key, value, description) VALUES
('app_name', 'Veriphy Bank', 'Application name'),
('app_version', '1.0.0', 'Application version'),
('max_login_attempts', '5', 'Maximum login attempts before account lockout'),
('session_timeout_minutes', '30', 'Session timeout in minutes'),
('password_min_length', '8', 'Minimum password length'),
('password_require_special', 'true', 'Require special characters in password'),
('kyc_verification_required', 'true', 'KYC verification required for new accounts'),
('transaction_limit_daily', '100000', 'Daily transaction limit in INR'),
('transaction_limit_monthly', '1000000', 'Monthly transaction limit in INR'),
('whatsapp_enabled', 'true', 'WhatsApp integration enabled'),
('audit_log_retention_days', '2555', 'Audit log retention period in days'),
('document_encryption_enabled', 'true', 'Document encryption enabled'),
('two_factor_auth_enabled', 'true', 'Two-factor authentication enabled'),
('maintenance_mode', 'false', 'System maintenance mode');

-- Create default admin user (password: admin123)
INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active) VALUES
('admin@veriphybank.com', crypt('admin123', gen_salt('bf')), 'System', 'Administrator', '+91-9999999999', true);

-- Assign admin role to default admin user
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.email = 'admin@veriphybank.com' 
AND r.name = 'admin';

-- Create sample users for testing
INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active) VALUES
('priya.sharma@veriphybank.com', crypt('demo123', gen_salt('bf')), 'Priya', 'Sharma', '+91-9876543210', true),
('rajesh.kumar@veriphybank.com', crypt('demo123', gen_salt('bf')), 'Rajesh', 'Kumar', '+91-9876543211', true),
('anita.patel@veriphybank.com', crypt('demo123', gen_salt('bf')), 'Anita', 'Patel', '+91-9876543212', true);

-- Assign roles to sample users
INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.email = 'priya.sharma@veriphybank.com' 
AND r.name = 'salesperson';

INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.email = 'rajesh.kumar@veriphybank.com' 
AND r.name = 'manager';

INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.email = 'anita.patel@veriphybank.com' 
AND r.name = 'credit-ops';
