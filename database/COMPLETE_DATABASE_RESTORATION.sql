-- =============================================================================
-- VERIPHY BANK - COMPLETE DATABASE RESTORATION SCRIPT
-- =============================================================================
-- This script creates ALL missing tables and populates them with comprehensive data
-- Use this after the database has been cleared
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('salesperson', 'manager', 'credit-ops', 'admin', 'auditor', 'super_admin', 'compliance');
CREATE TYPE account_status AS ENUM ('active', 'frozen', 'closed', 'suspended');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'reversed', 'cancelled');
CREATE TYPE document_status AS ENUM ('pending', 'received', 'verified', 'rejected', 'expired');
CREATE TYPE case_status AS ENUM ('new', 'in-progress', 'review', 'approved', 'rejected', 'on-hold');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE log_type AS ENUM ('info', 'warning', 'success', 'error', 'critical');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE employment_type AS ENUM ('salaried', 'self-employed', 'retired', 'unemployed');
CREATE TYPE marital_status AS ENUM ('single', 'married', 'divorced', 'widowed');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer-not-to-say');
CREATE TYPE kyc_status AS ENUM ('pending', 'in-progress', 'verified', 'rejected', 'expired');

-- =============================================================================
-- 1. CREATE ORGANIZATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url VARCHAR(500),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. CREATE DEPARTMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    department_type VARCHAR(50) DEFAULT 'general',
    parent_department_id BIGINT REFERENCES departments(id),
    manager_id BIGINT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, code)
);

