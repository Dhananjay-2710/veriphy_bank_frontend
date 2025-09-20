-- =============================================================================
-- INSERT MOCK DATA INTO SUPABASE DATABASE
-- =============================================================================
-- This script inserts the mock data from src/data/mockData.ts into the actual Supabase schema
-- Execute this script in your Supabase SQL editor

-- Start transaction
BEGIN;

-- =============================================================================
-- 1. INSERT ORGANIZATION (Required for multi-tenant setup)
-- =============================================================================
INSERT INTO organizations (
    name, slug, description, status, subscription_plan, 
    max_users, max_loans_per_month, features
) VALUES (
    'Happy Bank', 'happy-bank', 'Sample bank for testing', 'active', 'professional',
    50, 1000, '{"whatsapp_integration": true, "advanced_analytics": true, "custom_workflows": true}'
) ON CONFLICT (slug) DO NOTHING;

-- Get organization ID for subsequent inserts
DO $$
DECLARE
    org_id BIGINT;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = 'happy-bank';
    
    -- =============================================================================
    -- 2. INSERT DEPARTMENTS
    -- =============================================================================
    INSERT INTO departments (organization_id, name, type, description) VALUES
    (org_id, 'Sales', 'sales', 'Sales and customer acquisition'),
    (org_id, 'Credit Operations', 'credit', 'Credit analysis and underwriting'),
    (org_id, 'Compliance', 'compliance', 'Compliance and risk management'),
    (org_id, 'Administration', 'admin', 'Administrative functions')
    ON CONFLICT (organization_id, name) DO NOTHING;

    -- =============================================================================
    -- 3. INSERT USERS (from mockUsers)
    -- =============================================================================
    INSERT INTO users (email, password_hash, first_name, last_name, phone, avatar_url, is_active) VALUES
    ('priya.sharma@happybank.in', crypt('password123', gen_salt('bf')), 'Priya', 'Sharma', '+91-9876543210', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', true),
    ('rajesh.kumar@happybank.in', crypt('password123', gen_salt('bf')), 'Rajesh', 'Kumar', '+91-9876543211', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', true),
    ('anita.patel@happybank.in', crypt('password123', gen_salt('bf')), 'Anita', 'Patel', '+91-9876543212', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', true),
    ('suresh.krishnamurthy@happybank.in', crypt('password123', gen_salt('bf')), 'Suresh', 'Krishnamurthy', '+91-9876543213', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', true),
    ('superadmin@veriphy.com', crypt('password123', gen_salt('bf')), 'Super', 'Admin', '+91-9876543214', NULL, true)
    ON CONFLICT (email) DO NOTHING;

    -- =============================================================================
    -- 4. INSERT ORGANIZATION MEMBERS (User-Organization relationships)
    -- =============================================================================
    INSERT INTO organization_members (user_id, organization_id, department_id, role, permissions) 
    SELECT 
        u.id, 
        org_id, 
        (SELECT id FROM departments WHERE organization_id = org_id AND name = 'Sales' LIMIT 1),
        'sales_agent',
        '{"can_create_cases": true, "can_view_cases": true, "can_update_cases": true}'
    FROM users u WHERE u.email = 'priya.sharma@happybank.in'
    ON CONFLICT (user_id, organization_id) DO NOTHING;

    INSERT INTO organization_members (user_id, organization_id, department_id, role, permissions) 
    SELECT 
        u.id, 
        org_id, 
        (SELECT id FROM departments WHERE organization_id = org_id AND name = 'Sales' LIMIT 1),
        'sales_manager',
        '{"can_create_cases": true, "can_view_cases": true, "can_update_cases": true, "can_manage_team": true}'
    FROM users u WHERE u.email = 'rajesh.kumar@happybank.in'
    ON CONFLICT (user_id, organization_id) DO NOTHING;

    INSERT INTO organization_members (user_id, organization_id, department_id, role, permissions) 
    SELECT 
        u.id, 
        org_id, 
        (SELECT id FROM departments WHERE organization_id = org_id AND name = 'Credit Operations' LIMIT 1),
        'credit_analyst',
        '{"can_approve_cases": true, "can_view_cases": true, "can_analyze_credit": true}'
    FROM users u WHERE u.email = 'anita.patel@happybank.in'
    ON CONFLICT (user_id, organization_id) DO NOTHING;

    INSERT INTO organization_members (user_id, organization_id, department_id, role, permissions) 
    SELECT 
        u.id, 
        org_id, 
        (SELECT id FROM departments WHERE organization_id = org_id AND name = 'Administration' LIMIT 1),
        'org_admin',
        '{"can_manage_users": true, "can_manage_settings": true, "can_view_all_data": true}'
    FROM users u WHERE u.email = 'suresh.krishnamurthy@happybank.in'
    ON CONFLICT (user_id, organization_id) DO NOTHING;

    INSERT INTO organization_members (user_id, organization_id, department_id, role, permissions) 
    SELECT 
        u.id, 
        org_id, 
        (SELECT id FROM departments WHERE organization_id = org_id AND name = 'Administration' LIMIT 1),
        'super_admin',
        '{"can_manage_all": true, "can_access_system": true, "can_manage_organizations": true}'
    FROM users u WHERE u.email = 'superadmin@veriphy.com'
    ON CONFLICT (user_id, organization_id) DO NOTHING;

    -- =============================================================================
    -- 5. INSERT LOAN PRODUCTS
    -- =============================================================================
    INSERT INTO loan_products (organization_id, name, description, product_code, min_amount, max_amount, interest_rate, tenure_months, processing_fee, required_documents, eligibility_criteria) VALUES
    (org_id, 'Home Loan', 'Home loan for purchasing residential property', 'HL001', 500000, 50000000, 0.085, 360, 5000, '["aadhaar", "pan", "salary_certificate", "bank_statements"]', '{"min_income": 25000, "min_age": 21, "max_age": 65}'),
    (org_id, 'Personal Loan', 'Personal loan for various purposes', 'PL001', 50000, 2000000, 0.120, 60, 2000, '["aadhaar", "pan", "bank_statements"]', '{"min_income": 15000, "min_age": 21, "max_age": 60}'),
    (org_id, 'Car Loan', 'Car loan for vehicle purchase', 'CL001', 100000, 10000000, 0.095, 84, 3000, '["aadhaar", "pan", "driving_license", "bank_statements"]', '{"min_income": 20000, "min_age": 21, "max_age": 65}'),
    (org_id, 'Business Loan', 'Business loan for entrepreneurs', 'BL001', 1000000, 100000000, 0.110, 120, 10000, '["aadhaar", "pan", "gst_certificate", "business_registration", "itr"]', '{"min_income": 50000, "min_age": 25, "max_age": 60}')
    ON CONFLICT (organization_id, product_code) DO NOTHING;

    -- =============================================================================
    -- 6. INSERT CUSTOMER (from mockCase.customer)
    -- =============================================================================
    INSERT INTO customers (
        organization_id, customer_number, first_name, last_name, email, phone, 
        date_of_birth, marital_status, employment_type, monthly_income, 
        risk_profile, kyc_status, assigned_sales_agent
    ) VALUES (
        org_id, 'CUST001', 'Ramesh', 'Gupta', 'ramesh.gupta@email.com', '+91-9876543210',
        '1970-01-15', 'married', 'self-employed', 75000, 'medium', 'verified',
        (SELECT u.id FROM users u WHERE u.email = 'priya.sharma@happybank.in')
    ) ON CONFLICT (organization_id, customer_number) DO NOTHING;

    -- =============================================================================
    -- 7. INSERT LOAN APPLICATION (from mockCase)
    -- =============================================================================
    INSERT INTO loan_applications (
        organization_id, application_number, customer_id, loan_product_id, 
        requested_amount, requested_tenure, purpose, status, priority, 
        assigned_sales_agent, current_stage, workflow_data
    ) VALUES (
        org_id, 'HBI-HL-2025-001',
        (SELECT id FROM customers WHERE customer_number = 'CUST001' AND organization_id = org_id),
        (SELECT id FROM loan_products WHERE product_code = 'HL001' AND organization_id = org_id),
        5000000, 360, 'Home purchase in Mumbai', 'under_review', 'high',
        (SELECT u.id FROM users u WHERE u.email = 'priya.sharma@happybank.in'),
        'document_collection',
        '{"requested_amount": 5000000, "property_value": 6500000, "loan_to_value": 0.77, "processing_fee": 5000}'
    ) ON CONFLICT (organization_id, application_number) DO NOTHING;

    -- =============================================================================
    -- 8. INSERT DOCUMENT TYPES
    -- =============================================================================
    INSERT INTO document_types (organization_id, name, category, description, is_required, priority, file_types, max_file_size, validity_days) VALUES
    (org_id, 'Aadhaar Card', 'identity', 'Government issued identity document', true, 'high', '{"pdf", "jpg", "png"}', 10485760, 365),
    (org_id, 'PAN Card', 'identity', 'Permanent Account Number card', true, 'high', '{"pdf", "jpg", "png"}', 10485760, 365),
    (org_id, 'Bank Statements', 'financial', 'Bank statements for the last 6 months', true, 'high', '{"pdf", "xlsx"}', 52428800, 90),
    (org_id, 'GST Returns', 'business', 'GST return documents for business', false, 'medium', '{"pdf"}', 10485760, 180),
    (org_id, 'ITR Documents', 'business', 'Income Tax Return documents', false, 'medium', '{"pdf"}', 10485760, 365),
    (org_id, 'Business Registration', 'business', 'Business registration certificate', false, 'medium', '{"pdf", "jpg", "png"}', 10485760, 365),
    (org_id, 'Property Documents', 'property', 'Property related documents', false, 'medium', '{"pdf", "jpg", "png"}', 52428800, 365)
    ON CONFLICT (organization_id, name) DO NOTHING;

    -- =============================================================================
    -- 9. INSERT DOCUMENTS (from mockDocuments)
    -- =============================================================================
    INSERT INTO documents (
        organization_id, loan_application_id, document_type_id, file_name, file_path, 
        file_size, file_type, mime_type, status, uploaded_at, verified_at, reviewed_at, reviewed_by, notes
    ) VALUES
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM document_types WHERE name = 'Aadhaar Card' AND organization_id = org_id),
        'aadhaar_card.pdf', '/documents/HBI-HL-2025-001/aadhaar_card.pdf',
        2048576, 'pdf', 'application/pdf', 'verified',
        '2025-01-09T10:30:00Z', '2025-01-09T11:15:00Z', '2025-01-09T11:15:00Z',
        (SELECT u.id FROM users u WHERE u.email = 'priya.sharma@happybank.in'),
        'Aadhaar card verified successfully'
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM document_types WHERE name = 'PAN Card' AND organization_id = org_id),
        'pan_card.pdf', '/documents/HBI-HL-2025-001/pan_card.pdf',
        1536000, 'pdf', 'application/pdf', 'verified',
        '2025-01-09T10:45:00Z', '2025-01-09T11:20:00Z', '2025-01-09T11:20:00Z',
        (SELECT u.id FROM users u WHERE u.email = 'priya.sharma@happybank.in'),
        'PAN card verified successfully'
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM document_types WHERE name = 'Bank Statements' AND organization_id = org_id),
        'bank_statements.pdf', '/documents/HBI-HL-2025-001/bank_statements.pdf',
        5242880, 'pdf', 'application/pdf', 'uploaded',
        '2025-01-09T11:00:00Z', NULL, NULL, NULL, NULL
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM document_types WHERE name = 'GST Returns' AND organization_id = org_id),
        'gst_returns.pdf', '/documents/HBI-HL-2025-001/gst_returns.pdf',
        0, 'pdf', 'application/pdf', 'pending',
        NULL, NULL, NULL, NULL, NULL
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM document_types WHERE name = 'ITR Documents' AND organization_id = org_id),
        'itr_documents.pdf', '/documents/HBI-HL-2025-001/itr_documents.pdf',
        3145728, 'pdf', 'application/pdf', 'uploaded',
        '2025-01-09T14:30:00Z', NULL, NULL, NULL, NULL
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM document_types WHERE name = 'Business Registration' AND organization_id = org_id),
        'business_registration.pdf', '/documents/HBI-HL-2025-001/business_registration.pdf',
        2097152, 'pdf', 'application/pdf', 'verified',
        '2025-01-09T09:15:00Z', '2025-01-09T10:00:00Z', '2025-01-09T10:00:00Z',
        (SELECT u.id FROM users u WHERE u.email = 'priya.sharma@happybank.in'),
        'Business registration verified successfully'
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM document_types WHERE name = 'Property Documents' AND organization_id = org_id),
        'property_documents.pdf', '/documents/HBI-HL-2025-001/property_documents.pdf',
        0, 'pdf', 'application/pdf', 'pending',
        NULL, NULL, NULL, NULL, NULL
    )
    ON CONFLICT DO NOTHING;

    -- =============================================================================
    -- 10. INSERT WHATSAPP CONVERSATION
    -- =============================================================================
    INSERT INTO whatsapp_conversations (
        organization_id, loan_application_id, customer_phone, whatsapp_id, status, last_message_at
    ) VALUES (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        '+91-9876543210', 'whatsapp_conv_001', 'active', '2025-01-09T15:00:00Z'
    ) ON CONFLICT (organization_id, customer_phone) DO NOTHING;

    -- =============================================================================
    -- 11. INSERT WHATSAPP MESSAGES (from mockWhatsAppMessages)
    -- =============================================================================
    INSERT INTO whatsapp_messages (
        organization_id, conversation_id, message_id, type, content, sender, direction, timestamp, metadata
    ) VALUES
    (
        org_id,
        (SELECT id FROM whatsapp_conversations WHERE customer_phone = '+91-9876543210' AND organization_id = org_id),
        'msg1', 'text', 'Welcome to Happy Bank! We''ve received your home loan application. Let''s get started with document collection.',
        'system', 'outbound', '2025-01-09T09:00:00Z', '{"template_id": "welcome_message"}'
    ),
    (
        org_id,
        (SELECT id FROM whatsapp_conversations WHERE customer_phone = '+91-9876543210' AND organization_id = org_id),
        'msg2', 'text', 'Hello! Thank you for reaching out. We are excited to help you with your home loan.',
        'customer', 'inbound', '2025-01-09T09:05:00Z', '{}'
    ),
    (
        org_id,
        (SELECT id FROM whatsapp_conversations WHERE customer_phone = '+91-9876543210' AND organization_id = org_id),
        'msg3', 'text', 'Please upload your Aadhaar card to proceed with verification.',
        'system', 'outbound', '2025-01-09T09:10:00Z', '{"template_id": "document_request"}'
    ),
    (
        org_id,
        (SELECT id FROM whatsapp_conversations WHERE customer_phone = '+91-9876543210' AND organization_id = org_id),
        'msg4', 'document', 'Aadhaar card uploaded successfully',
        'customer', 'inbound', '2025-01-09T10:30:00Z',
        '{"document_id": "' || (SELECT id FROM documents WHERE file_name = 'aadhaar_card.pdf' AND organization_id = org_id) || '"}'
    ),
    (
        org_id,
        (SELECT id FROM whatsapp_conversations WHERE customer_phone = '+91-9876543210' AND organization_id = org_id),
        'msg5', 'document', 'PAN card uploaded successfully',
        'customer', 'inbound', '2025-01-09T10:45:00Z',
        '{"document_id": "' || (SELECT id FROM documents WHERE file_name = 'pan_card.pdf' AND organization_id = org_id) || '"}'
    ),
    (
        org_id,
        (SELECT id FROM whatsapp_conversations WHERE customer_phone = '+91-9876543210' AND organization_id = org_id),
        'msg6', 'document', 'Bank statements uploaded successfully',
        'customer', 'inbound', '2025-01-09T11:00:00Z',
        '{"document_id": "' || (SELECT id FROM documents WHERE file_name = 'bank_statements.pdf' AND organization_id = org_id) || '"}'
    ),
    (
        org_id,
        (SELECT id FROM whatsapp_conversations WHERE customer_phone = '+91-9876543210' AND organization_id = org_id),
        'msg7', 'text', 'As you are self-employed, we need additional business documents. Please upload your GST returns and ITR for the last 3 years.',
        'system', 'outbound', '2025-01-09T12:00:00Z', '{"template_id": "additional_documents_request"}'
    ),
    (
        org_id,
        (SELECT id FROM whatsapp_conversations WHERE customer_phone = '+91-9876543210' AND organization_id = org_id),
        'msg8', 'document', 'ITR documents uploaded successfully',
        'customer', 'inbound', '2025-01-09T14:30:00Z',
        '{"document_id": "' || (SELECT id FROM documents WHERE file_name = 'itr_documents.pdf' AND organization_id = org_id) || '"}'
    ),
    (
        org_id,
        (SELECT id FROM whatsapp_conversations WHERE customer_phone = '+91-9876543210' AND organization_id = org_id),
        'msg9', 'text', 'We are still working on getting the GST documents ready. Will upload by tomorrow.',
        'customer', 'inbound', '2025-01-09T15:00:00Z', '{}'
    )
    ON CONFLICT (organization_id, message_id) DO NOTHING;

    -- =============================================================================
    -- 12. INSERT WORKFLOW STAGES
    -- =============================================================================
    INSERT INTO workflow_stages (organization_id, name, stage_key, description, department_type, order_index) VALUES
    (org_id, 'Application Submitted', 'application', 'Initial application submission', 'sales', 1),
    (org_id, 'Document Collection', 'document_collection', 'Collecting required documents', 'sales', 2),
    (org_id, 'Document Verification', 'document_verification', 'Verifying submitted documents', 'credit', 3),
    (org_id, 'Credit Analysis', 'credit_analysis', 'Analyzing creditworthiness', 'credit', 4),
    (org_id, 'Approval', 'approval', 'Final approval decision', 'credit', 5),
    (org_id, 'Disbursement', 'disbursement', 'Loan disbursement', 'operations', 6)
    ON CONFLICT (organization_id, stage_key) DO NOTHING;

    -- =============================================================================
    -- 13. INSERT WORKFLOW HISTORY (from mockComplianceLog)
    -- =============================================================================
    INSERT INTO workflow_history (
        organization_id, loan_application_id, to_stage_id, user_id, action, comments, metadata
    ) VALUES
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM workflow_stages WHERE stage_key = 'application' AND organization_id = org_id),
        NULL, 'Case Created', 'New home loan application case created for Ramesh & Sunita Gupta',
        '{"system_generated": true}'
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM workflow_stages WHERE stage_key = 'document_collection' AND organization_id = org_id),
        (SELECT u.id FROM users u WHERE u.email = 'rajesh.kumar@happybank.in'),
        'Case Assigned', 'Case assigned to Priya Sharma (Salesperson)',
        '{"assigned_to": "' || (SELECT u.id FROM users u WHERE u.email = 'priya.sharma@happybank.in') || '"}'
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM workflow_stages WHERE stage_key = 'document_collection' AND organization_id = org_id),
        NULL, 'Document Received', 'Aadhaar card received via WhatsApp and encrypted',
        '{"document_type": "aadhaar", "source": "whatsapp"}'
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM workflow_stages WHERE stage_key = 'document_collection' AND organization_id = org_id),
        NULL, 'Document Received', 'PAN card received via WhatsApp and encrypted',
        '{"document_type": "pan", "source": "whatsapp"}'
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM workflow_stages WHERE stage_key = 'document_verification' AND organization_id = org_id),
        (SELECT u.id FROM users u WHERE u.email = 'priya.sharma@happybank.in'),
        'Document Verified', 'Aadhaar card verification completed',
        '{"document_type": "aadhaar", "verification_status": "verified"}'
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM workflow_stages WHERE stage_key = 'document_verification' AND organization_id = org_id),
        (SELECT u.id FROM users u WHERE u.email = 'priya.sharma@happybank.in'),
        'Document Verified', 'PAN card verification completed',
        '{"document_type": "pan", "verification_status": "verified"}'
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM workflow_stages WHERE stage_key = 'document_collection' AND organization_id = org_id),
        NULL, 'Additional Documents Requested', 'GST and ITR documents requested due to self-employed status',
        '{"reason": "self_employed", "requested_documents": ["gst_returns", "itr"]}'
    ),
    (
        org_id,
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        (SELECT id FROM workflow_stages WHERE stage_key = 'document_collection' AND organization_id = org_id),
        NULL, 'Document Received', 'ITR documents received via WhatsApp and encrypted',
        '{"document_type": "itr", "source": "whatsapp"}'
    )
    ON CONFLICT DO NOTHING;

    -- =============================================================================
    -- 14. INSERT AUDIT LOGS
    -- =============================================================================
    INSERT INTO audit_logs (
        organization_id, user_id, action, resource_type, resource_id, 
        old_values, new_values, ip_address, user_agent
    ) VALUES
    (
        org_id, NULL, 'CREATE', 'loan_application',
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        '{}', '{"application_number": "HBI-HL-2025-001", "customer_id": 1, "requested_amount": 5000000}',
        '127.0.0.1', 'System Generated'
    ),
    (
        org_id, 
        (SELECT u.id FROM users u WHERE u.email = 'rajesh.kumar@happybank.in'),
        'ASSIGN', 'loan_application',
        (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id),
        '{"assigned_sales_agent": null}',
        '{"assigned_sales_agent": "' || (SELECT u.id FROM users u WHERE u.email = 'priya.sharma@happybank.in') || '"}',
        '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    ),
    (
        org_id, 
        (SELECT u.id FROM users u WHERE u.email = 'priya.sharma@happybank.in'),
        'VERIFY', 'document',
        (SELECT id FROM documents WHERE file_name = 'aadhaar_card.pdf' AND organization_id = org_id),
        '{"status": "uploaded"}', '{"status": "verified"}',
        '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    )
    ON CONFLICT DO NOTHING;

    -- =============================================================================
    -- 15. INSERT NOTIFICATIONS
    -- =============================================================================
    INSERT INTO notifications (
        organization_id, user_id, type, title, message, data, is_read
    ) VALUES
    (
        org_id,
        (SELECT u.id FROM users u WHERE u.email = 'priya.sharma@happybank.in'),
        'case_assigned', 'New Case Assigned', 'You have been assigned a new case: HBI-HL-2025-001',
        '{"case_id": "' || (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id) || '"}',
        false
    ),
    (
        org_id,
        (SELECT u.id FROM users u WHERE u.email = 'rajesh.kumar@happybank.in'),
        'case_created', 'New Case Created', 'A new case has been created: HBI-HL-2025-001',
        '{"case_id": "' || (SELECT id FROM loan_applications WHERE application_number = 'HBI-HL-2025-001' AND organization_id = org_id) || '"}',
        false
    )
    ON CONFLICT DO NOTHING;

END $$;

-- Commit transaction
COMMIT;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these queries to verify the data was inserted correctly

-- SELECT 'Organizations' as table_name, count(*) as count FROM organizations;
-- SELECT 'Users' as table_name, count(*) as count FROM users;
-- SELECT 'Organization Members' as table_name, count(*) as count FROM organization_members;
-- SELECT 'Customers' as table_name, count(*) as count FROM customers;
-- SELECT 'Loan Applications' as table_name, count(*) as count FROM loan_applications;
-- SELECT 'Documents' as table_name, count(*) as count FROM documents;
-- SELECT 'WhatsApp Conversations' as table_name, count(*) as count FROM whatsapp_conversations;
-- SELECT 'WhatsApp Messages' as table_name, count(*) as count FROM whatsapp_messages;
-- SELECT 'Workflow History' as table_name, count(*) as count FROM workflow_history;
-- SELECT 'Audit Logs' as table_name, count(*) as count FROM audit_logs;
-- SELECT 'Notifications' as table_name, count(*) as count FROM notifications;

-- =============================================================================
-- SAMPLE QUERY TO TEST THE INTEGRATION
-- =============================================================================
-- This query should return the mock case data in the format expected by your frontend

-- SELECT 
--     la.id,
--     la.application_number as case_number,
--     CONCAT(c.first_name, ' ', c.last_name) as customer_name,
--     c.phone,
--     c.date_of_birth,
--     c.marital_status,
--     c.employment_type,
--     lp.name as loan_type,
--     la.requested_amount as loan_amount,
--     c.risk_profile,
--     la.status,
--     la.priority,
--     la.created_at,
--     la.updated_at
-- FROM loan_applications la
-- JOIN customers c ON la.customer_id = c.id
-- JOIN loan_products lp ON la.loan_product_id = lp.id
-- WHERE la.application_number = 'HBI-HL-2025-001';
