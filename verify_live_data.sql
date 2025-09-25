-- =============================================================================
-- VERIFICATION SCRIPT FOR LIVE DATA INTEGRATION
-- =============================================================================
-- Run this after executing database_live_data_setup.sql to verify everything is working
-- =============================================================================

-- Check if all required tables exist
SELECT 'Checking table existence...' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'organizations', 'departments', 'users', 'products', 'customers', 
  'cases', 'compliance_issues', 'documents', 'tasks', 'logs'
)
ORDER BY table_name;

-- Check data counts
SELECT 'Data counts:' as status;

SELECT 'Organizations' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'Departments', COUNT(*) FROM departments
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Cases', COUNT(*) FROM cases
UNION ALL
SELECT 'Compliance Issues', COUNT(*) FROM compliance_issues
UNION ALL
SELECT 'Documents', COUNT(*) FROM documents
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM logs;

-- Check cases for Approval Queue (should show cases with status: new, in-progress, review)
SELECT 'Cases for Approval Queue:' as status;
SELECT 
  case_number,
  c.full_name as customer_name,
  c.mobile as customer_phone,
  loan_type,
  loan_amount,
  status,
  priority,
  created_at
FROM cases 
JOIN customers c ON cases.customer_id = c.id
WHERE status IN ('new', 'in-progress', 'review')
ORDER BY priority DESC, created_at ASC;

-- Check cases for Pending Reviews (same as approval queue)
SELECT 'Cases for Pending Reviews:' as status;
SELECT 
  case_number,
  c.full_name as customer_name,
  c.mobile as customer_phone,
  loan_type,
  loan_amount,
  status,
  priority,
  created_at
FROM cases 
JOIN customers c ON cases.customer_id = c.id
WHERE status IN ('new', 'in-progress', 'review')
ORDER BY priority DESC, created_at ASC;

-- Check compliance issues for Compliance Review
SELECT 'Compliance Issues:' as status;
SELECT 
  ci.id,
  ci.title,
  ci.description,
  ci.status,
  ci.severity,
  ci.priority,
  c.full_name as customer_name,
  c.mobile as customer_phone,
  cases.case_number,
  ci.reported_at,
  ci.due_date
FROM compliance_issues ci
JOIN customers c ON ci.customer_id = c.id
JOIN cases ON ci.case_id = cases.id
ORDER BY ci.priority DESC, ci.reported_at ASC;

-- Check compliance metrics (for Compliance Reports)
SELECT 'Compliance Metrics Summary:' as status;
SELECT 
  severity,
  status,
  COUNT(*) as count
FROM compliance_issues
GROUP BY severity, status
ORDER BY severity, status;

-- Check recent audit logs
SELECT 'Recent Audit Logs:' as status;
SELECT 
  action,
  entity_type,
  description,
  log_type,
  created_at
FROM logs
ORDER BY created_at DESC
LIMIT 10;

-- Check user roles and organizations
SELECT 'Users by Role:' as status;
SELECT 
  u.full_name,
  u.email,
  u.role,
  o.name as organization,
  d.name as department
FROM users u
JOIN organizations o ON u.organization_id = o.id
JOIN departments d ON u.department_id = d.id
ORDER BY u.role, u.full_name;

-- Test specific queries that the components will use
SELECT 'Testing component queries...' as status;

-- Test Approval Queue query
SELECT 'Approval Queue Query Test:' as status;
SELECT 
  cases.id,
  cases.case_number,
  cases.status,
  cases.priority,
  cases.created_at,
  c.full_name,
  c.mobile,
  p.name as product_name
FROM cases
JOIN customers c ON cases.customer_id = c.id
JOIN products p ON cases.product_id = p.id
WHERE cases.status IN ('new', 'in-progress', 'review')
ORDER BY cases.created_at ASC;

-- Test Compliance Issues query
SELECT 'Compliance Issues Query Test:' as status;
SELECT 
  ci.id,
  ci.title,
  ci.description,
  ci.status,
  ci.severity,
  ci.priority,
  ci.reported_at,
  ci.due_date
FROM compliance_issues ci
ORDER BY ci.created_at DESC;

-- Test Pending Reviews query
SELECT 'Pending Reviews Query Test:' as status;
SELECT 
  cases.id,
  cases.case_number,
  cases.status,
  cases.priority,
  cases.created_at,
  c.full_name,
  c.mobile
FROM cases
JOIN customers c ON cases.customer_id = c.id
WHERE cases.status IN ('new', 'in-progress', 'review')
ORDER BY cases.created_at ASC;

-- Final verification
SELECT 'Final Status Check:' as status;
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM cases WHERE status IN ('new', 'in-progress', 'review')) > 0 
    THEN '✅ Approval Queue data available'
    ELSE '❌ No approval queue data'
  END as approval_queue_status,
  CASE 
    WHEN (SELECT COUNT(*) FROM compliance_issues) > 0 
    THEN '✅ Compliance issues data available'
    ELSE '❌ No compliance issues data'
  END as compliance_issues_status,
  CASE 
    WHEN (SELECT COUNT(*) FROM logs) > 0 
    THEN '✅ Audit logs data available'
    ELSE '❌ No audit logs data'
  END as audit_logs_status;

-- =============================================================================
-- END OF VERIFICATION SCRIPT
-- =============================================================================
