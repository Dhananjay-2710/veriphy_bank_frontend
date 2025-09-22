# 🚀 VERIPHY BANK - COMPREHENSIVE DATA POPULATION GUIDE

## 📋 STEP-BY-STEP EXECUTION PLAN

### **STEP 1: Access Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project: `ztdkreblmgscvdnzvzeh`
3. Navigate to **SQL Editor**

### **STEP 2: Execute the Main Population Script**

Copy and paste this SQL into the SQL Editor and execute:

```sql
-- =============================================================================
-- VERIPHY BANK - COMPREHENSIVE DATA POPULATION (EXECUTE THIS FIRST)
-- =============================================================================

-- 1. CREATE SYSTEM_SETTINGS TABLE
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

-- 2. INSERT SYSTEM SETTINGS
INSERT INTO system_settings (key, value, description, category) VALUES
('app_name', 'Veriphy Bank', 'Application name', 'general'),
('app_version', '1.0.0', 'Application version', 'general'),
('maintenance_mode', 'false', 'System maintenance mode', 'system'),
('max_login_attempts', '5', 'Maximum login attempts before lockout', 'security'),
('session_timeout_minutes', '60', 'Session timeout in minutes', 'security'),
('password_min_length', '8', 'Minimum password length', 'security'),
('password_require_special', 'true', 'Require special characters', 'security'),
('two_factor_auth_enabled', 'true', 'Two-factor authentication', 'security'),
('transaction_limit_daily', '100000', 'Daily transaction limit (INR)', 'business'),
('transaction_limit_monthly', '1000000', 'Monthly transaction limit (INR)', 'business'),
('kyc_verification_required', 'true', 'KYC verification required', 'business'),
('auto_approval_limit', '50000', 'Auto approval limit (INR)', 'business'),
('whatsapp_enabled', 'true', 'WhatsApp integration', 'integration'),
('email_notifications_enabled', 'true', 'Email notifications', 'notification'),
('sms_notifications_enabled', 'true', 'SMS notifications', 'notification'),
('file_upload_max_size_mb', '10', 'Maximum file upload size', 'file'),
('supported_file_types', 'pdf,jpg,jpeg,png,doc,docx', 'Supported file types', 'file'),
('audit_log_retention_days', '365', 'Audit log retention', 'system'),
('document_encryption_enabled', 'true', 'Document encryption', 'system'),
('backup_frequency_hours', '24', 'Backup frequency', 'system')
ON CONFLICT (key) DO NOTHING;

-- 3. UPDATE USERS TABLE STRUCTURE
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id BIGINT DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id BIGINT DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile VARCHAR(20);

-- Update existing users to have full_name
UPDATE users SET full_name = COALESCE(first_name || ' ' || last_name, email) WHERE full_name IS NULL;

-- 4. INSERT COMPREHENSIVE USER BASE
INSERT INTO users (email, password_hash, full_name, mobile, is_active, role, organization_id, department_id) VALUES
-- Super Admin
('superadmin@veriphy.com', crypt('admin123', gen_salt('bf')), 'Super Admin', '+91-9999999999', true, 'super_admin', 1, 1),

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

-- 5. UPDATE CUSTOMERS TABLE STRUCTURE
ALTER TABLE customers ADD COLUMN IF NOT EXISTS id BIGSERIAL PRIMARY KEY;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS full_name VARCHAR(200);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 6. INSERT CUSTOMER DATA
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

-- 7. INSERT CASE/LOAN APPLICATIONS
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
('CASE000015', 15, 4, 'personal_loan', 250000.00, 'new', 'medium', 'Personal loan for home renovation');

-- 8. INSERT NOTIFICATIONS
INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES
(2, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000001', false, NOW() - INTERVAL '1 hour'),
(3, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000002', false, NOW() - INTERVAL '2 hours'),
(4, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000003', false, NOW() - INTERVAL '3 hours'),
(5, 'case_assigned', 'New Case Assigned', 'You have been assigned a new case: CASE000004', false, NOW() - INTERVAL '4 hours'),
(7, 'document_verified', 'Document Verified', 'Document verification completed for Case CASE000001', true, NOW() - INTERVAL '5 hours'),
(8, 'case_approved', 'Case Approved', 'Case CASE000006 has been approved', true, NOW() - INTERVAL '6 hours'),
(9, 'case_rejected', 'Case Rejected', 'Case CASE000011 has been rejected - insufficient income', true, NOW() - INTERVAL '7 hours');

-- VERIFICATION
SELECT 'Data Population Complete' as status;
SELECT 'Users: ' || COUNT(*) as user_count FROM users;
SELECT 'Customers: ' || COUNT(*) as customer_count FROM customers;
SELECT 'Cases: ' || COUNT(*) as case_count FROM cases;
SELECT 'Notifications: ' || COUNT(*) as notification_count FROM notifications;
SELECT 'System Settings: ' || COUNT(*) as settings_count FROM system_settings;
```

### **STEP 3: Execute Additional Data (Optional)**

If you want more comprehensive data, run this second script:

