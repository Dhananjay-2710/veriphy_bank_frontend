-- Veriphy Bank SaaS Platform
-- Initial data insertion for multi-tenant system

-- Insert subscription plans
INSERT INTO subscription_plans (name, plan_type, description, price_monthly, price_yearly, max_users, max_loans_per_month, features) VALUES
('Trial', 'trial', '14-day free trial with limited features', 0.00, 0.00, 5, 10, '{"whatsapp_integration": true, "basic_workflow": true, "document_management": true, "basic_reporting": true}'),
('Basic', 'basic', 'Perfect for small banks and credit unions', 99.00, 990.00, 25, 100, '{"whatsapp_integration": true, "advanced_workflow": true, "document_management": true, "basic_reporting": true, "email_support": true}'),
('Professional', 'professional', 'Ideal for mid-size financial institutions', 299.00, 2990.00, 100, 500, '{"whatsapp_integration": true, "advanced_workflow": true, "document_management": true, "advanced_reporting": true, "priority_support": true, "api_access": true, "custom_workflows": true}'),
('Enterprise', 'enterprise', 'For large banks with complex requirements', 999.00, 9990.00, 1000, 5000, '{"whatsapp_integration": true, "advanced_workflow": true, "document_management": true, "advanced_reporting": true, "dedicated_support": true, "api_access": true, "custom_workflows": true, "white_label": true, "sso": true, "audit_logs": true}');

-- Insert system settings
INSERT INTO system_settings (key, value, description, category) VALUES
('app_name', 'Veriphy Bank', 'Application name', 'general'),
('app_version', '2.0.0', 'Application version', 'general'),
('max_login_attempts', '5', 'Maximum login attempts before account lockout', 'security'),
('session_timeout_minutes', '480', 'Session timeout in minutes (8 hours)', 'security'),
('password_min_length', '8', 'Minimum password length', 'security'),
('password_require_special', 'true', 'Require special characters in password', 'security'),
('whatsapp_api_url', 'https://graph.facebook.com/v17.0', 'WhatsApp Business API URL', 'integrations'),
('whatsapp_webhook_verify_token', 'veriphy_webhook_token', 'WhatsApp webhook verification token', 'integrations'),
('file_upload_max_size', '10485760', 'Maximum file upload size in bytes (10MB)', 'files'),
('allowed_file_types', 'pdf,jpg,jpeg,png,doc,docx', 'Allowed file types for document uploads', 'files'),
('audit_log_retention_days', '2555', 'Audit log retention period in days (7 years)', 'compliance'),
('document_encryption_enabled', 'true', 'Document encryption enabled', 'security'),
('two_factor_auth_enabled', 'true', 'Two-factor authentication enabled', 'security'),
('maintenance_mode', 'false', 'System maintenance mode', 'general'),
('default_currency', 'INR', 'Default currency for the system', 'general'),
('timezone', 'Asia/Kolkata', 'Default timezone', 'general');

-- Create default super admin user
INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active) VALUES
('admin@veriphy.com', crypt('admin123', gen_salt('bf')), 'Super', 'Admin', '+91-9999999999', true);

-- Create sample organizations
INSERT INTO organizations (name, slug, domain, description, status, subscription_plan, max_users, max_loans_per_month, features) VALUES
('Veriphy Demo Bank', 'veriphy-demo', 'demo.veriphy.com', 'Demo organization for testing', 'active', 'enterprise', 1000, 5000, '{"whatsapp_integration": true, "advanced_workflow": true, "document_management": true, "advanced_reporting": true, "api_access": true}'),
('Sample Credit Union', 'sample-credit', 'sample.veriphy.com', 'Sample credit union for demonstration', 'trial', 'trial', 5, 10, '{"whatsapp_integration": true, "basic_workflow": true, "document_management": true}');

