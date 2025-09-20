-- =============================================================================
-- COMPLETE DATABASE SETUP SCRIPT
-- =============================================================================
-- This script creates all missing tables and populates them with sample data
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- =============================================================================
-- 1. CREATE SYSTEM SETTINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 2. CREATE ORGANIZATION SETTINGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS organization_settings (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, key)
);

-- =============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_created_at ON system_settings(created_at);

CREATE INDEX IF NOT EXISTS idx_organization_settings_org_id ON organization_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_settings_key ON organization_settings(key);
CREATE INDEX IF NOT EXISTS idx_organization_settings_category ON organization_settings(category);
CREATE INDEX IF NOT EXISTS idx_organization_settings_org_key ON organization_settings(organization_id, key);

-- =============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. CREATE RLS POLICIES
-- =============================================================================

-- System settings policies (admin only)
CREATE POLICY "Only admins can view system settings" ON system_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can manage system settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Organization settings policies
CREATE POLICY "Users can view organization settings for their organization" ON organization_settings
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage organization settings for their organization" ON organization_settings
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

-- =============================================================================
-- 6. INSERT SYSTEM SETTINGS
-- =============================================================================

INSERT INTO system_settings (key, value, description, category, is_encrypted) VALUES
('app_name', 'Veriphy Bank', 'Application name', 'general', false),
('app_version', '1.0.0', 'Application version', 'general', false),
('maintenance_mode', 'false', 'Maintenance mode status', 'system', false),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)', 'file_upload', false),
('allowed_file_types', 'pdf,jpg,jpeg,png,doc,docx', 'Allowed file types for upload', 'file_upload', false),
('session_timeout', '3600', 'Session timeout in seconds (1 hour)', 'security', false),
('password_min_length', '8', 'Minimum password length', 'security', false),
('password_require_special', 'true', 'Require special characters in password', 'security', false),
('email_verification_required', 'true', 'Require email verification for new users', 'security', false),
('two_factor_enabled', 'false', 'Enable two-factor authentication', 'security', false),
('audit_log_retention_days', '365', 'Audit log retention period in days', 'audit', false),
('cache_ttl_default', '3600', 'Default cache TTL in seconds', 'cache', false),
('rate_limit_requests_per_minute', '100', 'Rate limit for API requests per minute', 'api', false),
('backup_frequency_hours', '24', 'Database backup frequency in hours', 'backup', false),
('notification_email_enabled', 'true', 'Enable email notifications', 'notifications', false),
('notification_sms_enabled', 'false', 'Enable SMS notifications', 'notifications', false),
('whatsapp_integration_enabled', 'true', 'Enable WhatsApp integration', 'integrations', false),
('api_documentation_enabled', 'true', 'Enable API documentation', 'api', false),
('debug_mode', 'false', 'Enable debug mode', 'development', false),
('log_level', 'info', 'Application log level', 'logging', false)
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 7. INSERT SAMPLE ORGANIZATION (if organizations table exists)
-- =============================================================================

-- Check if organizations table exists and insert sample data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
        INSERT INTO organizations (name, slug, domain, description, status, subscription_plan, max_users, max_loans_per_month, features) VALUES
        ('Veriphy Bank Main', 'veriphy-bank-main', 'veriphybank.com', 'Main Veriphy Bank organization', 'active', 'enterprise', 1000, 10000, '{"advanced_analytics": true, "custom_workflows": true, "api_access": true, "priority_support": true}'),
        ('Veriphy Bank Branch Mumbai', 'veriphy-bank-mumbai', 'mumbai.veriphybank.com', 'Mumbai branch of Veriphy Bank', 'active', 'professional', 100, 1000, '{"advanced_analytics": true, "custom_workflows": false, "api_access": true, "priority_support": false}')
        ON CONFLICT (slug) DO NOTHING;
    END IF;
END $$;

-- =============================================================================
-- 8. INSERT SAMPLE USERS (if users table exists)
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        INSERT INTO users (email, full_name, role, status, organization_id, department_id) VALUES
        ('admin@veriphybank.com', 'System Administrator', 'admin', 'active', 1, 1),
        ('manager@veriphybank.com', 'Branch Manager', 'manager', 'active', 1, 1),
        ('sales@veriphybank.com', 'Sales Agent', 'salesperson', 'active', 1, 2),
        ('credit@veriphybank.com', 'Credit Analyst', 'credit-ops', 'active', 1, 3)
        ON CONFLICT (email) DO NOTHING;
    END IF;
END $$;

-- =============================================================================
-- 9. INSERT SAMPLE CUSTOMERS (if customers table exists)
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        INSERT INTO customers (user_id, pan_number, aadhaar_number, date_of_birth, gender, marital_status, employment_type, risk_profile, kyc_status) VALUES
        (1, 'ABCDE1234F', '123456789012', '1985-06-15', 'male', 'married', 'salaried', 'medium', 'verified'),
        (2, 'FGHIJ5678K', '987654321098', '1990-03-22', 'female', 'single', 'self-employed', 'high', 'pending'),
        (3, 'KLMNO9012P', '112233445566', '1978-11-08', 'male', 'married', 'salaried', 'low', 'verified')
        ON CONFLICT (pan_number) DO NOTHING;
    END IF;
