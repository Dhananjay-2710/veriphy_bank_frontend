-- Fix missing system_settings table
-- This script creates the system_settings table and inserts default data

-- Create system_settings table if it doesn't exist
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_active ON system_settings(is_active);

-- Insert default system settings (only if they don't exist)
INSERT INTO system_settings (key, value, description, category) VALUES
('app_name', 'Veriphy Bank', 'Application name', 'general'),
('app_version', '1.0.0', 'Application version', 'general'),
('max_login_attempts', '5', 'Maximum login attempts before account lockout', 'security'),
('session_timeout_minutes', '30', 'Session timeout in minutes', 'security'),
('password_min_length', '8', 'Minimum password length', 'security'),
('password_require_special', 'true', 'Require special characters in password', 'security'),
('kyc_verification_required', 'true', 'KYC verification required for new accounts', 'security'),
('transaction_limit_daily', '100000', 'Daily transaction limit in INR', 'business'),
('transaction_limit_monthly', '1000000', 'Monthly transaction limit in INR', 'business'),
('whatsapp_enabled', 'true', 'WhatsApp integration enabled', 'integration'),
('audit_log_retention_days', '2555', 'Audit log retention period in days', 'system'),
('document_encryption_enabled', 'true', 'Document encryption enabled', 'security'),
('two_factor_auth_enabled', 'true', 'Two-factor authentication enabled', 'security'),
('maintenance_mode', 'false', 'System maintenance mode', 'system'),
('email_notifications_enabled', 'true', 'Email notifications enabled', 'notification'),
('sms_notifications_enabled', 'true', 'SMS notifications enabled', 'notification'),
('push_notifications_enabled', 'true', 'Push notifications enabled', 'notification'),
('auto_logout_minutes', '60', 'Auto logout timeout in minutes', 'security'),
('password_reset_expiry_hours', '24', 'Password reset link expiry in hours', 'security'),
('file_upload_max_size_mb', '10', 'Maximum file upload size in MB', 'system'),
('supported_file_types', 'pdf,jpg,jpeg,png,doc,docx', 'Supported file types for uploads', 'system')
ON CONFLICT (key) DO NOTHING;

-- Update the updated_at timestamp
UPDATE system_settings SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Grant necessary permissions (adjust as needed for your Supabase setup)
-- These might not be necessary depending on your Supabase configuration
-- GRANT SELECT, INSERT, UPDATE, DELETE ON system_settings TO authenticated;
-- GRANT USAGE ON SEQUENCE system_settings_id_seq TO authenticated;

-- Verify the table was created and data was inserted
SELECT 'system_settings table created successfully' as status;
SELECT COUNT(*) as total_settings FROM system_settings;
SELECT key, value, category FROM system_settings ORDER BY category, key;
