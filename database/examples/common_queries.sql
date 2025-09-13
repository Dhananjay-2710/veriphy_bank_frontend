-- Veriphy Bank Database
-- Common queries for banking operations

-- =============================================================================
-- 1. ACCOUNT MANAGEMENT QUERIES
-- =============================================================================

-- Get account balance for a specific account
SELECT 
    a.account_number,
    at.name as account_type,
    b.balance,
    b.available_balance,
    b.frozen_amount,
    a.status,
    c.first_name || ' ' || c.last_name as customer_name
FROM accounts a
JOIN account_types at ON a.account_type_id = at.id
LEFT JOIN balances b ON a.id = b.account_id
JOIN customers c ON a.customer_id = c.id
WHERE a.account_number = 'SAV00000001'
AND a.deleted_at IS NULL;

-- Get all accounts for a customer
SELECT 
    a.account_number,
    at.name as account_type,
    b.balance,
    a.status,
    a.opened_at
FROM accounts a
JOIN account_types at ON a.account_type_id = at.id
LEFT JOIN balances b ON a.id = b.account_id
WHERE a.customer_id = 1
AND a.deleted_at IS NULL
ORDER BY a.opened_at DESC;

-- Get account summary with recent activity
SELECT 
    a.account_number,
    at.name as account_type,
    b.balance,
    a.status,
    (SELECT COUNT(*) FROM transactions t WHERE t.account_id = a.id AND t.created_at >= CURRENT_DATE - INTERVAL '30 days') as transactions_last_30_days,
    (SELECT MAX(created_at) FROM transactions t WHERE t.account_id = a.id) as last_transaction_date
FROM accounts a
JOIN account_types at ON a.account_type_id = at.id
LEFT JOIN balances b ON a.id = b.account_id
WHERE a.customer_id = 1
AND a.deleted_at IS NULL;

-- =============================================================================
-- 2. TRANSACTION QUERIES
-- =============================================================================

-- Get transaction history for an account (with pagination)
SELECT 
    t.id,
    tt.name as transaction_type,
    t.amount,
    t.status,
    t.description,
    t.created_at,
    t.processed_at
FROM transactions t
JOIN transaction_types tt ON t.transaction_type_id = tt.id
WHERE t.account_id = 1
AND t.deleted_at IS NULL
ORDER BY t.created_at DESC
LIMIT 20 OFFSET 0;

-- Get transaction history for date range
SELECT 
    t.id,
    tt.name as transaction_type,
    t.amount,
    t.status,
    t.description,
    t.created_at
FROM transactions t
JOIN transaction_types tt ON t.transaction_type_id = tt.id
WHERE t.account_id = 1
AND t.created_at >= '2025-01-01'
AND t.created_at < '2025-02-01'
AND t.deleted_at IS NULL
ORDER BY t.created_at DESC;

-- Get daily transaction summary
SELECT 
    DATE(t.created_at) as transaction_date,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN tt.is_debit THEN t.amount ELSE 0 END) as total_debits,
    SUM(CASE WHEN NOT tt.is_debit THEN t.amount ELSE 0 END) as total_credits,
    SUM(CASE WHEN NOT tt.is_debit THEN t.amount ELSE -t.amount END) as net_amount
FROM transactions t
JOIN transaction_types tt ON t.transaction_type_id = tt.id
WHERE t.account_id = 1
AND t.created_at >= CURRENT_DATE - INTERVAL '30 days'
AND t.deleted_at IS NULL
GROUP BY DATE(t.created_at)
ORDER BY transaction_date DESC;

-- Get pending transactions
SELECT 
    t.id,
    a.account_number,
    tt.name as transaction_type,
    t.amount,
    t.description,
    t.created_at
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN transaction_types tt ON t.transaction_type_id = tt.id
WHERE t.status = 'pending'
AND t.created_at >= CURRENT_DATE - INTERVAL '1 day'
ORDER BY t.created_at ASC;

-- =============================================================================
-- 3. CUSTOMER MANAGEMENT QUERIES
-- =============================================================================