END $$;

-- =============================================================================
-- 10. INSERT SAMPLE LOAN APPLICATIONS (if cases or loan_applications table exists)
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases') THEN
        INSERT INTO cases (case_number, customer_id, assigned_to, loan_type, loan_amount, status, priority, description) VALUES
        ('CASE000001', 1, 3, 'Home Loan', 5000000, 'in-progress', 'high', 'Home loan application for property purchase'),
        ('CASE000002', 2, 3, 'Personal Loan', 500000, 'pending', 'medium', 'Personal loan for business expansion'),
        ('CASE000003', 3, 4, 'Car Loan', 800000, 'approved', 'low', 'Car loan for vehicle purchase')
        ON CONFLICT (case_number) DO NOTHING;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loan_applications') THEN
        INSERT INTO loan_applications (application_number, customer_id, assigned_sales_agent, loan_product_id, requested_amount, status, priority, purpose) VALUES
        ('APP000001', 1, 3, 1, 5000000, 'in-progress', 'high', 'Home loan application for property purchase'),
        ('APP000002', 2, 3, 2, 500000, 'pending', 'medium', 'Personal loan for business expansion'),
        ('APP000003', 3, 4, 3, 800000, 'approved', 'low', 'Car loan for vehicle purchase')
        ON CONFLICT (application_number) DO NOTHING;
    END IF;
END $$;

-- =============================================================================
-- 11. INSERT SAMPLE DOCUMENTS (if documents table exists)
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        INSERT INTO documents (case_id, document_type_id, file_name, file_path, file_size, file_type, status, uploaded_at, verified_at, reviewed_by) VALUES
        (1, 1, 'pan_card.pdf', '/documents/case_1/pan_card.pdf', 1024000, 'pdf', 'verified', NOW(), NOW(), 2),
        (1, 2, 'aadhaar_card.pdf', '/documents/case_1/aadhaar_card.pdf', 2048000, 'pdf', 'verified', NOW(), NOW(), 2),
        (2, 1, 'pan_card_2.pdf', '/documents/case_2/pan_card_2.pdf', 1024000, 'pdf', 'pending', NOW(), NULL, NULL)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =============================================================================
-- 12. INSERT SAMPLE TASKS (if tasks table exists)
-- =============================================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        INSERT INTO tasks (case_id, title, description, status, priority, assigned_to, created_by, due_date, completed_at, started_at) VALUES
        (1, 'Verify PAN Card', 'Verify the submitted PAN card document', 'completed', 'high', 2, 1, NOW() + INTERVAL '2 days', NOW(), NOW() - INTERVAL '1 day'),
        (1, 'Credit Score Check', 'Perform credit score verification', 'in-progress', 'high', 4, 1, NOW() + INTERVAL '3 days', NULL, NOW()),
        (2, 'Document Collection', 'Collect all required documents from customer', 'pending', 'medium', 3, 1, NOW() + INTERVAL '5 days', NULL, NULL)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =============================================================================
-- 13. INSERT ORGANIZATION SETTINGS
-- =============================================================================

INSERT INTO organization_settings (organization_id, key, value, description, category, is_encrypted) VALUES
(1, 'company_name', 'Veriphy Bank', 'Organization name', 'general', false),
(1, 'company_address', '123 Financial Street, Mumbai, India', 'Organization address', 'general', false),
(1, 'max_loan_amount', '10000000', 'Maximum loan amount allowed', 'loans', false),
(1, 'interest_rate_base', '8.5', 'Base interest rate percentage', 'loans', false),
(1, 'working_hours_start', '09:00', 'Working hours start time', 'operations', false),
(1, 'working_hours_end', '18:00', 'Working hours end time', 'operations', false)
ON CONFLICT (organization_id, key) DO NOTHING;

-- =============================================================================
-- 14. VERIFICATION QUERIES
-- =============================================================================

-- Check if tables were created successfully
SELECT 
    'system_settings' as table_name,
    COUNT(*) as record_count
FROM system_settings
UNION ALL
SELECT 
    'organization_settings' as table_name,
    COUNT(*) as record_count
FROM organization_settings;

-- Show sample system settings
SELECT key, value, description, category 
FROM system_settings 
ORDER BY category, key 
LIMIT 10;

-- Show sample organization settings
SELECT key, value, description, category 
FROM organization_settings 
WHERE organization_id = 1
ORDER BY category, key 
LIMIT 10;

-- =============================================================================
-- 15. SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 Database setup completed successfully!';
    RAISE NOTICE '✅ System settings table created and populated';
    RAISE NOTICE '✅ Organization settings table created and populated';
    RAISE NOTICE '✅ Sample data inserted for all available tables';
    RAISE NOTICE '✅ Row Level Security policies configured';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Refresh your application';
    RAISE NOTICE '   2. Check that the system settings page loads without errors';
    RAISE NOTICE '   3. Verify that all data is visible in the admin interface';
END $$;
