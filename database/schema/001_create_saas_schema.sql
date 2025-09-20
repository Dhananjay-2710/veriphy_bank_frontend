-- Veriphy Bank SaaS Platform Database Schema
-- Multi-tenant architecture for loan processing workflow management
-- PostgreSQL 13+ required

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'org_admin', 'sales_manager', 'sales_agent', 'credit_manager', 'credit_analyst', 'compliance_officer', 'auditor');
CREATE TYPE organization_status AS ENUM ('active', 'suspended', 'trial', 'expired', 'cancelled');
CREATE TYPE department_type AS ENUM ('sales', 'credit', 'compliance', 'admin', 'operations');
CREATE TYPE loan_status AS ENUM ('draft', 'submitted', 'under_review', 'document_collection', 'credit_analysis', 'approved', 'rejected', 'disbursed', 'closed');
CREATE TYPE document_status AS ENUM ('pending', 'requested', 'uploaded', 'verified', 'rejected', 'expired');
CREATE TYPE communication_type AS ENUM ('whatsapp', 'email', 'sms', 'call', 'system');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE subscription_plan AS ENUM ('trial', 'basic', 'professional', 'enterprise');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');

-- =============================================================================
-- 1. MULTI-TENANT ORGANIZATION STRUCTURE
-- =============================================================================

-- Organizations (Banks/Financial Institutions)
CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(255) UNIQUE,
    logo_url VARCHAR(500),
    description TEXT,
    address JSONB,
    contact_info JSONB,
    settings JSONB DEFAULT '{}',
    status organization_status DEFAULT 'trial',
    subscription_plan subscription_plan DEFAULT 'trial',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    max_users INTEGER DEFAULT 10,
    max_loans_per_month INTEGER DEFAULT 100,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Departments within organizations
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type department_type NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- =============================================================================
-- 2. USER MANAGEMENT (Multi-tenant)
-- =============================================================================

-- Global users table (cross-tenant)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Organization memberships
CREATE TABLE organization_members (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    role user_role NOT NULL,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invited_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

-- User sessions (tenant-aware)
CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. CUSTOMER MANAGEMENT (Per Organization)
-- =============================================================================

-- Customers (scoped to organizations)
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20),
    marital_status VARCHAR(20),
    employment_type VARCHAR(50),
    monthly_income DECIMAL(15,2),
    address JSONB,
    kyc_documents JSONB DEFAULT '{}',
    risk_profile priority_level DEFAULT 'medium',
    kyc_status VARCHAR(20) DEFAULT 'pending',
    assigned_sales_agent BIGINT REFERENCES users(id),
    assigned_credit_analyst BIGINT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, customer_number)
);

-- =============================================================================
-- 4. LOAN MANAGEMENT SYSTEM
-- =============================================================================

-- Loan products (per organization)
CREATE TABLE loan_products (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    product_code VARCHAR(50) NOT NULL,
    min_amount DECIMAL(15,2) NOT NULL,
    max_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,4) NOT NULL,
    tenure_months INTEGER NOT NULL,
    processing_fee DECIMAL(10,2) DEFAULT 0,
    required_documents JSONB DEFAULT '[]',
    eligibility_criteria JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, product_code)
);

-- Loan applications
CREATE TABLE loan_applications (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    application_number VARCHAR(50) NOT NULL,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    loan_product_id BIGINT NOT NULL REFERENCES loan_products(id),
    requested_amount DECIMAL(15,2) NOT NULL,
    requested_tenure INTEGER NOT NULL,
    purpose TEXT,
    status loan_status DEFAULT 'draft',
    priority priority_level DEFAULT 'medium',
    assigned_sales_agent BIGINT REFERENCES users(id),
    assigned_credit_analyst BIGINT REFERENCES users(id),
    current_stage VARCHAR(50) DEFAULT 'application',
    workflow_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    disbursed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(organization_id, application_number)
);

-- =============================================================================
-- 5. DOCUMENT MANAGEMENT SYSTEM
-- =============================================================================

-- Document types (per organization)
CREATE TABLE document_types (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    priority priority_level DEFAULT 'medium',
    file_types TEXT[] DEFAULT '{}',
    max_file_size BIGINT DEFAULT 10485760, -- 10MB
    validity_days INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);

-- Documents
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    loan_application_id BIGINT NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    document_type_id BIGINT NOT NULL REFERENCES document_types(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(50),
    mime_type VARCHAR(100),
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
-- 6. WHATSAPP INTEGRATION
-- =============================================================================

-- WhatsApp conversations
CREATE TABLE whatsapp_conversations (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    loan_application_id BIGINT NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    customer_phone VARCHAR(20) NOT NULL,
    whatsapp_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'active',
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, customer_phone)
);

