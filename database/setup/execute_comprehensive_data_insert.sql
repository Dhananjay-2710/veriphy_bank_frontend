-- =============================================================================
-- COMPREHENSIVE MOCK DATA INSERTION SCRIPT - EXECUTOR
-- =============================================================================
-- This script executes all parts of the comprehensive data insertion
-- Run this script to populate ALL tables with dummy data

-- Enable foreign key checks and constraints
SET FOREIGN_KEY_CHECKS = 1;

-- Show execution start
SELECT 'Starting comprehensive data insertion...' as status, now() as start_time;

-- =============================================================================
-- PART 1: BASIC ENTITIES (Organizations, Departments, Users, etc.)
-- =============================================================================
\i database/comprehensive_mock_data_insert.sql

-- =============================================================================
-- PART 2: BUSINESS ENTITIES (Customers, Cases, Documents, Tasks, etc.)
-- =============================================================================
\i database/comprehensive_mock_data_insert_part2.sql

-- =============================================================================
-- PART 3: SYSTEM ENTITIES (Logs, Notifications, Auth, Webhooks, etc.)
-- =============================================================================
\i database/comprehensive_mock_data_insert_final.sql

-- =============================================================================
-- VERIFICATION AND SUMMARY
-- =============================================================================
SELECT 'Data insertion completed!' as status, now() as end_time;

-- Show record counts for verification
SELECT 
    'SUMMARY REPORT' as report_type,
    'Records inserted successfully' as description;

SELECT 'organizations' as table_name, count(*) as record_count FROM organizations
UNION ALL
SELECT 'departments' as table_name, count(*) as record_count FROM departments
UNION ALL
SELECT 'employment_types' as table_name, count(*) as record_count FROM employment_types
UNION ALL
SELECT 'roles' as table_name, count(*) as record_count FROM roles
UNION ALL
SELECT 'permissions' as table_name, count(*) as record_count FROM permissions
UNION ALL
SELECT 'assign_permission' as table_name, count(*) as record_count FROM assign_permission
UNION ALL
SELECT 'users' as table_name, count(*) as record_count FROM users
UNION ALL
SELECT 'user_roles' as table_name, count(*) as record_count FROM user_roles
UNION ALL
SELECT 'products' as table_name, count(*) as record_count FROM products
UNION ALL
SELECT 'sub_products' as table_name, count(*) as record_count FROM sub_products
UNION ALL
SELECT 'document_types' as table_name, count(*) as record_count FROM document_types
UNION ALL
SELECT 'task_types' as table_name, count(*) as record_count FROM task_types
UNION ALL
SELECT 'task_sla_policies' as table_name, count(*) as record_count FROM task_sla_policies
UNION ALL
SELECT 'customers' as table_name, count(*) as record_count FROM customers
UNION ALL
SELECT 'files' as table_name, count(*) as record_count FROM files
UNION ALL
SELECT 'documents' as table_name, count(*) as record_count FROM documents
UNION ALL
SELECT 'cases' as table_name, count(*) as record_count FROM cases
UNION ALL
SELECT 'tasks' as table_name, count(*) as record_count FROM tasks
UNION ALL
SELECT 'case_status_history' as table_name, count(*) as record_count FROM case_status_history
UNION ALL
SELECT 'case_workflow_stage' as table_name, count(*) as record_count FROM case_workflow_stage
UNION ALL
SELECT 'assign_case_setting' as table_name, count(*) as record_count FROM assign_case_setting
UNION ALL
SELECT 'folders' as table_name, count(*) as record_count FROM folders
UNION ALL
SELECT 'notifications' as table_name, count(*) as record_count FROM notifications
UNION ALL
SELECT 'logs' as table_name, count(*) as record_count FROM logs
UNION ALL
SELECT 'audit_log' as table_name, count(*) as record_count FROM audit_log
UNION ALL
SELECT 'auth_accounts' as table_name, count(*) as record_count FROM auth_accounts
UNION ALL
SELECT 'document_against_product' as table_name, count(*) as record_count FROM document_against_product
UNION ALL
SELECT 'doc_against_sub_product' as table_name, count(*) as record_count FROM doc_against_sub_product
UNION ALL
SELECT 'third_party_api_log' as table_name, count(*) as record_count FROM third_party_api_log
UNION ALL
SELECT 'webhooks' as table_name, count(*) as record_count FROM webhooks
UNION ALL
SELECT 'sessions' as table_name, count(*) as record_count FROM sessions
UNION ALL
SELECT 'cache' as table_name, count(*) as record_count FROM cache
ORDER BY table_name;

-- =============================================================================
-- SAMPLE QUERIES TO TEST DATA
-- =============================================================================
-- Test query to show a complete case with all related data
SELECT 
    'TEST QUERY - Complete Case Data' as query_type;

SELECT 
    c.case_number,
    c.title,
    c.status,
    c.priority,
    customer.full_name as customer_name,
    customer.mobile as customer_phone,
    p.name as product_name,
    sp.name as sub_product_name,
    assigned_user.full_name as assigned_to,
    created_user.full_name as created_by,
    c.metadata->>'requested_amount' as requested_amount
FROM cases c
LEFT JOIN customers customer ON c.customer_id = customer.id
LEFT JOIN products p ON c.product_id = p.id
LEFT JOIN sub_products sp ON c.sub_product_id = sp.id
LEFT JOIN users assigned_user ON c.assigned_to = assigned_user.id
LEFT JOIN users created_user ON c.created_by = created_user.id
WHERE c.case_number = 'HBI-HL-2025-001';

-- Test query to show document status for a case
SELECT 
    'TEST QUERY - Document Status' as query_type;

SELECT 
    dt.name as document_type,
    d.status,
    d.submitted_at,
    d.verified_on,
    verified_user.full_name as verified_by,
    d.metadata->>'notes' as notes
FROM documents d
LEFT JOIN document_types dt ON d.document_type_id = dt.id
LEFT JOIN users verified_user ON d.verified_by = verified_user.id
LEFT JOIN cases c ON d.customer_id = c.customer_id
WHERE c.case_number = 'HBI-HL-2025-001';

SELECT 'All data inserted successfully! You can now test your application.' as final_message;
