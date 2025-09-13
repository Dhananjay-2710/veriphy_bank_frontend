-- Veriphy Bank Database Performance Tuning
-- Advanced optimization strategies for high-performance banking operations

-- 1. Connection Pooling Configuration
-- These settings should be applied to postgresql.conf

/*
# Connection Settings
max_connections = 200
shared_buffers = 4GB                    # 25% of RAM
effective_cache_size = 12GB             # 75% of RAM
work_mem = 64MB                         # For complex queries
maintenance_work_mem = 1GB              # For maintenance operations

# Checkpoint Settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
max_wal_size = 4GB
min_wal_size = 1GB

# Query Planner
random_page_cost = 1.1                  # For SSD storage
effective_io_concurrency = 200          # For SSD storage
seq_page_cost = 1.0

# Logging for Performance Monitoring
log_min_duration_statement = 1000       # Log queries > 1 second
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0
*/

-- 2. Create specialized indexes for banking queries

-- Index for balance inquiries (most frequent query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_balances_account_balance 
ON balances (account_id, balance, available_balance, last_updated);

-- Index for transaction history with pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_pagination 
ON transactions (account_id, created_at DESC, id DESC) 
WHERE deleted_at IS NULL;

-- Index for case assignment queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_workload 
ON cases (assigned_to, status, priority, created_at) 
WHERE assigned_to IS NOT NULL AND deleted_at IS NULL;

-- Index for KYC verification workflow
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_kyc_workflow 
ON documents (case_id, document_type_id, status, uploaded_at) 
WHERE deleted_at IS NULL;

-- Index for compliance reporting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_reporting 
ON compliance_logs (case_id, log_type, created_at) 
WHERE created_at >= CURRENT_DATE - INTERVAL '1 year';

-- 3. Create materialized views for frequently accessed aggregated data

-- Account summary materialized view
CREATE MATERIALIZED VIEW mv_account_summary AS
SELECT 
    a.id as account_id,
    a.account_number,
    a.customer_id,
    c.first_name || ' ' || c.last_name as customer_name,
    at.name as account_type,
    b.balance,
    b.available_balance,
    a.status,
    a.opened_at,
    CASE 
        WHEN a.status = 'active' THEN 'Active'
        WHEN a.status = 'frozen' THEN 'Frozen'
        WHEN a.status = 'closed' THEN 'Closed'
        ELSE 'Suspended'
    END as status_display
FROM accounts a
JOIN customers c ON a.customer_id = c.id
JOIN account_types at ON a.account_type_id = at.id
LEFT JOIN balances b ON a.id = b.account_id
WHERE a.deleted_at IS NULL;

CREATE UNIQUE INDEX idx_mv_account_summary_account_id 
ON mv_account_summary (account_id);

CREATE INDEX idx_mv_account_summary_customer 
ON mv_account_summary (customer_id, status);

-- Transaction summary materialized view
CREATE MATERIALIZED VIEW mv_transaction_summary AS
SELECT 
    account_id,
    DATE_TRUNC('day', created_at) as transaction_date,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN tt.is_debit THEN amount ELSE 0 END) as total_debits,
    SUM(CASE WHEN NOT tt.is_debit THEN amount ELSE 0 END) as total_credits,
    SUM(CASE WHEN NOT tt.is_debit THEN amount ELSE -amount END) as net_amount
FROM transactions t
JOIN transaction_types tt ON t.transaction_type_id = tt.id
WHERE t.deleted_at IS NULL
GROUP BY account_id, DATE_TRUNC('day', created_at);

CREATE UNIQUE INDEX idx_mv_transaction_summary_unique 
ON mv_transaction_summary (account_id, transaction_date);

CREATE INDEX idx_mv_transaction_summary_date 
ON mv_transaction_summary (transaction_date);

-- Case performance metrics
CREATE MATERIALIZED VIEW mv_case_metrics AS
SELECT 
    assigned_to,
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_cases,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_cases,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_cases,
    COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as active_cases,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_processing_hours
FROM cases
WHERE deleted_at IS NULL
GROUP BY assigned_to, DATE_TRUNC('month', created_at);

CREATE UNIQUE INDEX idx_mv_case_metrics_unique 
ON mv_case_metrics (assigned_to, month);

-- 4. Create refresh functions for materialized views
CREATE OR REPLACE FUNCTION refresh_account_summary()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_account_summary;
    RAISE NOTICE 'Account summary materialized view refreshed';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_transaction_summary()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_transaction_summary;
    RAISE NOTICE 'Transaction summary materialized view refreshed';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_case_metrics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_case_metrics;
    RAISE NOTICE 'Case metrics materialized view refreshed';
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS VOID AS $$
BEGIN
    PERFORM refresh_account_summary();
    PERFORM refresh_transaction_summary();
    PERFORM refresh_case_metrics();
    RAISE NOTICE 'All materialized views refreshed';
END;
$$ LANGUAGE plpgsql;