-- =============================================================================
-- 3. CREATE ROLES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- =============================================================================
-- 4. CREATE PERMISSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- =============================================================================
-- 5. CREATE ROLE_PERMISSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- =============================================================================
-- 6. CREATE USERS TABLE (Updated Structure)
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    mobile VARCHAR(20),
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    organization_id BIGINT REFERENCES organizations(id),
    department_id BIGINT REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 7. CREATE USER_ROLES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    organization_id BIGINT REFERENCES organizations(id),
    department_id BIGINT REFERENCES departments(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- =============================================================================
-- 8. CREATE PRODUCTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    interest_rate DECIMAL(5,4),
    min_amount DECIMAL(15,2),
    max_amount DECIMAL(15,2),
    min_tenure INTEGER,
    max_tenure INTEGER,
    processing_fee DECIMAL(10,2),
    prepayment_charges DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 9. CREATE DOCUMENT_TYPES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS document_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    priority priority_level DEFAULT 'medium',
    validity_period INTEGER,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 10. CREATE CUSTOMERS TABLE (Updated Structure)
-- =============================================================================

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    pan_number VARCHAR(10) UNIQUE,
    aadhaar_number VARCHAR(12) UNIQUE,
    date_of_birth DATE,
    gender gender_type,
    marital_status marital_status,
    employment_type employment_type,
    risk_profile priority_level DEFAULT 'medium',
    kyc_status kyc_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- =============================================================================
-- 11. CREATE CASES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS cases (
    id BIGSERIAL PRIMARY KEY,
    case_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    assigned_to BIGINT REFERENCES users(id),
    loan_type VARCHAR(100),
    loan_amount DECIMAL(15,2),
    status case_status DEFAULT 'new',
    priority priority_level DEFAULT 'medium',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 12. CREATE DOCUMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    document_type_id BIGINT NOT NULL REFERENCES document_types(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    status document_status DEFAULT 'pending',
    uploaded_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by BIGINT REFERENCES users(id),
    rejection_reason TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- 13. CREATE TASKS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES cases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    assigned_to BIGINT REFERENCES users(id),
    created_by BIGINT REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 14. CREATE LOGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS logs (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT REFERENCES organizations(id),
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    description TEXT,
    log_type log_type DEFAULT 'info',
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 15. CREATE NOTIFICATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 16. CREATE SYSTEM_SETTINGS TABLE
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

-- =============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(code);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);

-- Departments indexes
CREATE INDEX IF NOT EXISTS idx_departments_org_id ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_pan ON customers(pan_number);
CREATE INDEX IF NOT EXISTS idx_customers_aadhaar ON customers(aadhaar_number);

-- Cases indexes
CREATE INDEX IF NOT EXISTS idx_cases_customer_id ON cases(customer_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON tasks(case_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =============================================================================
-- INSERT INITIAL DATA
-- =============================================================================

-- Insert default organization
INSERT INTO organizations (name, code, description, email, phone) VALUES
('Veriphy Bank', 'VERIPHY', 'Veriphy Bank - Digital Banking Solutions', 'info@veriphybank.com', '+91-9876543210')
ON CONFLICT (code) DO NOTHING;

-- Insert departments
INSERT INTO departments (organization_id, name, code, description, department_type) VALUES
(1, 'Sales Department', 'SALES', 'Customer acquisition and sales', 'sales'),
(1, 'Management', 'MGMT', 'Management and oversight', 'management'),
(1, 'Credit Operations', 'CREDIT', 'Credit assessment and operations', 'credit'),
(1, 'Administration', 'ADMIN', 'System administration', 'administration'),
(1, 'Compliance', 'COMPLIANCE', 'Compliance and audit', 'compliance')
ON CONFLICT (organization_id, code) DO NOTHING;

-- Insert roles
INSERT INTO roles (name, description) VALUES
('super_admin', 'Super administrator with full system access'),
('admin', 'System administrator with administrative privileges'),
('manager', 'Manager with team oversight and approval rights'),
('salesperson', 'Sales personnel for customer acquisition'),
('credit-ops', 'Credit operations for risk assessment'),
('compliance', 'Compliance officer for audit and monitoring'),
('auditor', 'Auditor with read-only access')
ON CONFLICT (name) DO NOTHING;

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

-- Organization management permissions
('organizations.create', 'organizations', 'create'),
('organizations.read', 'organizations', 'read'),
('organizations.update', 'organizations', 'update'),
('organizations.delete', 'organizations', 'delete'),

-- Department management permissions
('departments.create', 'departments', 'create'),
('departments.read', 'departments', 'read'),
('departments.update', 'departments', 'update'),
('departments.delete', 'departments', 'delete'),

-- Product management permissions
('products.create', 'products', 'create'),
('products.read', 'products', 'read'),
('products.update', 'products', 'update'),
('products.delete', 'products', 'delete'),

-- Compliance permissions
('compliance.read', 'compliance', 'read'),
('compliance.audit', 'compliance', 'audit'),
('compliance.report', 'compliance', 'report'),

-- Admin permissions
('admin.system', 'system', 'admin'),
('admin.settings', 'settings', 'admin')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Super Admin (all permissions)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'admin'
AND p.name IN (
    'users.create', 'users.read', 'users.update', 'users.delete',
    'customers.create', 'customers.read', 'customers.update', 'customers.delete',
    'cases.create', 'cases.read', 'cases.update', 'cases.delete', 'cases.assign',
    'documents.read', 'documents.verify', 'documents.reject',
    'organizations.read', 'organizations.update',
    'departments.create', 'departments.read', 'departments.update', 'departments.delete',
    'products.create', 'products.read', 'products.update', 'products.delete',
    'compliance.read', 'compliance.audit', 'compliance.report',
    'admin.system', 'admin.settings'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Manager permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'manager'
AND p.name IN (
    'customers.create', 'customers.read', 'customers.update',
    'cases.create', 'cases.read', 'cases.update', 'cases.assign',
    'documents.read', 'documents.verify',
    'organizations.read', 'departments.read', 'products.read',
    'compliance.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Salesperson permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'salesperson'
AND p.name IN (
    'customers.create', 'customers.read', 'customers.update',
    'cases.create', 'cases.read', 'cases.update',
    'documents.upload', 'documents.read',
    'organizations.read', 'departments.read', 'products.read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Credit Ops permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'credit-ops'
AND p.name IN (
    'customers.read', 'customers.update',
    'cases.read', 'cases.update', 'cases.approve', 'cases.reject',
    'documents.read', 'documents.verify', 'documents.reject',
    'organizations.read', 'departments.read', 'products.read',
    'compliance.read', 'compliance.report'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Compliance permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'compliance'
AND p.name IN (
    'customers.read', 'cases.read', 'documents.read',
    'organizations.read', 'departments.read', 'products.read',
    'compliance.read', 'compliance.audit', 'compliance.report'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Auditor permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'auditor'
AND p.name IN (
    'customers.read', 'cases.read', 'documents.read',
    'organizations.read', 'departments.read', 'products.read',
    'compliance.read', 'compliance.audit', 'compliance.report'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Insert products
INSERT INTO products (organization_id, name, code, description, category, interest_rate, min_amount, max_amount, min_tenure, max_tenure) VALUES
(1, 'Home Loan', 'HOME', 'Home loan for property purchase', 'secured', 8.50, 500000, 50000000, 60, 360),
(1, 'Personal Loan', 'PERSONAL', 'Personal loan for various purposes', 'unsecured', 12.00, 50000, 2000000, 12, 60),
(1, 'Business Loan', 'BUSINESS', 'Business loan for working capital', 'secured', 10.50, 100000, 10000000, 12, 120),
(1, 'Car Loan', 'CAR', 'Vehicle loan for car purchase', 'secured', 9.00, 100000, 5000000, 12, 84),
(1, 'Education Loan', 'EDUCATION', 'Education loan for studies', 'secured', 8.00, 50000, 2000000, 12, 120),
(1, 'Gold Loan', 'GOLD', 'Gold loan against gold ornaments', 'secured', 12.50, 10000, 1000000, 6, 36)
ON CONFLICT DO NOTHING;

-- Insert document types
INSERT INTO document_types (name, category, description, is_required, priority) VALUES
-- Identity documents
('Aadhaar Card', 'identity', 'Government issued Aadhaar card', true, 'high'),
('PAN Card', 'identity', 'Permanent Account Number card', true, 'high'),
('Passport', 'identity', 'Valid passport', false, 'medium'),
('Driving License', 'identity', 'Valid driving license', false, 'medium'),
('Voter ID', 'identity', 'Voter identification card', false, 'low'),

-- Financial documents
('Bank Statements', 'financial', 'Bank statements for last 6 months', true, 'high'),
('Salary Slips', 'financial', 'Salary slips for last 3 months', true, 'high'),
('Form 16', 'financial', 'Income tax form 16', true, 'high'),
('ITR Returns', 'financial', 'Income tax returns', true, 'high'),
('Balance Sheet', 'financial', 'Business balance sheet', false, 'medium'),
('Profit Loss Statement', 'financial', 'Business P&L statement', false, 'medium'),

-- Business documents
('GST Registration', 'business', 'GST registration certificate', true, 'high'),
('GST Returns', 'business', 'GST returns for last 6 months', true, 'high'),
('Business Registration', 'business', 'Business registration certificate', true, 'high'),
('Partnership Deed', 'business', 'Partnership deed document', false, 'medium'),
('Company Incorporation', 'business', 'Company incorporation certificate', false, 'medium'),

-- Property documents
('Property Documents', 'property', 'Property ownership documents', true, 'high'),
('Property Valuation', 'property', 'Property valuation report', true, 'high'),
('NOC from Builder', 'property', 'No Objection Certificate from builder', false, 'medium'),
('Sale Agreement', 'property', 'Property sale agreement', false, 'medium'),

-- Employment documents
('Employment Letter', 'employment', 'Employment verification letter', true, 'high'),
('Experience Certificate', 'employment', 'Work experience certificate', false, 'medium'),
('Appointment Letter', 'employment', 'Job appointment letter', false, 'medium'),

-- Other documents
('Photograph', 'other', 'Passport size photograph', true, 'high'),
('Signature Specimen', 'other', 'Signature specimen', true, 'high'),
('Address Proof', 'other', 'Address proof document', true, 'high'),
('Income Certificate', 'other', 'Income certificate', false, 'medium')
ON CONFLICT DO NOTHING;

-- Insert system settings
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
-- INSERT DEMO USERS
-- =============================================================================

INSERT INTO users (email, password_hash, full_name, mobile, role, organization_id, department_id) VALUES
-- Super Admin
('superadmin@veriphy.com', crypt('admin123', gen_salt('bf')), 'Super Admin', '+91-9999999999', 'super_admin', 1, 1),

-- Sales Team
('priya.sharma@veriphy.com', crypt('demo123', gen_salt('bf')), 'Priya Sharma', '+91-9876543210', 'salesperson', 1, 1),
('rajesh.kumar@veriphy.com', crypt('demo123', gen_salt('bf')), 'Rajesh Kumar', '+91-9876543211', 'salesperson', 1, 1),
('sneha.singh@veriphy.com', crypt('demo123', gen_salt('bf')), 'Sneha Singh', '+91-9876543212', 'salesperson', 1, 1),
('amit.patel@veriphy.com', crypt('demo123', gen_salt('bf')), 'Amit Patel', '+91-9876543213', 'salesperson', 1, 1),

-- Management Team
('anita.reddy@veriphy.com', crypt('demo123', gen_salt('bf')), 'Anita Reddy', '+91-9876543214', 'manager', 1, 2),
('suresh.kumar@veriphy.com', crypt('demo123', gen_salt('bf')), 'Suresh Kumar', '+91-9876543215', 'manager', 1, 2),

-- Credit Operations Team
('meera.joshi@veriphy.com', crypt('demo123', gen_salt('bf')), 'Meera Joshi', '+91-9876543216', 'credit-ops', 1, 3),
('rahul.verma@veriphy.com', crypt('demo123', gen_salt('bf')), 'Rahul Verma', '+91-9876543217', 'credit-ops', 1, 3),
('kavya.nair@veriphy.com', crypt('demo123', gen_salt('bf')), 'Kavya Nair', '+91-9876543218', 'credit-ops', 1, 3),

-- Admin Team
('arjun.singh@veriphy.com', crypt('demo123', gen_salt('bf')), 'Arjun Singh', '+91-9876543219', 'admin', 1, 4),
('deepika.rao@veriphy.com', crypt('demo123', gen_salt('bf')), 'Deepika Rao', '+91-9876543220', 'admin', 1, 4),

-- Compliance/Audit Team
('rohit.agarwal@veriphy.com', crypt('demo123', gen_salt('bf')), 'Rohit Agarwal', '+91-9876543221', 'compliance', 1, 5),
('shilpa.mehta@veriphy.com', crypt('demo123', gen_salt('bf')), 'Shilpa Mehta', '+91-9876543222', 'compliance', 1, 5)
ON CONFLICT (email) DO NOTHING;

-- Insert user roles
INSERT INTO user_roles (user_id, role_id, organization_id, department_id) 
SELECT u.id, r.id, u.organization_id, u.department_id
FROM users u, roles r 
WHERE u.role = r.name
ON CONFLICT (user_id, role_id) DO NOTHING;

-- =============================================================================
-- INSERT DEMO CUSTOMERS
-- =============================================================================

INSERT INTO customers (user_id, full_name, phone, email, pan_number, aadhaar_number, date_of_birth, gender, marital_status, employment_type, risk_profile, kyc_status) VALUES
(2, 'Priya Sharma', '+91-9876543210', 'priya.sharma@veriphy.com', 'ABCDE1234F', '123456789012', '1985-03-15', 'female', 'married', 'salaried', 'low', 'verified'),
(3, 'Rajesh Kumar', '+91-9876543211', 'rajesh.kumar@veriphy.com', 'FGHIJ5678G', '234567890123', '1988-07-22', 'male', 'single', 'salaried', 'medium', 'verified'),
(4, 'Sneha Singh', '+91-9876543212', 'sneha.singh@veriphy.com', 'KLMNO9012H', '345678901234', '1990-11-08', 'female', 'married', 'self-employed', 'medium', 'verified'),
(5, 'Amit Patel', '+91-9876543213', 'amit.patel@veriphy.com', 'PQRST3456I', '456789012345', '1982-12-03', 'male', 'married', 'salaried', 'low', 'verified'),
(6, 'Anita Reddy', '+91-9876543214', 'anita.reddy@veriphy.com', 'UVWXY7890J', '567890123456', '1987-05-18', 'female', 'single', 'salaried', 'medium', 'verified'),
(7, 'Suresh Kumar', '+91-9876543215', 'suresh.kumar@veriphy.com', 'ZABCD1234K', '678901234567', '1983-09-25', 'male', 'married', 'self-employed', 'high', 'in-progress'),
(8, 'Meera Joshi', '+91-9876543216', 'meera.joshi@veriphy.com', 'EFGHI5678L', '789012345678', '1991-02-14', 'female', 'single', 'salaried', 'low', 'verified'),
(9, 'Rahul Verma', '+91-9876543217', 'rahul.verma@veriphy.com', 'JKLMN9012M', '890123456789', '1986-08-30', 'male', 'married', 'salaried', 'medium', 'verified'),
(10, 'Kavya Nair', '+91-9876543218', 'kavya.nair@veriphy.com', 'OPQRS3456N', '901234567890', '1984-06-12', 'female', 'married', 'self-employed', 'medium', 'verified'),
(11, 'Arjun Singh', '+91-9876543219', 'arjun.singh@veriphy.com', 'TUVWX7890O', '012345678901', '1989-04-07', 'male', 'single', 'salaried', 'low', 'verified'),
(12, 'Deepika Rao', '+91-9876543220', 'deepika.rao@veriphy.com', 'YZABC1234P', '112233445566', '1987-10-19', 'female', 'married', 'salaried', 'medium', 'verified'),
(13, 'Rohit Agarwal', '+91-9876543221', 'rohit.agarwal@veriphy.com', 'DEFGH5678Q', '223344556677', '1985-01-26', 'male', 'married', 'self-employed', 'high', 'in-progress'),
(14, 'Shilpa Mehta', '+91-9876543222', 'shilpa.mehta@veriphy.com', 'IJKLM9012R', '334455667788', '1990-03-11', 'female', 'single', 'salaried', 'low', 'verified'),
(15, 'Vikram Gupta', '+91-9876543223', 'vikram.gupta@veriphy.com', 'NOPQR3456S', '445566778899', '1988-07-05', 'male', 'married', 'salaried', 'medium', 'verified'),
(16, 'Kiran Desai', '+91-9876543224', 'kiran.desai@veriphy.com', 'STUVW7890T', '556677889900', '1983-12-17', 'female', 'married', 'self-employed', 'medium', 'verified')
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- INSERT DEMO CASES
-- =============================================================================

INSERT INTO cases (case_number, customer_id, assigned_to, loan_type, loan_amount, status, priority, description) VALUES
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
('CASE000015', 15, 4, 'personal_loan', 250000.00, 'new', 'medium', 'Personal loan for home renovation')
ON CONFLICT (case_number) DO NOTHING;

-- =============================================================================
-- INSERT DEMO NOTIFICATIONS
-- =============================================================================

INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES
(2, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000001', false, NOW() - INTERVAL '1 hour'),
(3, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000002', false, NOW() - INTERVAL '2 hours'),
(4, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000003', false, NOW() - INTERVAL '3 hours'),
(5, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000004', false, NOW() - INTERVAL '4 hours'),
(7, 'document_verified', 'Document Verified', 'Document verification completed for Case CASE000001', true, NOW() - INTERVAL '5 hours'),
(8, 'case_approved', 'Case Approved', 'Case CASE000006 has been approved', true, NOW() - INTERVAL '6 hours'),
(9, 'case_rejected', 'Case Rejected', 'Case CASE000011 has been rejected - insufficient income', true, NOW() - INTERVAL '7 hours')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

SELECT 'Database Restoration Complete' as status;
SELECT 'Organizations: ' || COUNT(*) as count FROM organizations;
SELECT 'Departments: ' || COUNT(*) as count FROM departments;
SELECT 'Roles: ' || COUNT(*) as count FROM roles;
SELECT 'Permissions: ' || COUNT(*) as count FROM permissions;
SELECT 'Users: ' || COUNT(*) as count FROM users;
SELECT 'User Roles: ' || COUNT(*) as count FROM user_roles;
SELECT 'Products: ' || COUNT(*) as count FROM products;
SELECT 'Document Types: ' || COUNT(*) as count FROM document_types;
SELECT 'Customers: ' || COUNT(*) as count FROM customers;
SELECT 'Cases: ' || COUNT(*) as count FROM cases;
SELECT 'Documents: ' || COUNT(*) as count FROM documents;
SELECT 'Tasks: ' || COUNT(*) as count FROM tasks;
SELECT 'Logs: ' || COUNT(*) as count FROM logs;
SELECT 'Notifications: ' || COUNT(*) as count FROM notifications;
SELECT 'System Settings: ' || COUNT(*) as count FROM system_settings;