-- WhatsApp messages
CREATE TABLE whatsapp_messages (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    conversation_id BIGINT NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    message_id VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- text, image, document, audio, video
    content TEXT,
    sender VARCHAR(20) NOT NULL, -- customer, agent, system
    direction VARCHAR(10) NOT NULL, -- inbound, outbound
    document_id BIGINT REFERENCES documents(id),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, message_id)
);

-- WhatsApp templates
CREATE TABLE whatsapp_templates (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, template_id)
);

-- =============================================================================
-- 7. WORKFLOW MANAGEMENT
-- =============================================================================

-- Workflow stages
CREATE TABLE workflow_stages (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    stage_key VARCHAR(50) NOT NULL,
    description TEXT,
    department_type department_type NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, stage_key)
);

-- Workflow transitions
CREATE TABLE workflow_transitions (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    from_stage_id BIGINT NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    to_stage_id BIGINT NOT NULL REFERENCES workflow_stages(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    conditions JSONB DEFAULT '{}',
    actions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, from_stage_id, to_stage_id)
);

-- Workflow history
CREATE TABLE workflow_history (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    loan_application_id BIGINT NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    from_stage_id BIGINT REFERENCES workflow_stages(id),
    to_stage_id BIGINT NOT NULL REFERENCES workflow_stages(id),
    transition_id BIGINT REFERENCES workflow_transitions(id),
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    comments TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 8. COMMUNICATION & NOTIFICATIONS
-- =============================================================================

-- Notifications
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Communication logs
CREATE TABLE communication_logs (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    loan_application_id BIGINT NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    type communication_type NOT NULL,
    direction VARCHAR(10) NOT NULL, -- inbound, outbound
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(200),
    content TEXT,
    status VARCHAR(20) DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 9. AUDIT & COMPLIANCE
-- =============================================================================

-- Audit logs (tenant-aware)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Compliance reports
CREATE TABLE compliance_reports (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL,
    report_name VARCHAR(200) NOT NULL,
    parameters JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending',
    file_path VARCHAR(500),
    generated_by BIGINT REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 10. SAAS MANAGEMENT
-- =============================================================================

-- Subscription plans
CREATE TABLE subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    plan_type subscription_plan NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,
    max_users INTEGER NOT NULL,
    max_loans_per_month INTEGER NOT NULL,
    features JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Billing
CREATE TABLE billing (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_plan_id BIGINT NOT NULL REFERENCES subscription_plans(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    status payment_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 11. SYSTEM CONFIGURATION
-- =============================================================================

-- System settings (global)
CREATE TABLE system_settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Organization settings (per-tenant)
CREATE TABLE organization_settings (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, key)
);

-- Create indexes for performance
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_deleted_at ON organizations(deleted_at);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

CREATE INDEX idx_organization_members_user_org ON organization_members(user_id, organization_id);
CREATE INDEX idx_organization_members_org_dept ON organization_members(organization_id, department_id);

CREATE INDEX idx_customers_organization ON customers(organization_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at);

CREATE INDEX idx_loan_applications_organization ON loan_applications(organization_id);
CREATE INDEX idx_loan_applications_customer ON loan_applications(customer_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_applications_created_at ON loan_applications(created_at);

CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_documents_loan_application ON documents(loan_application_id);
CREATE INDEX idx_documents_status ON documents(status);

CREATE INDEX idx_whatsapp_conversations_organization ON whatsapp_conversations(organization_id);
CREATE INDEX idx_whatsapp_conversations_customer ON whatsapp_conversations(customer_phone);

CREATE INDEX idx_whatsapp_messages_organization ON whatsapp_messages(organization_id);
CREATE INDEX idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp);

CREATE INDEX idx_workflow_history_organization ON workflow_history(organization_id);
CREATE INDEX idx_workflow_history_loan_application ON workflow_history(loan_application_id);
CREATE INDEX idx_workflow_history_created_at ON workflow_history(created_at);

CREATE INDEX idx_notifications_organization_user ON notifications(organization_id, user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_members_updated_at BEFORE UPDATE ON organization_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_products_updated_at BEFORE UPDATE ON loan_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON loan_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_types_updated_at BEFORE UPDATE ON document_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON whatsapp_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_stages_updated_at BEFORE UPDATE ON workflow_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflow_transitions_updated_at BEFORE UPDATE ON workflow_transitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_settings_updated_at BEFORE UPDATE ON organization_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