-- Create departments for demo organization
INSERT INTO departments (organization_id, name, type, description) VALUES
(1, 'Sales Department', 'sales', 'Handles customer acquisition and initial loan processing'),
(1, 'Credit Department', 'credit', 'Responsible for credit analysis and loan approval'),
(1, 'Compliance Department', 'compliance', 'Ensures regulatory compliance and risk management'),
(1, 'Operations Department', 'operations', 'Handles day-to-day operations and support'),
(1, 'Admin Department', 'admin', 'System administration and user management');

-- Create departments for sample credit union
INSERT INTO departments (organization_id, name, type, description) VALUES
(2, 'Sales Team', 'sales', 'Customer acquisition team'),
(2, 'Credit Team', 'credit', 'Credit analysis team');

-- Create sample users for demo organization
INSERT INTO users (email, password_hash, first_name, last_name, phone, is_active) VALUES
('suresh.krishnamurthy@veriphy-demo.com', crypt('demo123', gen_salt('bf')), 'Suresh', 'Krishnamurthy', '+91-9876543210', true),
('priya.sharma@veriphy-demo.com', crypt('demo123', gen_salt('bf')), 'Priya', 'Sharma', '+91-9876543211', true),
('rajesh.kumar@veriphy-demo.com', crypt('demo123', gen_salt('bf')), 'Rajesh', 'Kumar', '+91-9876543212', true),
('anita.patel@veriphy-demo.com', crypt('demo123', gen_salt('bf')), 'Anita', 'Patel', '+91-9876543213', true),
('michael.chen@veriphy-demo.com', crypt('demo123', gen_salt('bf')), 'Michael', 'Chen', '+91-9876543214', true);

-- Assign users to organizations and departments
INSERT INTO organization_members (user_id, organization_id, department_id, role, permissions) VALUES
-- Super admin
(1, 1, 1, 'super_admin', '{"all_permissions": true}'),

-- Demo organization members
(2, 1, 1, 'org_admin', '{"manage_users": true, "manage_settings": true, "view_reports": true}'),
(3, 1, 1, 'sales_manager', '{"manage_sales_team": true, "view_sales_reports": true, "approve_loans": false}'),
(4, 1, 1, 'sales_agent', '{"create_loans": true, "manage_customers": true, "upload_documents": true}'),
(5, 1, 2, 'credit_manager', '{"manage_credit_team": true, "approve_loans": true, "view_credit_reports": true}'),
(6, 1, 2, 'credit_analyst', '{"analyze_loans": true, "verify_documents": true, "recommend_approval": true}');

-- Create loan products for demo organization
INSERT INTO loan_products (organization_id, name, description, product_code, min_amount, max_amount, interest_rate, tenure_months, processing_fee, required_documents, eligibility_criteria) VALUES
(1, 'Personal Loan', 'Unsecured personal loan for various purposes', 'PL001', 50000, 2000000, 12.00, 60, 2000, '["aadhaar_card", "pan_card", "bank_statements", "salary_slips"]', '{"min_age": 21, "max_age": 65, "min_income": 25000, "employment_type": ["salaried", "self_employed"]}'),
(1, 'Home Loan', 'Home loan for property purchase', 'HL001', 500000, 50000000, 8.50, 360, 10000, '["aadhaar_card", "pan_card", "bank_statements", "salary_slips", "property_documents", "noc_from_builder"]', '{"min_age": 21, "max_age": 65, "min_income": 50000, "employment_type": ["salaried", "self_employed"]}'),
(1, 'Business Loan', 'Working capital and business expansion loan', 'BL001', 100000, 10000000, 10.50, 120, 5000, '["aadhaar_card", "pan_card", "bank_statements", "gst_registration", "itr_returns", "business_registration"]', '{"min_age": 21, "max_age": 65, "min_income": 100000, "employment_type": ["self_employed"]}'),
(1, 'Car Loan', 'Vehicle loan for car purchase', 'CL001', 100000, 5000000, 9.00, 84, 3000, '["aadhaar_card", "pan_card", "bank_statements", "salary_slips", "driving_license"]', '{"min_age": 21, "max_age": 65, "min_income": 30000, "employment_type": ["salaried", "self_employed"]}');