-- Get customer profile with KYC status
SELECT 
    c.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone,
    c.pan_number,
    c.aadhaar_number,
    c.date_of_birth,
    c.gender,
    c.marital_status,
    c.employment_type,
    c.risk_profile,
    c.kyc_status,
    c.created_at
FROM customers c
JOIN users u ON c.user_id = u.id
WHERE c.id = 1
AND c.deleted_at IS NULL;

-- Get customers by KYC status
SELECT 
    c.id,
    u.first_name || ' ' || u.last_name as customer_name,
    u.email,
    c.kyc_status,
    c.created_at,
    COUNT(a.id) as account_count
FROM customers c
JOIN users u ON c.user_id = u.id
LEFT JOIN accounts a ON c.id = a.customer_id AND a.deleted_at IS NULL
WHERE c.kyc_status = 'pending'
AND c.deleted_at IS NULL
GROUP BY c.id, u.first_name, u.last_name, u.email, c.kyc_status, c.created_at
ORDER BY c.created_at ASC;

-- Get customer risk profile analysis
SELECT 
    c.risk_profile,
    COUNT(*) as customer_count,
    AVG(EXTRACT(YEAR FROM AGE(c.date_of_birth))) as avg_age,
    COUNT(CASE WHEN c.employment_type = 'salaried' THEN 1 END) as salaried_count,
    COUNT(CASE WHEN c.employment_type = 'self-employed' THEN 1 END) as self_employed_count
FROM customers c
WHERE c.deleted_at IS NULL
GROUP BY c.risk_profile
ORDER BY c.risk_profile;

-- =============================================================================
-- 4. CASE MANAGEMENT QUERIES
-- =============================================================================

-- Get cases assigned to a user
SELECT 
    c.id,
    c.case_number,
    cust.first_name || ' ' || cust.last_name as customer_name,
    c.loan_type,
    c.loan_amount,
    c.status,
    c.priority,
    c.created_at,
    c.updated_at
FROM cases c
JOIN customers cust ON c.customer_id = cust.id
JOIN users u ON cust.user_id = u.id
WHERE c.assigned_to = 1
AND c.deleted_at IS NULL
ORDER BY c.priority DESC, c.created_at DESC;

-- Get case workload by user
SELECT 
    u.first_name || ' ' || u.last_name as user_name,
    COUNT(*) as total_cases,
    COUNT(CASE WHEN c.status = 'in-progress' THEN 1 END) as active_cases,
    COUNT(CASE WHEN c.status = 'approved' THEN 1 END) as approved_cases,
    COUNT(CASE WHEN c.status = 'rejected' THEN 1 END) as rejected_cases,
    AVG(EXTRACT(EPOCH FROM (c.updated_at - c.created_at))/3600) as avg_processing_hours
FROM cases c
JOIN users u ON c.assigned_to = u.id
WHERE c.created_at >= CURRENT_DATE - INTERVAL '30 days'
AND c.deleted_at IS NULL
GROUP BY u.id, u.first_name, u.last_name
ORDER BY total_cases DESC;

-- Get case status summary
SELECT 
    status,
    COUNT(*) as case_count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_processing_hours,
    MIN(created_at) as oldest_case,
    MAX(created_at) as newest_case
FROM cases
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
AND deleted_at IS NULL
GROUP BY status
ORDER BY case_count DESC;

-- =============================================================================
-- 5. DOCUMENT MANAGEMENT QUERIES
-- =============================================================================

-- Get documents for a case
SELECT 
    d.id,
    dt.name as document_type,
    dt.category,
    d.file_name,
    d.status,
    d.uploaded_at,
    d.verified_at,
    u.first_name || ' ' || u.last_name as reviewed_by,
    d.notes
FROM documents d
JOIN document_types dt ON d.document_type_id = dt.id
LEFT JOIN users u ON d.reviewed_by = u.id
WHERE d.case_id = 1
AND d.deleted_at IS NULL
ORDER BY dt.priority DESC, d.uploaded_at ASC;