```sql
-- =============================================================================
-- ADDITIONAL DATA POPULATION (RUN AFTER STEP 2)
-- =============================================================================

-- INSERT DOCUMENTS
INSERT INTO documents (case_id, document_type_id, file_name, file_path, file_size, file_type, status, uploaded_at, verified_at, reviewed_by, notes) VALUES
(1, 1, 'aadhaar_case1.pdf', '/documents/case1/aadhaar.pdf', 1024000, 'pdf', 'verified', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 7, 'Document verified successfully'),
(1, 2, 'pan_case1.pdf', '/documents/case1/pan.pdf', 512000, 'pdf', 'verified', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', 7, 'PAN card verified'),
(1, 7, 'salary_slip_case1.pdf', '/documents/case1/salary_slip.pdf', 768000, 'pdf', 'verified', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', 7, 'Salary slip verified'),
(2, 1, 'aadhaar_case2.pdf', '/documents/case2/aadhaar.pdf', 1024000, 'pdf', 'verified', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days', 8, 'Aadhaar verified'),
(2, 2, 'pan_case2.pdf', '/documents/case2/pan.pdf', 512000, 'pdf', 'verified', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days', 8, 'PAN verified'),
(2, 7, 'salary_slip_case2.pdf', '/documents/case2/salary_slip.pdf', 768000, 'pdf', 'verified', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days', 8, 'Salary documents verified'),
(2, 20, 'property_docs_case2.pdf', '/documents/case2/property.pdf', 2048000, 'pdf', 'verified', NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days', 8, 'Property documents verified');

-- INSERT WHATSAPP MESSAGES
INSERT INTO whatsapp_messages (case_id, message_type, content, sender, timestamp, created_at) VALUES
(1, 'outbound', 'Hello! Your loan application CASE000001 has been received and is under review. We will update you soon.', 'bank', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
(1, 'inbound', 'Thank you for the update. When can I expect the approval?', 'customer', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '20 hours'),
(1, 'outbound', 'Your application is being processed. We will inform you within 2-3 business days.', 'bank', NOW() - INTERVAL '19 hours', NOW() - INTERVAL '19 hours'),
(2, 'outbound', 'Your home loan application CASE000002 requires additional documents. Please upload your property papers.', 'bank', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
(2, 'inbound', 'I have uploaded the property documents. Please check.', 'customer', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- INSERT AUDIT LOGS
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, created_at) VALUES
(2, 'case_created', 'case', 1, NULL, '{"case_number": "CASE000001", "status": "new"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '1 day'),
(3, 'case_updated', 'case', 2, '{"status": "new"}', '{"status": "review"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '12 hours'),
(7, 'document_verified', 'document', 1, '{"status": "pending"}', '{"status": "verified"}', '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '6 hours'),
(8, 'case_approved', 'case', 6, '{"status": "review"}', '{"status": "approved"}', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', NOW() - INTERVAL '3 hours');

-- INSERT COMPLIANCE LOGS
INSERT INTO compliance_logs (case_id, action, user_id, details, log_type, created_at) VALUES
(1, 'kyc_verification', 7, 'Customer KYC documents verified successfully', 'success', NOW() - INTERVAL '3 days'),
(2, 'income_verification', 8, 'Customer income documents verified', 'success', NOW() - INTERVAL '2 days'),
(3, 'document_collection', 9, 'All required documents collected', 'info', NOW() - INTERVAL '1 day'),
(11, 'application_rejection', 8, 'Application rejected due to insufficient income verification', 'warning', NOW() - INTERVAL '5 hours'),
(6, 'final_approval', 8, 'Application approved after thorough review', 'success', NOW() - INTERVAL '6 hours');

-- FINAL VERIFICATION
SELECT 'Additional Data Population Complete' as status;
SELECT 'Documents: ' || COUNT(*) as document_count FROM documents;
SELECT 'WhatsApp Messages: ' || COUNT(*) as message_count FROM whatsapp_messages;
SELECT 'Audit Logs: ' || COUNT(*) as audit_count FROM audit_logs;
SELECT 'Compliance Logs: ' || COUNT(*) as compliance_count FROM compliance_logs;
```

### **STEP 4: Test the Application**

After running the SQL scripts:

1. **Refresh your application**
2. **Login with different users:**
   - Super Admin: `superadmin@veriphy.com` / `admin123`
   - Salesperson: `priya.sharma@veriphy.com` / `demo123`
   - Manager: `anita.reddy@veriphy.com` / `demo123`
   - Credit Ops: `meera.joshi@veriphy.com` / `demo123`
   - Admin: `arjun.singh@veriphy.com` / `demo123`

3. **Verify functionality:**
   - Dashboard loads with real data
   - Cases are visible and assigned
   - Notifications are working
   - User roles are properly displayed
   - System settings are accessible

### **🎯 EXPECTED RESULTS**

After successful execution, you should have:
- ✅ 15+ users across all roles
- ✅ 15 customers with realistic Indian data
- ✅ 15 loan applications/cases in various states
- ✅ 20+ system settings
- ✅ Notifications for different users
- ✅ Document records
- ✅ WhatsApp messages
- ✅ Audit and compliance logs
- ✅ No more "table not found" errors

### **🚨 TROUBLESHOOTING**

If you encounter issues:
1. **Check Supabase Dashboard** → Table Editor to verify data
2. **Check browser console** for any remaining errors
3. **Verify user permissions** in Supabase
4. **Check RLS policies** if data is not accessible

---

**🎉 SUCCESS! Your Veriphy Bank application should now have a fully functional demo environment with realistic data for all user roles!**