-- Create document types for demo organization
INSERT INTO document_types (organization_id, name, category, description, is_required, priority, file_types, max_file_size, validity_days) VALUES
-- Identity documents
(1, 'Aadhaar Card', 'identity', 'Government issued Aadhaar card', true, 'high', '{"pdf", "jpg", "jpeg", "png"}', 5242880, 365),
(1, 'PAN Card', 'identity', 'Permanent Account Number card', true, 'high', '{"pdf", "jpg", "jpeg", "png"}', 5242880, 365),
(1, 'Passport', 'identity', 'Valid passport', false, 'medium', '{"pdf", "jpg", "jpeg", "png"}', 5242880, 365),
(1, 'Driving License', 'identity', 'Valid driving license', false, 'medium', '{"pdf", "jpg", "jpeg", "png"}', 5242880, 365),

-- Financial documents
(1, 'Bank Statements', 'financial', 'Last 6 months bank statements', true, 'high', '{"pdf", "jpg", "jpeg", "png"}', 10485760, 90),
(1, 'Salary Slips', 'financial', 'Last 3 months salary slips', true, 'high', '{"pdf", "jpg", "jpeg", "png"}', 5242880, 90),
(1, 'Form 16', 'financial', 'Income tax form 16', true, 'high', '{"pdf"}', 5242880, 365),
(1, 'ITR Returns', 'financial', 'Income tax returns for last 2 years', true, 'high', '{"pdf"}', 10485760, 365),

-- Business documents
(1, 'GST Registration', 'business', 'GST registration certificate', true, 'high', '{"pdf", "jpg", "jpeg", "png"}', 5242880, 365),
(1, 'GST Returns', 'business', 'Last 12 months GST returns', true, 'high', '{"pdf"}', 10485760, 90),
(1, 'Business Registration', 'business', 'Business registration certificate', true, 'high', '{"pdf", "jpg", "jpeg", "png"}', 5242880, 365),
(1, 'Partnership Deed', 'business', 'Partnership deed or MOA', false, 'medium', '{"pdf"}', 10485760, 365),

-- Property documents
(1, 'Property Documents', 'property', 'Property registration and sale deed', true, 'high', '{"pdf", "jpg", "jpeg", "png"}', 10485760, 365),
(1, 'Property Valuation', 'property', 'Property valuation report', true, 'high', '{"pdf"}', 10485760, 90),
(1, 'NOC from Builder', 'property', 'No Objection Certificate from builder', false, 'medium', '{"pdf", "jpg", "jpeg", "png"}', 5242880, 90),

-- Other documents
(1, 'Photograph', 'other', 'Recent passport size photograph', true, 'high', '{"jpg", "jpeg", "png"}', 2097152, 365),
(1, 'Signature Specimen', 'other', 'Signature specimen', true, 'high', '{"jpg", "jpeg", "png"}', 2097152, 365),
(1, 'Address Proof', 'other', 'Utility bill or rent agreement', true, 'high', '{"pdf", "jpg", "jpeg", "png"}', 5242880, 90);

-- Create workflow stages for demo organization
INSERT INTO workflow_stages (organization_id, name, stage_key, description, department_type, order_index) VALUES
(1, 'Application Draft', 'draft', 'Initial loan application creation', 'sales', 1),
(1, 'Application Submitted', 'submitted', 'Application submitted for review', 'sales', 2),
(1, 'Under Review', 'under_review', 'Application under initial review', 'credit', 3),
(1, 'Document Collection', 'document_collection', 'Collecting required documents from customer', 'sales', 4),
(1, 'Credit Analysis', 'credit_analysis', 'Credit analysis and risk assessment', 'credit', 5),
(1, 'Approval Pending', 'approval_pending', 'Waiting for final approval', 'credit', 6),
(1, 'Approved', 'approved', 'Loan approved and ready for disbursement', 'credit', 7),
(1, 'Disbursed', 'disbursed', 'Loan amount disbursed to customer', 'operations', 8),
(1, 'Rejected', 'rejected', 'Loan application rejected', 'credit', 9),
(1, 'Closed', 'closed', 'Loan case closed', 'operations', 10);

