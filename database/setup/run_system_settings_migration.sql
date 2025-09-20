-- =============================================================================
-- SYSTEM SETTINGS MIGRATION EXECUTION SCRIPT
-- =============================================================================
-- This script creates the system_settings and organization_settings tables
-- Execute this in your Supabase SQL Editor or via psql
-- =============================================================================

-- First, let's check if the tables already exist
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name IN ('system_settings', 'organization_settings')
AND table_schema = 'public';

-- If the above query returns no rows, then run the migration below:

-- =============================================================================
-- SYSTEM SETTINGS TABLE
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
-- ORGANIZATION SETTINGS TABLE
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
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_created_at ON system_settings(created_at);

CREATE INDEX IF NOT EXISTS idx_organization_settings_org_id ON organization_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_settings_key ON organization_settings(key);
CREATE INDEX IF NOT EXISTS idx_organization_settings_category ON organization_settings(category);
CREATE INDEX IF NOT EXISTS idx_organization_settings_org_key ON organization_settings(organization_id, key);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

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
-- INITIAL DATA
-- =============================================================================

-- Insert default system settings
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
-- VERIFICATION
-- =============================================================================

-- Verify tables were created successfully
SELECT 
    'system_settings' as table_name,
    COUNT(*) as record_count
FROM system_settings
UNION ALL
SELECT 
    'organization_settings' as table_name,
    COUNT(*) as record_count
FROM organization_settings;

-- Show some sample system settings
SELECT key, value, description, category 
FROM system_settings 
ORDER BY category, key 
LIMIT 10;
