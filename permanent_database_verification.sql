-- =============================================================================
-- PERMANENT DATABASE VERIFICATION SCRIPT - NO MORE QUICK FIXES
-- =============================================================================

-- This script provides comprehensive, permanent verification of your database
-- structure and data integrity. Run this whenever you need to verify your setup.

-- =============================================================================
-- 1. COMPLETE SCHEMA VALIDATION
-- =============================================================================

-- Check all tables exist with correct structure
SELECT 'SCHEMA VALIDATION RESULTS:' as verification_type;

WITH expected_tables AS (
  SELECT unnest(ARRAY[
    'users', 'customers', 'cases', 'documents', 'tasks', 
    'organizations', 'departments', 'products', 'document_types', 
    'files', 'audit_log', 'notifications', 'system_settings', 'webhooks'
  ]) as table_name
),
existing_tables AS (
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
)
SELECT 
  et.table_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM existing_tables ex WHERE ex.table_name = et.table_name) 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM expected_tables et
ORDER BY et.table_name;

-- =============================================================================
-- 2. ENUM TYPE VALIDATION
-- =============================================================================

SELECT 'ENUM TYPE VALIDATION:' as verification_type;

-- Verify all enum types exist and have correct values
SELECT 
  'case_status_t' as enum_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_type WHERE typname = 'case_status_t') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as valid_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'case_status_t'

UNION ALL

SELECT 
  'case_priority_t' as enum_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_type WHERE typname = 'case_priority_t') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as valid_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'case_priority_t'

UNION ALL

SELECT 
  'task_status_t' as enum_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_type WHERE typname = 'task_status_t') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as valid_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'task_status_t'

UNION ALL

SELECT 
  'doc_status_t' as enum_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_type WHERE typname = 'doc_status_t') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as valid_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'doc_status_t'

UNION ALL

SELECT 
  'user_status_t' as enum_name,
  CASE 
    WHEN EXISTS(SELECT 1 FROM pg_type WHERE typname = 'user_status_t') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status,
  string_agg(enumlabel, ', ' ORDER BY enumsortorder) as valid_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'user_status_t';

-- =============================================================================
-- 3. DATA INTEGRITY VALIDATION
-- =============================================================================

SELECT 'DATA INTEGRITY VALIDATION:' as verification_type;

-- Check for data consistency across tables
SELECT 
  'users' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_records,
  COUNT(CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 END) as valid_names,
  COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as valid_emails,
  COUNT(CASE WHEN role IS NOT NULL AND role != '' THEN 1 END) as valid_roles
FROM users

UNION ALL

SELECT 
  'cases' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN status = 'open' THEN 1 END) as open_records,
  COUNT(CASE WHEN case_number IS NOT NULL AND case_number != '' THEN 1 END) as valid_case_numbers,
  COUNT(CASE WHEN assigned_to IS NOT NULL THEN 1 END) as assigned_records,
  COUNT(CASE WHEN priority IS NOT NULL THEN 1 END) as valid_priorities
FROM cases

UNION ALL

SELECT 
  'documents' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_records,
  COUNT(CASE WHEN customer_id IS NOT NULL THEN 1 END) as valid_customer_ids,
  COUNT(CASE WHEN uploaded_by IS NOT NULL THEN 1 END) as valid_uploaders,
  COUNT(CASE WHEN document_type_id IS NOT NULL THEN 1 END) as valid_document_types
FROM documents

UNION ALL

SELECT 
  'tasks' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN status = 'open' THEN 1 END) as open_records,
  COUNT(CASE WHEN title IS NOT NULL AND title != '' THEN 1 END) as valid_titles,
  COUNT(CASE WHEN assigned_to IS NOT NULL THEN 1 END) as assigned_records,
  COUNT(CASE WHEN priority IS NOT NULL THEN 1 END) as valid_priorities
FROM tasks;

-- =============================================================================
-- 4. RELATIONSHIP INTEGRITY VALIDATION
-- =============================================================================

SELECT 'RELATIONSHIP INTEGRITY VALIDATION:' as verification_type;

-- Check foreign key relationships
SELECT 
  'cases.assigned_to -> users.id' as relationship,
  COUNT(*) as total_cases,
  COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as valid_assignments,
  COUNT(CASE WHEN u.id IS NULL THEN 1 END) as orphaned_assignments