-- Create workflow transitions for demo organization
INSERT INTO workflow_transitions (organization_id, from_stage_id, to_stage_id, name, conditions, actions) VALUES
(1, 1, 2, 'Submit Application', '{"required_fields": ["customer_id", "loan_product_id", "requested_amount"]}', '["send_notification", "assign_credit_analyst"]'),
(1, 2, 3, 'Start Review', '{}', '["send_notification"]'),
(1, 3, 4, 'Request Documents', '{}', '["send_whatsapp_message", "create_document_checklist"]'),
(1, 4, 5, 'Documents Complete', '{"all_required_documents_uploaded": true}', '["send_notification"]'),
(1, 5, 6, 'Analysis Complete', '{"credit_score_checked": true, "income_verified": true}', '["send_notification"]'),
(1, 6, 7, 'Approve Loan', '{"approval_authority": true}', '["send_approval_notification", "create_loan_agreement"]'),
(1, 6, 9, 'Reject Loan', '{"rejection_reason": "required"}', '["send_rejection_notification"]'),
(1, 7, 8, 'Disburse Loan', '{"disbursement_authority": true}', '["process_disbursement", "send_disbursement_notification"]'),
(1, 8, 10, 'Close Loan', '{}', '["archive_documents", "send_completion_notification"]');

-- Create WhatsApp templates for demo organization
INSERT INTO whatsapp_templates (organization_id, name, template_id, category, language, content, variables) VALUES
(1, 'Document Request', 'doc_request_001', 'UTILITY', 'en', 'Hello {{customer_name}}, we need the following documents for your loan application {{application_number}}: {{document_list}}. Please upload them via WhatsApp.', '["customer_name", "application_number", "document_list"]'),
(1, 'Document Received', 'doc_received_001', 'UTILITY', 'en', 'Thank you {{customer_name}}! We have received your document: {{document_name}}. We will review it shortly.', '["customer_name", "document_name"]'),
(1, 'Application Approved', 'app_approved_001', 'UTILITY', 'en', 'Congratulations {{customer_name}}! Your loan application {{application_number}} has been approved for ₹{{approved_amount}}. We will contact you soon for disbursement.', '["customer_name", "application_number", "approved_amount"]'),
(1, 'Application Rejected', 'app_rejected_001', 'UTILITY', 'en', 'Dear {{customer_name}}, unfortunately your loan application {{application_number}} has been rejected. Reason: {{rejection_reason}}. Please contact us for more information.', '["customer_name", "application_number", "rejection_reason"]'),
(1, 'Payment Reminder', 'payment_reminder_001', 'UTILITY', 'en', 'Hello {{customer_name}}, this is a reminder that your loan payment of ₹{{amount}} is due on {{due_date}}. Please make the payment to avoid late fees.', '["customer_name", "amount", "due_date"]');

-- Create sample customers for demo organization
INSERT INTO customers (organization_id, customer_number, first_name, last_name, email, phone, date_of_birth, gender, marital_status, employment_type, monthly_income, address, assigned_sales_agent) VALUES
(1, 'CUST001', 'Ramesh', 'Gupta', 'ramesh.gupta@email.com', '+91-9876543210', '1985-03-15', 'male', 'married', 'self_employed', 150000, '{"street": "123 MG Road", "city": "Mumbai", "state": "Maharashtra", "pincode": "400001"}', 4),
(1, 'CUST002', 'Priya', 'Sharma', 'priya.sharma@email.com', '+91-9876543211', '1990-07-22', 'female', 'single', 'salaried', 75000, '{"street": "456 Park Street", "city": "Delhi", "state": "Delhi", "pincode": "110001"}', 4),
(1, 'CUST003', 'Amit', 'Kumar', 'amit.kumar@email.com', '+91-9876543212', '1988-11-08', 'male', 'married', 'salaried', 120000, '{"street": "789 Brigade Road", "city": "Bangalore", "state": "Karnataka", "pincode": "560001"}', 4);