-- 6. Create scheduled job for materialized view refresh (requires pg_cron extension)
-- This should be run as a superuser
/*
SELECT cron.schedule('refresh-mv-account-summary', '0 */6 * * *', 'SELECT refresh_account_summary();');
SELECT cron.schedule('refresh-mv-transaction-summary', '0 */2 * * *', 'SELECT refresh_transaction_summary();');
SELECT cron.schedule('refresh-mv-case-metrics', '0 0 * * *', 'SELECT refresh_case_metrics();');
*/

-- 7. Create specialized functions for common banking operations

-- Function to get account balance with caching
CREATE OR REPLACE FUNCTION get_cached_account_balance(p_account_id BIGINT)
RETURNS TABLE (
    account_number VARCHAR(20),
    balance DECIMAL(15,2),
    available_balance DECIMAL(15,2),
    frozen_amount DECIMAL(15,2),
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.account_number,
        b.balance,
        b.available_balance,
        b.frozen_amount,
        b.last_updated
    FROM accounts a
    LEFT JOIN balances b ON a.id = b.account_id
    WHERE a.id = p_account_id
    AND a.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get transaction history with optimized pagination
CREATE OR REPLACE FUNCTION get_optimized_transaction_history(
    p_account_id BIGINT,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_from_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_to_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    id BIGINT,
    transaction_type VARCHAR(50),
    amount DECIMAL(15,2),
    status transaction_status,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    processed_at TIMESTAMP WITH TIME ZONE,
    total_count BIGINT
) AS $$
DECLARE
    total_records BIGINT;
BEGIN
    -- Get total count for pagination
    SELECT COUNT(*) INTO total_records
    FROM transactions t
    WHERE t.account_id = p_account_id
    AND t.deleted_at IS NULL
    AND (p_from_date IS NULL OR t.created_at >= p_from_date)
    AND (p_to_date IS NULL OR t.created_at <= p_to_date);
    
    RETURN QUERY
    SELECT 
        t.id,
        tt.name as transaction_type,
        t.amount,
        t.status,
        t.description,
        t.created_at,
        t.processed_at,
        total_records
    FROM transactions t
    JOIN transaction_types tt ON t.transaction_type_id = tt.id
    WHERE t.account_id = p_account_id
    AND t.deleted_at IS NULL
    AND (p_from_date IS NULL OR t.created_at >= p_from_date)
    AND (p_to_date IS NULL OR t.created_at <= p_to_date)
    ORDER BY t.created_at DESC, t.id DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. Create function for bulk operations

-- Function to process bulk transactions
CREATE OR REPLACE FUNCTION process_bulk_transactions(
    p_transactions JSONB
)
RETURNS TABLE (
    transaction_id BIGINT,
    account_id BIGINT,
    amount DECIMAL(15,2),
    status transaction_status,
    error_message TEXT
) AS $$
DECLARE
    transaction_record JSONB;
    new_transaction_id BIGINT;
    transaction_amount DECIMAL(15,2);
    account_id_val BIGINT;
    transaction_type_id_val BIGINT;
    error_msg TEXT;
BEGIN
    FOR transaction_record IN SELECT * FROM jsonb_array_elements(p_transactions)
    LOOP
        BEGIN
            -- Extract values
            account_id_val := (transaction_record->>'account_id')::BIGINT;
            transaction_amount := (transaction_record->>'amount')::DECIMAL(15,2);
            transaction_type_id_val := (transaction_record->>'transaction_type_id')::BIGINT;
            
            -- Validate transaction limits
            PERFORM check_transaction_limits(account_id_val, transaction_amount, 'bulk_transfer');
            
            -- Insert transaction
            INSERT INTO transactions (
                account_id, 
                transaction_type_id, 
                amount, 
                reference_id, 
                status, 
                description
            ) VALUES (
                account_id_val,
                transaction_type_id_val,
                transaction_amount,
                transaction_record->>'reference_id',
                'pending',
                transaction_record->>'description'
            ) RETURNING id INTO new_transaction_id;
            
            -- Update status to completed
            UPDATE transactions 
            SET status = 'completed', processed_at = CURRENT_TIMESTAMP
            WHERE id = new_transaction_id;
            
            -- Return success
            RETURN QUERY SELECT new_transaction_id, account_id_val, transaction_amount, 'completed'::transaction_status, NULL::TEXT;
            
        EXCEPTION WHEN OTHERS THEN
            -- Return error
            RETURN QUERY SELECT NULL::BIGINT, account_id_val, transaction_amount, 'failed'::transaction_status, SQLERRM::TEXT;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. Create monitoring and alerting functions

-- Function to detect slow queries
CREATE OR REPLACE FUNCTION get_slow_queries(min_duration_ms INTEGER DEFAULT 1000)
RETURNS TABLE (
    query TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    max_time DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_statements.query,
        pg_stat_statements.calls,
        pg_stat_statements.total_exec_time,
        pg_stat_statements.mean_exec_time,
        pg_stat_statements.max_exec_time
    FROM pg_stat_statements
    WHERE pg_stat_statements.mean_exec_time > min_duration_ms
    ORDER BY pg_stat_statements.mean_exec_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Function to get table bloat information
CREATE OR REPLACE FUNCTION get_table_bloat()
RETURNS TABLE (
    table_name TEXT,
    table_size TEXT,
    bloat_ratio NUMERIC,
    wasted_bytes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        ROUND(
            (pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename))::NUMERIC / 
            pg_total_relation_size(schemaname||'.'||tablename)::NUMERIC * 100, 2
        ) as bloat_ratio,
        pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename) as wasted_bytes
    FROM pg_tables
    WHERE schemaname = 'public'
    AND pg_total_relation_size(schemaname||'.'||tablename) > 1000000  -- Only tables > 1MB
    ORDER BY wasted_bytes DESC;
END;
$$ LANGUAGE plpgsql;

-- 10. Create maintenance procedures

-- Function to perform routine maintenance
CREATE OR REPLACE FUNCTION perform_routine_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Update table statistics
    ANALYZE;
    
    -- Refresh materialized views
    PERFORM refresh_all_materialized_views();
    
    -- Clean up expired sessions
    PERFORM cleanup_expired_sessions();
    
    -- Create new partitions if needed
    PERFORM create_monthly_partitions();
    
    -- Drop old partitions
    PERFORM drop_old_partitions(12); -- Keep 12 months of data
    
    RAISE NOTICE 'Routine maintenance completed';
END;
$$ LANGUAGE plpgsql;

-- 11. Create performance monitoring views

-- View for database performance metrics
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
    'Database Size' as metric,
    pg_size_pretty(pg_database_size(current_database())) as value
UNION ALL
SELECT 
    'Active Connections',
    current_setting('max_connections')::INTEGER - (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle')::TEXT
UNION ALL
SELECT 
    'Cache Hit Ratio',
    ROUND(
        (sum(blks_hit)::NUMERIC / (sum(blks_hit) + sum(blks_read))) * 100, 2
    )::TEXT || '%'
FROM pg_stat_database
WHERE datname = current_database()
UNION ALL
SELECT 
    'Transaction Rate',
    ROUND(
        (SELECT count(*) FROM transactions WHERE created_at >= CURRENT_DATE)::NUMERIC / 
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - CURRENT_DATE)) * 3600, 2
    )::TEXT || ' txns/hour';