FROM cases c
LEFT JOIN users u ON c.assigned_to = u.id

UNION ALL

SELECT 
  'documents.customer_id -> customers.id' as relationship,
  COUNT(*) as total_documents,
  COUNT(CASE WHEN cu.id IS NOT NULL THEN 1 END) as valid_customers,
  COUNT(CASE WHEN cu.id IS NULL THEN 1 END) as orphaned_documents
FROM documents d
LEFT JOIN customers cu ON d.customer_id = cu.id

UNION ALL

SELECT 
  'documents.uploaded_by -> users.id' as relationship,
  COUNT(*) as total_documents,
  COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as valid_uploaders,
  COUNT(CASE WHEN u.id IS NULL THEN 1 END) as orphaned_uploaders
FROM documents d
LEFT JOIN users u ON d.uploaded_by = u.id

UNION ALL

SELECT 
  'tasks.assigned_to -> users.id' as relationship,
  COUNT(*) as total_tasks,
  COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as valid_assignments,
  COUNT(CASE WHEN u.id IS NULL THEN 1 END) as orphaned_assignments
FROM tasks t
LEFT JOIN users u ON t.assigned_to = u.id;

-- =============================================================================
-- 5. PERFORMANCE INDICATORS
-- =============================================================================

SELECT 'PERFORMANCE INDICATORS:' as verification_type;

-- Get key performance metrics
SELECT 
  'Active Users' as metric,
  COUNT(*)::text as value
FROM users 
WHERE is_active = true

UNION ALL

SELECT 
  'Open Cases' as metric,
  COUNT(*)::text as value
FROM cases 
WHERE status = 'open'

UNION ALL

SELECT 
  'In Progress Cases' as metric,
  COUNT(*)::text as value
FROM cases 
WHERE status = 'in_progress'

UNION ALL

SELECT 
  'Closed Cases' as metric,
  COUNT(*)::text as value
FROM cases 
WHERE status = 'closed'

UNION ALL

SELECT 
  'Open Tasks' as metric,
  COUNT(*)::text as value
FROM tasks 
WHERE status = 'open'

UNION ALL

SELECT 
  'Pending Documents' as metric,
  COUNT(*)::text as value
FROM documents 
WHERE status = 'pending'

UNION ALL

SELECT 
  'Daily Audit Logs' as metric,
  COUNT(*)::text as value
FROM audit_log 
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- =============================================================================
-- 6. ENUM USAGE ANALYSIS
-- =============================================================================

SELECT 'ENUM USAGE ANALYSIS:' as verification_type;

-- Analyze actual enum usage in data
SELECT 
  'case_status_t' as enum_type,
  status::text as enum_value,
  COUNT(*) as usage_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY 'case_status_t'), 2) as percentage
FROM cases
GROUP BY status

UNION ALL

SELECT 
  'task_status_t' as enum_type,
  status::text as enum_value,
  COUNT(*) as usage_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY 'task_status_t'), 2) as percentage
FROM tasks
GROUP BY status

UNION ALL

SELECT 
  'doc_status_t' as enum_type,
  status::text as enum_value,
  COUNT(*) as usage_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY 'doc_status_t'), 2) as percentage
FROM documents
GROUP BY status

UNION ALL

SELECT 
  'user_status_t' as enum_type,
  status::text as enum_value,
  COUNT(*) as usage_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY 'user_status_t'), 2) as percentage
FROM users
GROUP BY status;

-- =============================================================================
-- 7. SYSTEM HEALTH SUMMARY
-- =============================================================================

SELECT 'SYSTEM HEALTH SUMMARY:' as verification_type;

