-- =============================================================================
-- COMPREHENSIVE MOCK DATA INSERTION SCRIPT - FINAL PART
-- =============================================================================
-- Final part with remaining tables

-- =============================================================================
-- 21. ASSIGN CASE SETTING
-- =============================================================================
INSERT INTO assign_case_setting (id, organization_id, case_id, user_id, role, assigned_at, metadata) VALUES
(1, 1, 1, 2, 'salesperson', '2025-01-09T10:00:00Z', '{"assigned_by": 3, "reason": "primary_handler"}'),
(2, 1, 1, 4, 'credit_analyst', '2025-01-09T11:00:00Z', '{"assigned_by": 2, "reason": "verification"}'),
(3, 1, 2, 6, 'salesperson', '2025-01-09T11:15:00Z', '{"assigned_by": 3, "reason": "primary_handler"}'),
(4, 1, 3, 2, 'salesperson', '2025-01-09T14:15:00Z', '{"assigned_by": 2, "reason": "self_assignment"}'),
(5, 1, 4, 4, 'credit_analyst', '2025-01-09T16:00:00Z', '{"assigned_by": 3, "reason": "business_loan_specialist"}'),
(6, 1, 5, 6, 'salesperson', '2025-01-09T17:00:00Z', '{"assigned_by": 2, "reason": "education_loan_handler"})
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 22. FOLDERS
-- =============================================================================
INSERT INTO folders (id, name, description, parent_id, department_id, user_id, customer_id, organization_id, metadata) VALUES
(1, 'Customer Documents', 'Root folder for customer documents', NULL, NULL, NULL, NULL, 1, '{"type": "root"}'),
(2, 'Home Loans', 'Documents for home loan applications', 1, 1, NULL, NULL, 1, '{"product_type": "home_loan"}'),
(3, 'Personal Loans', 'Documents for personal loan applications', 1, 1, NULL, NULL, 1, '{"product_type": "personal_loan"}'),
(4, 'Ramesh Gupta', 'Customer folder for Ramesh Gupta', 2, NULL, NULL, 1, 1, '{"customer_code": "CUST001"}'),
(5, 'Arjun Kumar', 'Customer folder for Arjun Kumar', 3, NULL, NULL, 3, 1, '{"customer_code": "CUST003"}'),
(6, 'System Templates', 'System document templates', NULL, 4, 1, NULL, 1, '{"type": "templates"}'),
(7, 'Archive', 'Archived documents', NULL, NULL, NULL, NULL, 1, '{"type": "archive"})
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 23. NOTIFICATIONS
-- =============================================================================
INSERT INTO notifications (id, type, notifiable_type, notifiable_id, data, read_at, organization_id) VALUES
(gen_random_uuid(), 'case_assigned', 'user', 2, '{"case_id": 1, "case_number": "HBI-HL-2025-001", "message": "New case assigned to you"}', NULL, 1),
(gen_random_uuid(), 'document_uploaded', 'user', 2, '{"case_id": 1, "document_type": "aadhaar", "message": "Customer uploaded Aadhaar card"}', '2025-01-09T11:00:00Z', 1),
(gen_random_uuid(), 'document_verified', 'user', 3, '{"case_id": 1, "document_type": "aadhaar", "message": "Aadhaar card verified successfully"}', NULL, 1),
(gen_random_uuid(), 'case_assigned', 'user', 6, '{"case_id": 2, "case_number": "HBI-PL-2025-002", "message": "New case assigned to you"}', NULL, 1),
(gen_random_uuid(), 'task_overdue', 'user', 2, '{"task_id": 6, "case_id": 1, "message": "Property documents collection is overdue"}', NULL, 1),
(gen_random_uuid(), 'approval_required', 'user', 4, '{"case_id": 4, "message": "Business loan requires your approval"}', NULL, 1),
(gen_random_uuid(), 'case_created', 'user', 9, '{"case_id": 6, "case_number": "TFC-HL-2025-001", "message": "New case created"}', NULL, 2),
(gen_random_uuid(), 'case_created', 'user', 11, '{"case_id": 7, "case_number": "SLI-PL-2025-001", "message": "New case created"}', NULL, 3)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 24. LOGS
-- =============================================================================
INSERT INTO logs (id, organization_id, user_id, action, entity_type, entity_id, description, metadata) VALUES
(1, 1, 3, 'CREATE', 'case', 1, 'Created new home loan case HBI-HL-2025-001', '{"ip_address": "192.168.1.100"}'),
(2, 1, 2, 'ASSIGN', 'case', 1, 'Case assigned to Priya Sharma', '{"previous_assignee": null, "new_assignee": 2}'),
(3, 1, 1, 'UPLOAD', 'document', 1, 'Customer uploaded Aadhaar card', '{"file_size": 2048576, "upload_method": "whatsapp"}'),
(4, 1, 2, 'VERIFY', 'document', 1, 'Verified Aadhaar card document', '{"verification_score": 95, "verification_method": "manual"}'),
(5, 1, 1, 'UPLOAD', 'document', 2, 'Customer uploaded PAN card', '{"file_size": 1536000, "upload_method": "whatsapp"}'),
(6, 1, 2, 'VERIFY', 'document', 2, 'Verified PAN card document', '{"verification_score": 98, "verification_method": "manual"}'),
(7, 1, 3, 'CREATE', 'case', 2, 'Created new personal loan case HBI-PL-2025-002', '{"ip_address": "192.168.1.100"}'),
(8, 1, 2, 'CREATE', 'case', 3, 'Created new car loan case HBI-CL-2025-003', '{"ip_address": "192.168.1.101"}'),
(9, 1, 3, 'CREATE', 'case', 4, 'Created new business loan case HBI-BL-2025-004', '{"ip_address": "192.168.1.100"}'),
(10, 1, 2, 'CREATE', 'case', 5, 'Created new education loan case HBI-EL-2025-005', '{"ip_address": "192.168.1.101"}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 25. AUDIT LOG
-- =============================================================================
INSERT INTO audit_log (id, organization_id, user_id, action, entity_type, entity_id, before_state, after_state, ip_address, session_id, duration) VALUES
(1, 1, NULL, 'CREATE', 'case', 1, '{}', '{"case_number": "HBI-HL-2025-001", "status": "open"}', '127.0.0.1', 'sess_001', 150),
(2, 1, 3, 'UPDATE', 'case', 1, '{"assigned_to": null}', '{"assigned_to": 2}', '192.168.1.100', 'sess_002', 200),
(3, 1, 2, 'UPDATE', 'case', 1, '{"status": "open"}', '{"status": "in_progress"}', '192.168.1.101', 'sess_003', 180),
(4, 1, 1, 'CREATE', 'document', 1, '{}', '{"status": "uploaded", "type": "aadhaar"}', '192.168.1.102', 'sess_004', 300),
(5, 1, 2, 'UPDATE', 'document', 1, '{"status": "uploaded"}', '{"status": "verified"}', '192.168.1.101', 'sess_005', 240),
(6, 1, 1, 'CREATE', 'document', 2, '{}', '{"status": "uploaded", "type": "pan"}', '192.168.1.102', 'sess_006', 280),
(7, 1, 2, 'UPDATE', 'document', 2, '{"status": "uploaded"}', '{"status": "verified"}', '192.168.1.101', 'sess_007', 220),
(8, 1, 3, 'CREATE', 'case', 2, '{}', '{"case_number": "HBI-PL-2025-002", "status": "open"}', '192.168.1.100', 'sess_008', 170)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 26. AUTH ACCOUNTS
-- =============================================================================
INSERT INTO auth_accounts (id, user_id, customer_id, identifier, identifier_type, password_hash, password_algo, provider, is_active, last_login_at, normalized_identifier) VALUES
(gen_random_uuid(), 1, NULL, 'superadmin@veriphy.com', 'email', '$2b$10$N9qo8uLOickgx2ZMRZoMye/Lo4mWOqf2YZJD.rR9xEdrCgdczGwou', 'bcrypt', 'local', true, '2025-01-09T08:00:00Z', 'superadmin@veriphy.com'),
(gen_random_uuid(), 2, NULL, 'priya.sharma@happybank.in', 'email', '$2b$10$N9qo8uLOickgx2ZMRZoMye/Lo4mWOqf2YZJD.rR9xEdrCgdczGwou', 'bcrypt', 'local', true, '2025-01-09T09:30:00Z', 'priya.sharma@happybank.in'),
(gen_random_uuid(), 3, NULL, 'rajesh.kumar@happybank.in', 'email', '$2b$10$N9qo8uLOickgx2ZMRZoMye/Lo4mWOqf2YZJD.rR9xEdrCgdczGwou', 'bcrypt', 'local', true, '2025-01-09T08:45:00Z', 'rajesh.kumar@happybank.in'),
(gen_random_uuid(), 4, NULL, 'anita.patel@happybank.in', 'email', '$2b$10$N9qo8uLOickgx2ZMRZoMye/Lo4mWOqf2YZJD.rR9xEdrCgdczGwou', 'bcrypt', 'local', true, '2025-01-09T10:15:00Z', 'anita.patel@happybank.in'),
(gen_random_uuid(), 5, NULL, 'suresh.krishnamurthy@happybank.in', 'email', '$2b$10$N9qo8uLOickgx2ZMRZoMye/Lo4mWOqf2YZJD.rR9xEdrCgdczGwou', 'bcrypt', 'local', true, '2025-01-09T07:30:00Z', 'suresh.krishnamurthy@happybank.in'),
(gen_random_uuid(), NULL, 1, 'ramesh.gupta@email.com', 'email', '$2b$10$N9qo8uLOickgx2ZMRZoMye/Lo4mWOqf2YZJD.rR9xEdrCgdczGwou', 'bcrypt', 'local', true, '2025-01-09T10:00:00Z', 'ramesh.gupta@email.com'),
(gen_random_uuid(), NULL, 3, 'arjun.kumar@email.com', 'email', '$2b$10$N9qo8uLOickgx2ZMRZoMye/Lo4mWOqf2YZJD.rR9xEdrCgdczGwou', 'bcrypt', 'local', true, '2025-01-09T11:30:00Z', 'arjun.kumar@email.com')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 27. DOCUMENT AGAINST PRODUCT
-- =============================================================================
INSERT INTO document_against_product (id, organization_id, product_id, document_type_id, mandatory, notes, metadata) VALUES
(1, 1, 1, 1, true, 'Aadhaar card is mandatory for all home loans', '{"priority": "high"}'),
(2, 1, 1, 2, true, 'PAN card is mandatory for all home loans', '{"priority": "high"}'),
(3, 1, 1, 3, true, 'Bank statements required for income verification', '{"priority": "high", "months": 6}'),
(4, 1, 1, 6, true, 'Property documents required for home loans', '{"priority": "high"}'),
(5, 1, 2, 1, true, 'Aadhaar card is mandatory', '{"priority": "high"}'),
(6, 1, 2, 2, true, 'PAN card is mandatory', '{"priority": "high"}'),
(7, 1, 2, 3, true, 'Bank statements for income verification', '{"priority": "high", "months": 3}'),
(8, 1, 3, 1, true, 'Aadhaar card mandatory for car loans', '{"priority": "high"}'),
(9, 1, 3, 2, true, 'PAN card mandatory for car loans', '{"priority": "high"}'),
(10, 1, 3, 9, true, 'Driving license required for car loans', '{"priority": "high"})
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 28. DOC AGAINST SUB PRODUCT
-- =============================================================================
INSERT INTO doc_against_sub_product (id, organization_id, sub_product_id, document_type_id, mandatory, notes, metadata) VALUES
(1, 1, 1, 6, true, 'Property valuation required for prime home loans', '{"valuation_required": true}'),
(2, 1, 1, 5, false, 'ITR may be required for high value loans', '{"threshold": 5000000}'),
(3, 1, 3, 4, false, 'Salary certificate for express processing', '{"express_processing": true}'),
(4, 1, 7, 7, true, 'GST returns mandatory for working capital', '{"months": 12}'),
(5, 1, 7, 8, true, 'Business registration required', '{"age_limit": "3_years"}'),
(6, 1, 8, 8, true, 'Business registration for equipment finance', '{"equipment_type": "any"}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 29. THIRD PARTY API LOG
-- =============================================================================
INSERT INTO third_party_api_log (id, organization_id, api_name, url, request_payload, response_payload, status_code, method) VALUES
(1, 1, 'WhatsApp Business API', 'https://graph.facebook.com/v17.0/whatsapp', '{"messaging_product": "whatsapp", "to": "+919876543210", "type": "text"}', '{"messaging_product": "whatsapp", "contacts": [{"input": "+919876543210", "wa_id": "919876543210"}]}', 200, 'POST'),
(2, 1, 'Aadhaar Verification API', 'https://api.uidai.gov.in/verify', '{"aadhaar_number": "xxxx-xxxx-1234", "name": "Ramesh Gupta"}', '{"status": "verified", "score": 95}', 200, 'POST'),
(3, 1, 'PAN Verification API', 'https://api.nsdl.com/pan/verify', '{"pan_number": "ABCDE1234F", "name": "Ramesh Gupta"}', '{"status": "verified", "score": 98}', 200, 'POST'),
(4, 1, 'Credit Bureau API', 'https://api.cibil.com/score', '{"customer_id": "CUST001", "pan": "ABCDE1234F"}', '{"score": 750, "category": "good"}', 200, 'POST'),
(5, 1, 'Bank Statement Analysis', 'https://api.perfios.com/analyze', '{"file_id": "file_001", "type": "bank_statement"}', '{"avg_balance": 125000, "salary_credit": 75000}', 200, 'POST')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 30. WEBHOOKS
-- =============================================================================
INSERT INTO webhooks (id, provider, payload, status, processed_at, metadata) VALUES
(1, 'whatsapp', '{"object": "whatsapp_business_account", "entry": [{"changes": [{"value": {"messages": [{"from": "919876543210", "text": {"body": "Hello"}}]}}]}]}', 'processed', '2025-01-09T09:05:00Z', '{"case_id": 1}'),
(2, 'whatsapp', '{"object": "whatsapp_business_account", "entry": [{"changes": [{"value": {"messages": [{"from": "919876543210", "type": "document"}]}}]}]}', 'processed', '2025-01-09T10:30:00Z', '{"case_id": 1, "document_type": "aadhaar"}'),
(3, 'bank_statement_processor', '{"file_id": "file_003", "analysis_complete": true, "results": {"avg_balance": 125000}}', 'processed', '2025-01-09T11:30:00Z', '{"case_id": 1}'),
(4, 'credit_bureau', '{"customer_id": "CUST001", "score_updated": true, "new_score": 750}', 'processed', '2025-01-09T12:00:00Z', '{"case_id": 1}'),
(5, 'document_ocr', '{"document_id": "doc_001", "ocr_complete": true, "extracted_data": {"name": "Ramesh Gupta"}}', 'processed', '2025-01-09T10:45:00Z', '{"case_id": 1}')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 31. SESSIONS
-- =============================================================================
INSERT INTO sessions (id, user_id, ip_address, user_agent, payload, last_activity) VALUES
('sess_001', 1, '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"user_id": 1, "role": "super_admin"}', extract(epoch from now())),
('sess_002', 2, '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"user_id": 2, "role": "salesperson"}', extract(epoch from now())),
('sess_003', 3, '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '{"user_id": 3, "role": "manager"}', extract(epoch from now())),
('sess_004', 4, '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '{"user_id": 4, "role": "credit-ops"}', extract(epoch from now())),
('sess_005', 5, '192.168.1.104', 'Mozilla/5.0 (Ubuntu; Linux x86_64) AppleWebKit/537.36', '{"user_id": 5, "role": "admin"}', extract(epoch from now()))
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 32. CACHE (for application performance)
-- =============================================================================
INSERT INTO cache (key, value, expiration) VALUES
('user_permissions_1', '["all"]', extract(epoch from now()) + 3600),
('user_permissions_2', '["view_cases", "create_cases", "update_cases"]', extract(epoch from now()) + 3600),
('dashboard_stats_1', '{"total_cases": 5, "pending_cases": 3, "approved_cases": 0}', extract(epoch from now()) + 300),
('product_config_1', '{"home_loan": {"max_amount": 50000000, "interest_rate": 0.085}}', extract(epoch from now()) + 86400)
ON CONFLICT (key) DO NOTHING;

-- Commit transaction
COMMIT;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these to verify data insertion
/*
SELECT 'organizations' as table_name, count(*) as record_count FROM organizations
UNION ALL
SELECT 'users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 'customers' as table_name, count(*) as record_count FROM customers
UNION ALL
SELECT 'cases' as table_name, count(*) as record_count FROM cases
UNION ALL
SELECT 'documents' as table_name, count(*) as record_count FROM documents
UNION ALL
SELECT 'tasks' as table_name, count(*) as record_count FROM tasks
UNION ALL
SELECT 'notifications' as table_name, count(*) as record_count FROM notifications;
*/