-- Create sample loan applications
INSERT INTO loan_applications (organization_id, application_number, customer_id, loan_product_id, requested_amount, requested_tenure, purpose, status, assigned_sales_agent, assigned_credit_analyst, current_stage) VALUES
(1, 'APP001', 1, 2, 5000000, 240, 'Home purchase in Mumbai', 'document_collection', 4, 6, 'document_collection'),
(1, 'APP002', 2, 1, 500000, 36, 'Personal expenses and travel', 'credit_analysis', 4, 6, 'credit_analysis'),
(1, 'APP003', 3, 3, 2000000, 60, 'Business expansion and working capital', 'under_review', 4, 6, 'under_review');

-- Create sample documents
INSERT INTO documents (organization_id, loan_application_id, document_type_id, file_name, file_path, file_size, file_type, mime_type, status, uploaded_at, metadata) VALUES
(1, 1, 1, 'aadhaar_ramesh_gupta.pdf', '/documents/org_1/app_1/aadhaar_ramesh_gupta.pdf', 1024000, 'pdf', 'application/pdf', 'verified', CURRENT_TIMESTAMP - INTERVAL '2 days', '{"verified_by": 6, "verification_method": "manual"}'),
(1, 1, 2, 'pan_ramesh_gupta.pdf', '/documents/org_1/app_1/pan_ramesh_gupta.pdf', 512000, 'pdf', 'application/pdf', 'verified', CURRENT_TIMESTAMP - INTERVAL '2 days', '{"verified_by": 6, "verification_method": "manual"}'),
(1, 1, 5, 'bank_statements_ramesh_gupta.pdf', '/documents/org_1/app_1/bank_statements_ramesh_gupta.pdf', 2048000, 'pdf', 'application/pdf', 'uploaded', CURRENT_TIMESTAMP - INTERVAL '1 day', '{"pages": 12}'),
(1, 2, 1, 'aadhaar_priya_sharma.pdf', '/documents/org_1/app_2/aadhaar_priya_sharma.pdf', 1024000, 'pdf', 'application/pdf', 'verified', CURRENT_TIMESTAMP - INTERVAL '3 days', '{"verified_by": 6, "verification_method": "manual"}'),
(1, 2, 2, 'pan_priya_sharma.pdf', '/documents/org_1/app_2/pan_priya_sharma.pdf', 512000, 'pdf', 'application/pdf', 'verified', CURRENT_TIMESTAMP - INTERVAL '3 days', '{"verified_by": 6, "verification_method": "manual"}');