WITH health_checks AS (
  SELECT 
    -- Table existence check
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'cases', 'documents', 'tasks', 'organizations', 'departments', 'products', 'document_types', 'files', 'audit_log', 'notifications', 'system_settings', 'webhooks')) as existing_tables,
    
    -- Enum existence check
    (SELECT COUNT(*) FROM pg_type WHERE typname IN ('case_status_t', 'case_priority_t', 'task_status_t', 'doc_status_t', 'user_status_t')) as existing_enums,
    
    -- Data consistency check
    (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
    (SELECT COUNT(*) FROM cases WHERE case_number IS NOT NULL) as valid_cases,
    (SELECT COUNT(*) FROM documents WHERE customer_id IS NOT NULL) as valid_documents,
    (SELECT COUNT(*) FROM tasks WHERE title IS NOT NULL) as valid_tasks,
    
    -- Relationship integrity check
    (SELECT COUNT(*) FROM cases c LEFT JOIN users u ON c.assigned_to = u.id WHERE u.id IS NULL) as orphaned_case_assignments,
    (SELECT COUNT(*) FROM documents d LEFT JOIN customers cu ON d.customer_id = cu.id WHERE cu.id IS NULL) as orphaned_document_customers
)
SELECT 
  CASE 
    WHEN existing_tables >= 13 THEN '✅ EXCELLENT'
    WHEN existing_tables >= 10 THEN '⚠️ GOOD'
    ELSE '❌ POOR'
  END as table_health,
  
  CASE 
    WHEN existing_enums >= 5 THEN '✅ EXCELLENT'
    WHEN existing_enums >= 3 THEN '⚠️ GOOD'
    ELSE '❌ POOR'
  END as enum_health,
  
  CASE 
    WHEN active_users > 0 AND valid_cases > 0 AND valid_documents > 0 AND valid_tasks > 0 THEN '✅ EXCELLENT'
    WHEN active_users > 0 OR valid_cases > 0 THEN '⚠️ GOOD'
    ELSE '❌ POOR'
  END as data_health,
  
  CASE 
    WHEN orphaned_case_assignments = 0 AND orphaned_document_customers = 0 THEN '✅ EXCELLENT'
    WHEN orphaned_case_assignments <= 2 AND orphaned_document_customers <= 2 THEN '⚠️ GOOD'
    ELSE '❌ POOR'
  END as relationship_health,
  
  CASE 
    WHEN existing_tables >= 13 AND existing_enums >= 5 AND active_users > 0 AND orphaned_case_assignments = 0 THEN '✅ SYSTEM HEALTHY'
    WHEN existing_tables >= 10 AND existing_enums >= 3 AND active_users > 0 THEN '⚠️ SYSTEM FUNCTIONAL'
    ELSE '❌ SYSTEM NEEDS ATTENTION'
  END as overall_health
FROM health_checks;

-- =============================================================================
-- 8. RECOMMENDATIONS
-- =============================================================================

SELECT 'RECOMMENDATIONS:' as verification_type;

WITH recommendations AS (
  SELECT 
    'Create missing tables' as recommendation,
    CASE 
      WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'cases', 'documents', 'tasks', 'organizations', 'departments', 'products', 'document_types', 'files', 'audit_log', 'notifications', 'system_settings', 'webhooks')) < 13
      THEN 'HIGH PRIORITY - Some core tables are missing'
      ELSE '✅ All tables exist'
    END as priority
  UNION ALL
  SELECT 
    'Fix enum types' as recommendation,
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_type WHERE typname IN ('case_status_t', 'case_priority_t', 'task_status_t', 'doc_status_t', 'user_status_t')) < 5
      THEN 'HIGH PRIORITY - Some enum types are missing'
      ELSE '✅ All enum types exist'
    END as priority
  UNION ALL
  SELECT 
    'Populate initial data' as recommendation,
    CASE 
      WHEN (SELECT COUNT(*) FROM users WHERE is_active = true) = 0
      THEN 'MEDIUM PRIORITY - No active users found'
      ELSE '✅ Users exist'
    END as priority
  UNION ALL
  SELECT 
    'Fix data relationships' as recommendation,
    CASE 
      WHEN (SELECT COUNT(*) FROM cases c LEFT JOIN users u ON c.assigned_to = u.id WHERE u.id IS NULL) > 0
      OR (SELECT COUNT(*) FROM documents d LEFT JOIN customers cu ON d.customer_id = cu.id WHERE cu.id IS NULL) > 0
      THEN 'MEDIUM PRIORITY - Some foreign key relationships are broken'
      ELSE '✅ All relationships are valid'
    END as priority
)
SELECT recommendation, priority FROM recommendations;

-- =============================================================================
-- END OF PERMANENT VERIFICATION SCRIPT
-- =============================================================================

-- This script provides comprehensive validation of your database structure
-- and data integrity. It should be run regularly to ensure system health.
-- All results are permanent and don't require quick fixes.
