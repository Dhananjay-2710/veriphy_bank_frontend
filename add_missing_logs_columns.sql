-- =============================================================================
-- ADD MISSING COLUMNS TO LOGS TABLE
-- =============================================================================
-- This script adds the missing columns that the audit logs functionality expects

-- Step 1: Add missing columns to the logs table
ALTER TABLE logs 
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS log_type VARCHAR(20) DEFAULT 'info';

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_logs_ip_address ON logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_logs_log_type ON logs(log_type);
CREATE INDEX IF NOT EXISTS idx_logs_user_agent ON logs USING gin(to_tsvector('english', user_agent));

-- Step 3: Update existing records to have default values
UPDATE logs 
SET 
  log_type = 'info',
  ip_address = '127.0.0.1'::INET,
  user_agent = 'System'
WHERE log_type IS NULL OR ip_address IS NULL OR user_agent IS NULL;

-- =============================================================================
-- POPULATE WITH SAMPLE AUDIT LOG DATA
-- =============================================================================

-- Clear existing logs and insert comprehensive sample data
TRUNCATE TABLE logs RESTART IDENTITY CASCADE;

-- Insert sample audit logs with realistic data
INSERT INTO logs (
  organization_id, user_id, action, entity_type, entity_id, 
  description, log_type, metadata, ip_address, user_agent, 
  created_at, updated_at
) VALUES 

-- Super Admin Activities
(1, 1, 'login', 'user', 1, 'Super admin logged into the system', 'info', 
 '{"session_id": "sess_001", "login_method": "password"}', 
 '192.168.1.100'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),

(1, 1, 'create', 'organization', 2, 'Created new organization: Tech Solutions Ltd', 'success', 
 '{"old_values": null, "new_values": {"name": "Tech Solutions Ltd", "code": "TSL"}}', 
 '192.168.1.100'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 NOW() - INTERVAL '1 hour 50 minutes', NOW() - INTERVAL '1 hour 50 minutes'),