-- Get pending document verifications
SELECT 
    d.id,
    c.case_number,
    cust.first_name || ' ' || cust.last_name as customer_name,
    dt.name as document_type,
    d.file_name,
    d.uploaded_at,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - d.uploaded_at))/3600 as hours_since_upload
FROM documents d
JOIN cases c ON d.case_id = c.id
JOIN customers cust ON c.customer_id = cust.id
JOIN users u ON cust.user_id = u.id
JOIN document_types dt ON d.document_type_id = dt.id
WHERE d.status = 'received'
AND d.deleted_at IS NULL
ORDER BY d.uploaded_at ASC;

-- Get document verification statistics
SELECT 
    dt.category,
    dt.name as document_type,
    COUNT(*) as total_documents,
    COUNT(CASE WHEN d.status = 'verified' THEN 1 END) as verified_count,
    COUNT(CASE WHEN d.status = 'rejected' THEN 1 END) as rejected_count,
    COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as pending_count,
    ROUND(
        COUNT(CASE WHEN d.status = 'verified' THEN 1 END)::NUMERIC / 
        COUNT(*)::NUMERIC * 100, 2
    ) as verification_rate
FROM documents d
JOIN document_types dt ON d.document_type_id = dt.id
WHERE d.created_at >= CURRENT_DATE - INTERVAL '30 days'
AND d.deleted_at IS NULL
GROUP BY dt.category, dt.name
ORDER BY verification_rate DESC;

-- =============================================================================
-- 6. COMPLIANCE AND AUDIT QUERIES
-- =============================================================================

-- Get compliance logs for a case
SELECT 
    cl.id,
    cl.action,
    u.first_name || ' ' || u.last_name as user_name,
    cl.details,
    cl.log_type,
    cl.created_at
FROM compliance_logs cl
LEFT JOIN users u ON cl.user_id = u.id
WHERE cl.case_id = 1
ORDER BY cl.created_at DESC;

-- Get audit trail for a user
SELECT 
    al.id,
    al.action,
    al.resource_type,
    al.resource_id,
    al.old_values,
    al.new_values,
    al.ip_address,
    al.created_at
FROM audit_logs al
WHERE al.user_id = 1
ORDER BY al.created_at DESC
LIMIT 50;

-- Get security alerts
SELECT 
    sa.id,
    cust.first_name || ' ' || cust.last_name as customer_name,
    sa.alert_type,
    sa.severity,
    sa.description,
    sa.status,
    sa.created_at
FROM security_alerts sa
JOIN customers cust ON sa.customer_id = cust.id
WHERE sa.status = 'open'
ORDER BY sa.severity DESC, sa.created_at DESC;

-- Get suspicious activity report
SELECT 
    a.account_number,
    cust.first_name || ' ' || cust.last_name as customer_name,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount,
    MAX(t.amount) as max_transaction,
    MIN(t.created_at) as first_transaction,
    MAX(t.created_at) as last_transaction
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers cust ON a.customer_id = cust.id
WHERE t.created_at >= CURRENT_DATE - INTERVAL '1 day'
AND t.amount > 100000  -- Transactions > 1 lakh
GROUP BY a.account_number, cust.first_name, cust.last_name
HAVING COUNT(*) > 10  -- More than 10 transactions in a day
ORDER BY total_amount DESC;

-- =============================================================================
-- 7. REPORTING QUERIES
-- =============================================================================

-- Get daily transaction summary report
SELECT 
    DATE(t.created_at) as transaction_date,
    tt.category,
    COUNT(*) as transaction_count,
    SUM(t.amount) as total_amount,
    AVG(t.amount) as avg_amount,
    MIN(t.amount) as min_amount,
    MAX(t.amount) as max_amount
FROM transactions t
JOIN transaction_types tt ON t.transaction_type_id = tt.id
WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days'
AND t.status = 'completed'
GROUP BY DATE(t.created_at), tt.category
ORDER BY transaction_date DESC, total_amount DESC;

-- Get loan disbursement report
SELECT 
    c.loan_type,
    COUNT(*) as loan_count,
    SUM(c.loan_amount) as total_disbursed,
    AVG(c.loan_amount) as avg_loan_amount,
    COUNT(CASE WHEN c.status = 'approved' THEN 1 END) as approved_count,
    COUNT(CASE WHEN c.status = 'rejected' THEN 1 END) as rejected_count