-- 12. Create indexes for full-text search (if needed)
-- Enable full-text search on document content and case descriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_content_search 
ON documents USING gin(to_tsvector('english', COALESCE(notes, '') || ' ' || COALESCE(file_name, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cases_description_search 
ON cases USING gin(to_tsvector('english', COALESCE(description, '')));

-- 13. Create function for database health check
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
DECLARE
    db_size BIGINT;
    cache_hit_ratio NUMERIC;
    active_connections INTEGER;
    max_connections INTEGER;
    long_running_queries INTEGER;
BEGIN
    -- Check database size
    SELECT pg_database_size(current_database()) INTO db_size;
    
    -- Check cache hit ratio
    SELECT ROUND(
        (sum(blks_hit)::NUMERIC / (sum(blks_hit) + sum(blks_read))) * 100, 2
    ) INTO cache_hit_ratio
    FROM pg_stat_database
    WHERE datname = current_database();
    
    -- Check connections
    SELECT count(*) INTO active_connections FROM pg_stat_activity WHERE state = 'active';
    SELECT current_setting('max_connections')::INTEGER INTO max_connections;
    
    -- Check for long-running queries
    SELECT count(*) INTO long_running_queries
    FROM pg_stat_activity
    WHERE state = 'active' 
    AND query_start < CURRENT_TIMESTAMP - INTERVAL '5 minutes';
    
    -- Return health check results
    RETURN QUERY
    SELECT 'Database Size'::TEXT, 
           CASE WHEN db_size < 1000000000 THEN 'OK' ELSE 'WARNING' END::TEXT,
           pg_size_pretty(db_size)::TEXT
    UNION ALL
    SELECT 'Cache Hit Ratio'::TEXT,
           CASE WHEN cache_hit_ratio > 95 THEN 'OK' ELSE 'WARNING' END::TEXT,
           cache_hit_ratio::TEXT || '%'
    UNION ALL
    SELECT 'Active Connections'::TEXT,
           CASE WHEN active_connections < max_connections * 0.8 THEN 'OK' ELSE 'WARNING' END::TEXT,
           active_connections::TEXT || '/' || max_connections::TEXT
    UNION ALL
    SELECT 'Long Running Queries'::TEXT,
           CASE WHEN long_running_queries = 0 THEN 'OK' ELSE 'WARNING' END::TEXT,
           long_running_queries::TEXT;
END;
$$ LANGUAGE plpgsql;