-- Create sample WhatsApp conversations
INSERT INTO whatsapp_conversations (organization_id, loan_application_id, customer_phone, whatsapp_id, status, last_message_at) VALUES
(1, 1, '+91-9876543210', 'whatsapp_ramesh_gupta_001', 'active', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(1, 2, '+91-9876543211', 'whatsapp_priya_sharma_001', 'active', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(1, 3, '+91-9876543212', 'whatsapp_amit_kumar_001', 'active', CURRENT_TIMESTAMP - INTERVAL '30 minutes');

-- Create sample WhatsApp messages
INSERT INTO whatsapp_messages (organization_id, conversation_id, message_id, type, content, sender, direction, timestamp) VALUES
(1, 1, 'msg_001', 'text', 'Hello Ramesh! Welcome to Veriphy Bank. We have received your home loan application APP001. We need some documents from you.', 'agent', 'outbound', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 1, 'msg_002', 'text', 'Please upload your Aadhaar card, PAN card, and bank statements for the last 6 months.', 'agent', 'outbound', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(1, 1, 'msg_003', 'document', 'Aadhaar card uploaded', 'customer', 'inbound', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1, 1, 'msg_004', 'document', 'PAN card uploaded', 'customer', 'inbound', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(1, 1, 'msg_005', 'text', 'Thank you! We have received your documents. We will review them and get back to you soon.', 'agent', 'outbound', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(1, 2, 'msg_006', 'text', 'Hello Priya! Your personal loan application APP002 is under review. We will update you soon.', 'agent', 'outbound', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(1, 2, 'msg_007', 'text', 'Great! When can I expect the approval?', 'customer', 'inbound', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(1, 2, 'msg_008', 'text', 'We are completing the credit analysis. You should hear from us within 24 hours.', 'agent', 'outbound', CURRENT_TIMESTAMP - INTERVAL '2 hours');

-- Create sample workflow history
INSERT INTO workflow_history (organization_id, loan_application_id, from_stage_id, to_stage_id, transition_id, user_id, action, comments, metadata) VALUES
(1, 1, 1, 2, 1, 4, 'Submit Application', 'Application submitted for review', '{"submitted_via": "web_portal"}'),
(1, 1, 2, 3, 2, 6, 'Start Review', 'Started initial review of application', '{}'),
(1, 1, 3, 4, 3, 6, 'Request Documents', 'Requested documents from customer via WhatsApp', '{"whatsapp_message_sent": true}'),
(1, 2, 1, 2, 1, 4, 'Submit Application', 'Application submitted for review', '{"submitted_via": "web_portal"}'),
(1, 2, 2, 3, 2, 6, 'Start Review', 'Started initial review of application', '{}'),
(1, 2, 3, 5, 4, 6, 'Documents Complete', 'All required documents received and verified', '{"documents_verified": true}'),
(1, 3, 1, 2, 1, 4, 'Submit Application', 'Application submitted for review', '{"submitted_via": "mobile_app"}'),
(1, 3, 2, 3, 2, 6, 'Start Review', 'Started initial review of application', '{}');

-- Create sample notifications
INSERT INTO notifications (organization_id, user_id, type, title, message, data, is_read) VALUES
(1, 4, 'loan_assigned', 'New Loan Application Assigned', 'You have been assigned a new loan application APP003', '{"application_id": 3, "customer_name": "Amit Kumar"}', false),
(1, 6, 'document_uploaded', 'Document Uploaded', 'New document uploaded for application APP001', '{"application_id": 1, "document_name": "Bank Statements"}', false),
(1, 3, 'workflow_update', 'Workflow Status Changed', 'Application APP002 moved to Credit Analysis stage', '{"application_id": 2, "new_stage": "credit_analysis"}', false);

-- Create organization settings for demo organization
INSERT INTO organization_settings (organization_id, key, value, description) VALUES
(1, 'whatsapp_business_number', '+91-9876543210', 'WhatsApp Business API phone number'),
(1, 'whatsapp_access_token', 'encrypted_token_here', 'WhatsApp Business API access token'),
(1, 'email_from_address', 'noreply@veriphy-demo.com', 'Default email sender address'),
(1, 'email_from_name', 'Veriphy Demo Bank', 'Default email sender name'),
(1, 'working_hours', '{"start": "09:00", "end": "18:00", "timezone": "Asia/Kolkata"}', 'Organization working hours'),
(1, 'auto_assign_credit_analyst', 'true', 'Automatically assign credit analyst to new applications'),
(1, 'document_verification_required', 'true', 'Require manual verification of uploaded documents'),
(1, 'loan_approval_threshold', '5000000', 'Maximum loan amount that can be approved by credit analyst'),
(1, 'notification_preferences', '{"email": true, "whatsapp": true, "sms": false}', 'Default notification preferences');