FROM cases c
WHERE c.created_at >= CURRENT_DATE - INTERVAL '30 days'
AND c.deleted_at IS NULL
GROUP BY c.loan_type
ORDER BY total_disbursed DESC;

-- Get user activity report
SELECT 
    u.first_name || ' ' || u.last_name as user_name,
    r.name as role,
    COUNT(DISTINCT c.id) as cases_handled,
    COUNT(DISTINCT d.id) as documents_verified,
    COUNT(DISTINCT al.id) as audit_actions,
    MAX(u.last_login_at) as last_login
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN cases c ON u.id = c.assigned_to AND c.created_at >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN documents d ON u.id = d.reviewed_by AND d.created_at >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN audit_logs al ON u.id = al.user_id AND al.created_at >= CURRENT_DATE - INTERVAL '30 days'
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.first_name, u.last_name, r.name
ORDER BY cases_handled DESC;

-- =============================================================================
-- 8. WHATSAPP INTEGRATION QUERIES
-- =============================================================================

-- Get WhatsApp messages for a case
SELECT 
    wm.id,
    wm.message_type,
    wm.content,
    wm.sender,
    wm.timestamp,
    d.file_name as document_name
FROM whatsapp_messages wm
LEFT JOIN documents d ON wm.document_id = d.id
WHERE wm.case_id = 1
ORDER BY wm.timestamp ASC;

-- Get recent WhatsApp activity
SELECT 
    c.case_number,
    cust.first_name || ' ' || cust.last_name as customer_name,
    COUNT(wm.id) as message_count,
    MAX(wm.timestamp) as last_message_time
FROM whatsapp_messages wm
JOIN cases c ON wm.case_id = c.id
JOIN customers cust ON c.customer_id = cust.id
JOIN users u ON cust.user_id = u.id
WHERE wm.timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY c.id, c.case_number, cust.first_name, cust.last_name
ORDER BY last_message_time DESC;

-- =============================================================================
-- 9. PERFORMANCE MONITORING QUERIES
-- =============================================================================

-- Get database performance metrics
SELECT * FROM performance_metrics;

-- Get slow queries
SELECT * FROM get_slow_queries(1000);

-- Get table bloat information
SELECT * FROM get_table_bloat();

-- Get database health check
SELECT * FROM database_health_check();

-- =============================================================================
-- 10. UTILITY QUERIES
-- =============================================================================

-- Get system statistics
SELECT 
    'Total Users' as metric,
    COUNT(*)::TEXT as value
FROM users WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Total Customers',
    COUNT(*)::TEXT
FROM customers WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Total Accounts',
    COUNT(*)::TEXT
FROM accounts WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Total Transactions',
    COUNT(*)::TEXT
FROM transactions WHERE deleted_at IS NULL
UNION ALL
SELECT 
    'Active Cases',
    COUNT(*)::TEXT
FROM cases WHERE status = 'in-progress' AND deleted_at IS NULL
UNION ALL
SELECT 
    'Pending Documents',
    COUNT(*)::TEXT
FROM documents WHERE status = 'pending' AND deleted_at IS NULL;

-- Get recent system activity
SELECT 
    'Recent Logins' as activity_type,
    COUNT(*) as count,
    MAX(last_login_at) as last_activity
FROM users 
WHERE last_login_at >= CURRENT_DATE - INTERVAL '1 day'
UNION ALL
SELECT 
    'New Cases Today',
    COUNT(*),
    MAX(created_at)
FROM cases 
WHERE created_at >= CURRENT_DATE
UNION ALL
SELECT 
    'Transactions Today',
    COUNT(*),
    MAX(created_at)
FROM transactions 
WHERE created_at >= CURRENT_DATE
UNION ALL
SELECT 
    'Documents Uploaded Today',
    COUNT(*),
    MAX(uploaded_at)
FROM documents 
WHERE uploaded_at >= CURRENT_DATE;