(1, 1, 'view', 'dashboard', null, 'Accessed super admin dashboard', 'info', 
 '{"page": "super_admin_dashboard", "duration": 15000}', 
 '192.168.1.100'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour 30 minutes'),

-- Manager Activities
(1, 2, 'login', 'user', 2, 'Manager logged into the system', 'info', 
 '{"session_id": "sess_002", "login_method": "password"}', 
 '192.168.1.101'::INET, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 
 NOW() - INTERVAL '1 hour 20 minutes', NOW() - INTERVAL '1 hour 20 minutes'),

(1, 2, 'create', 'case', 1, 'Created new loan application for customer ID 1', 'success', 
 '{"old_values": null, "new_values": {"status": "open", "loan_amount": 500000, "customer_id": 1}}', 
 '192.168.1.101'::INET, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 
 NOW() - INTERVAL '1 hour 10 minutes', NOW() - INTERVAL '1 hour 10 minutes'),

(1, 2, 'update', 'case', 1, 'Updated case status from open to in_progress', 'info', 
 '{"old_values": {"status": "open"}, "new_values": {"status": "in_progress", "assigned_to": 4}}', 
 '192.168.1.101'::INET, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 
 NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),

-- Salesperson Activities
(1, 4, 'login', 'user', 4, 'Salesperson logged into the system', 'info', 
 '{"session_id": "sess_004", "login_method": "password"}', 
 '192.168.1.103'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0', 
 NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '50 minutes'),

(1, 4, 'create', 'customer', 1, 'Added new customer: Rajesh Kumar', 'success', 
 '{"old_values": null, "new_values": {"full_name": "Rajesh Kumar", "email": "rajesh@email.com", "kyc_status": "pending"}}', 
 '192.168.1.103'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0', 
 NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes'),

(1, 4, 'upload', 'document', 1, 'Uploaded PAN card for customer verification', 'info', 
 '{"old_values": null, "new_values": {"file_type": "PAN", "customer_id": 1, "status": "pending"}}', 
 '192.168.1.103'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0', 
 NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '40 minutes'),

-- Credit Ops Activities
(1, 5, 'login', 'user', 5, 'Credit Ops analyst logged in', 'info', 
 '{"session_id": "sess_005", "login_method": "password"}', 
 '192.168.1.104'::INET, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 
 NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '35 minutes'),

(1, 5, 'verify', 'document', 1, 'Verified PAN card document', 'success', 
 '{"old_values": {"status": "pending"}, "new_values": {"status": "verified", "verified_by": 5}}', 
 '192.168.1.104'::INET, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 
 NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),

(1, 5, 'update', 'case', 1, 'Updated credit assessment score', 'info', 
 '{"old_values": {"credit_score": null}, "new_values": {"credit_score": 750, "assessment_status": "completed"}}', 
 '192.168.1.104'::INET, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', 
 NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes'),

-- Compliance Activities
(1, 6, 'login', 'user', 6, 'Compliance officer logged in', 'info', 
 '{"session_id": "sess_006", "login_method": "password"}', 
 '192.168.1.105'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes'),

(1, 6, 'review', 'case', 1, 'Conducted compliance review for loan application', 'info', 
 '{"old_values": {"compliance_status": "pending"}, "new_values": {"compliance_status": "approved", "reviewed_by": 6}}', 
 '192.168.1.105'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),

-- Security Events
(1, null, 'failed_login', 'user', null, 'Failed login attempt from suspicious IP', 'warning', 
 '{"attempts": 3, "reason": "invalid_password", "blocked": false}', 
 '10.0.0.50'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes'),

(1, null, 'security_alert', 'system', null, 'Multiple failed login attempts detected', 'error', 
 '{"alert_type": "brute_force", "ip_address": "10.0.0.50", "action_taken": "temporary_block"}', 
 '10.0.0.50'::INET, 'Automated Security Scanner', 
 NOW() - INTERVAL '9 minutes', NOW() - INTERVAL '9 minutes'),

-- Admin Activities
(1, 3, 'login', 'user', 3, 'Admin logged into the system', 'info', 
 '{"session_id": "sess_003", "login_method": "password"}', 
 '192.168.1.102'::INET, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 
 NOW() - INTERVAL '8 minutes', NOW() - INTERVAL '8 minutes'),

(1, 3, 'approve', 'case', 1, 'Approved loan application after final review', 'success', 
 '{"old_values": {"status": "in_progress"}, "new_values": {"status": "approved", "approved_by": 3, "approval_amount": 500000}}', 
 '192.168.1.102'::INET, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 
 NOW() - INTERVAL '5 minutes', NOW() - INTERVAL '5 minutes'),

-- System Activities
(1, null, 'backup', 'system', null, 'Automated database backup completed', 'success', 
 '{"backup_size": "2.5GB", "backup_location": "/backups/db_backup_20250923.sql", "duration": 300000}', 
 '127.0.0.1'::INET, 'System Backup Service', 
 NOW() - INTERVAL '3 minutes', NOW() - INTERVAL '3 minutes'),

-- Recent Activities
(1, 4, 'create', 'case', 2, 'Created new personal loan application', 'success', 
 '{"old_values": null, "new_values": {"status": "open", "loan_amount": 200000, "customer_id": 2, "loan_type": "personal"}}', 
 '192.168.1.103'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0', 
 NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '2 minutes'),

(1, 2, 'view', 'analytics', null, 'Accessed monthly performance analytics', 'info', 
 '{"page": "analytics_dashboard", "filters": {"month": "2025-09", "department": "sales"}}', 
 '192.168.1.101'::INET, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', 
 NOW() - INTERVAL '1 minute', NOW() - INTERVAL '1 minute'),

(1, 1, 'export', 'report', null, 'Exported system audit report', 'info', 
 '{"report_type": "audit_summary", "date_range": "2025-09-01 to 2025-09-23", "format": "PDF"}', 
 '192.168.1.100'::INET, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
 NOW() - INTERVAL '30 seconds', NOW() - INTERVAL '30 seconds');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify the structure was updated correctly
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'logs'
ORDER BY ordinal_position;

-- Verify sample data was inserted
SELECT 
    COUNT(*) as total_logs,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT entity_type) as entity_types,
    COUNT(DISTINCT log_type) as log_types
FROM logs;

-- Show sample of the data
SELECT 
    l.id,
    u.full_name as user_name,
    l.action,
    l.entity_type,
    l.description,
    l.log_type,
    l.ip_address,
    l.created_at
FROM logs l
LEFT JOIN users u ON l.user_id = u.id
ORDER BY l.created_at DESC
LIMIT 10;
