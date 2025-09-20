-- =============================================================================
-- SYSTEM SETTINGS TABLES MIGRATION
-- =============================================================================
-- Migration: 007_create_system_settings_tables.sql
-- Description: Creates system_settings and organization_settings tables if they don't exist
-- Created: 2024-12-19
-- =============================================================================

-- =============================================================================
-- SYSTEM SETTINGS TABLE
-- =============================================================================
-- Global system settings table

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
-- Per-tenant organization settings table

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

-- System settings indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_created_at ON system_settings(created_at);

-- Organization settings indexes
CREATE INDEX IF NOT EXISTS idx_organization_settings_org_id ON organization_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_settings_key ON organization_settings(key);
CREATE INDEX IF NOT EXISTS idx_organization_settings_category ON organization_settings(category);
CREATE INDEX IF NOT EXISTS idx_organization_settings_org_key ON organization_settings(organization_id, key);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Update triggers for updated_at columns
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_settings_updated_at
    BEFORE UPDATE ON organization_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE system_settings IS 'Global system configuration settings';
COMMENT ON TABLE organization_settings IS 'Organization-specific configuration settings';

COMMENT ON COLUMN system_settings.key IS 'Unique setting key identifier';
COMMENT ON COLUMN system_settings.value IS 'Setting value (can be JSON for complex settings)';
COMMENT ON COLUMN system_settings.description IS 'Human-readable description of the setting';
COMMENT ON COLUMN system_settings.category IS 'Setting category for organization';
COMMENT ON COLUMN system_settings.is_encrypted IS 'Whether the setting value is encrypted';

COMMENT ON COLUMN organization_settings.organization_id IS 'Organization this setting belongs to';
COMMENT ON COLUMN organization_settings.key IS 'Setting key (unique within organization)';
COMMENT ON COLUMN organization_settings.value IS 'Setting value (can be JSON for complex settings)';
COMMENT ON COLUMN organization_settings.description IS 'Human-readable description of the setting';
COMMENT ON COLUMN organization_settings.category IS 'Setting category for organization';
COMMENT ON COLUMN organization_settings.is_encrypted IS 'Whether the setting value is encrypted';
