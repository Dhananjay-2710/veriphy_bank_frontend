-- Veriphy Bank Database Optimizations
-- Partitioning strategy for high-volume tables

-- 1. Partition transactions table by date (monthly partitions)
-- This is crucial for a banking system with high transaction volume

-- Drop existing transactions table and recreate as partitioned
DROP TABLE IF EXISTS transactions CASCADE;

CREATE TABLE transactions (
    id BIGSERIAL,
    account_id BIGINT NOT NULL,
    transaction_type_id BIGINT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reference_id VARCHAR(100),
    status transaction_status DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for transactions (current year + 2 years ahead)
DO $$
DECLARE
    start_date DATE := '2025-01-01';
    end_date DATE := '2027-12-31';
    current_date DATE := start_date;
    partition_name TEXT;
    next_month DATE;
BEGIN
    WHILE current_date <= end_date LOOP
        next_month := current_date + INTERVAL '1 month';
        partition_name := 'transactions_' || to_char(current_date, 'YYYY_MM');
        
        EXECUTE format('CREATE TABLE %I PARTITION OF transactions
            FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            current_date,
            next_month
        );
        
        -- Create indexes on partition
        EXECUTE format('CREATE INDEX %I ON %I (account_id)',
            'idx_' || partition_name || '_account_id',
            partition_name
        );
        
        EXECUTE format('CREATE INDEX %I ON %I (status)',
            'idx_' || partition_name || '_status',
            partition_name
        );
        
        EXECUTE format('CREATE INDEX %I ON %I (created_at)',
            'idx_' || partition_name || '_created_at',
            partition_name
        );
        
        current_date := next_month;
    END LOOP;
END $$;

-- 2. Partition audit_logs table by date (monthly partitions)
DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE audit_logs (
    id BIGSERIAL,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for audit_logs
DO $$
DECLARE
    start_date DATE := '2025-01-01';
    end_date DATE := '2027-12-31';
    current_date DATE := start_date;
    partition_name TEXT;
    next_month DATE;
BEGIN
    WHILE current_date <= end_date LOOP
        next_month := current_date + INTERVAL '1 month';
        partition_name := 'audit_logs_' || to_char(current_date, 'YYYY_MM');
        
        EXECUTE format('CREATE TABLE %I PARTITION OF audit_logs
            FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            current_date,
            next_month
        );
        
        -- Create indexes on partition
        EXECUTE format('CREATE INDEX %I ON %I (user_id)',
            'idx_' || partition_name || '_user_id',
            partition_name
        );
        
        EXECUTE format('CREATE INDEX %I ON %I (resource_type, resource_id)',
            'idx_' || partition_name || '_resource',
            partition_name
        );
        
        current_date := next_month;
    END LOOP;
END $$;

-- 3. Partition compliance_logs table by date (monthly partitions)
DROP TABLE IF EXISTS compliance_logs CASCADE;

CREATE TABLE compliance_logs (
    id BIGSERIAL,
    case_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    user_id BIGINT,
    details TEXT,
    log_type log_type DEFAULT 'info',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for compliance_logs
DO $$
DECLARE
    start_date DATE := '2025-01-01';
    end_date DATE := '2027-12-31';
    current_date DATE := start_date;
    partition_name TEXT;
    next_month DATE;
BEGIN
    WHILE current_date <= end_date LOOP
        next_month := current_date + INTERVAL '1 month';
        partition_name := 'compliance_logs_' || to_char(current_date, 'YYYY_MM');
        
        EXECUTE format('CREATE TABLE %I PARTITION OF compliance_logs
            FOR VALUES FROM (%L) TO (%L)',
            partition_name,
            current_date,
            next_month
        );
        
        -- Create indexes on partition
        EXECUTE format('CREATE INDEX %I ON %I (case_id)',
            'idx_' || partition_name || '_case_id',
            partition_name
        );
        
        EXECUTE format('CREATE INDEX %I ON %I (log_type)',
            'idx_' || partition_name || '_log_type',
            partition_name
        );
        
        current_date := next_month;
    END LOOP;
END $$;

-- 4. Create function to automatically create new partitions
CREATE OR REPLACE FUNCTION create_monthly_partitions()
RETURNS VOID AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    next_month DATE := current_date + INTERVAL '1 month';
    partition_name TEXT;
    table_name TEXT;
    tables TEXT[] := ARRAY['transactions', 'audit_logs', 'compliance_logs'];
BEGIN
    FOREACH table_name IN ARRAY tables LOOP
        partition_name := table_name || '_' || to_char(current_date, 'YYYY_MM');
        
        -- Check if partition already exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = partition_name
        ) THEN
            EXECUTE format('CREATE TABLE %I PARTITION OF %I
                FOR VALUES FROM (%L) TO (%L)',
                partition_name,
                table_name,
                current_date,
                next_month
            );
            
            -- Create indexes
            EXECUTE format('CREATE INDEX %I ON %I (created_at)',
                'idx_' || partition_name || '_created_at',
                partition_name
            );
            
            RAISE NOTICE 'Created partition %', partition_name;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to drop old partitions (for data retention)
CREATE OR REPLACE FUNCTION drop_old_partitions(retention_months INTEGER DEFAULT 12)
RETURNS VOID AS $$
DECLARE
    cutoff_date DATE := CURRENT_DATE - (retention_months || ' months')::INTERVAL;
    partition_name TEXT;
    table_name TEXT;
    tables TEXT[] := ARRAY['transactions', 'audit_logs', 'compliance_logs'];
    partition_date DATE;
BEGIN
    FOREACH table_name IN ARRAY tables LOOP
        FOR partition_name IN 
            SELECT tablename FROM pg_tables 
            WHERE tablename LIKE table_name || '_%'
            AND tablename ~ '^\d{4}_\d{2}$'
        LOOP
            -- Extract date from partition name
            partition_date := to_date(
                substring(partition_name from length(table_name) + 2), 
                'YYYY_MM'
            );
            
            IF partition_date < cutoff_date THEN
                EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', partition_name);
                RAISE NOTICE 'Dropped old partition %', partition_name;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. Create additional performance indexes
-- Composite indexes for common query patterns

-- Transactions table indexes
CREATE INDEX CONCURRENTLY idx_transactions_account_status_created 
ON transactions (account_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY idx_transactions_type_amount_created 
ON transactions (transaction_type_id, amount, created_at DESC);

CREATE INDEX CONCURRENTLY idx_transactions_reference_status 
ON transactions (reference_id, status) WHERE reference_id IS NOT NULL;

-- Cases table indexes
CREATE INDEX CONCURRENTLY idx_cases_customer_status_priority 
ON cases (customer_id, status, priority, created_at DESC);

CREATE INDEX CONCURRENTLY idx_cases_assigned_status_created 
ON cases (assigned_to, status, created_at DESC) WHERE assigned_to IS NOT NULL;

-- Documents table indexes
CREATE INDEX CONCURRENTLY idx_documents_case_status_type 
ON documents (case_id, status, document_type_id);

CREATE INDEX CONCURRENTLY idx_documents_uploaded_verified 
ON documents (uploaded_at, verified_at) WHERE uploaded_at IS NOT NULL;

-- Customer table indexes
CREATE INDEX CONCURRENTLY idx_customers_kyc_employment 
ON customers (kyc_status, employment_type, created_at);

-- 7. Create partial indexes for better performance
-- Index for active accounts only
CREATE INDEX CONCURRENTLY idx_accounts_active_balance 
ON accounts (customer_id, balance) 
WHERE status = 'active' AND deleted_at IS NULL;

-- Index for pending transactions only
CREATE INDEX CONCURRENTLY idx_transactions_pending_created 
ON transactions (account_id, created_at) 
WHERE status = 'pending';

-- Index for verified documents only
CREATE INDEX CONCURRENTLY idx_documents_verified_type 
ON documents (case_id, document_type_id) 
WHERE status = 'verified';

-- Index for open security alerts only
CREATE INDEX CONCURRENTLY idx_security_alerts_open_severity 
ON security_alerts (customer_id, severity, created_at) 
WHERE status = 'open';

-- 8. Create covering indexes for common queries
-- Covering index for account summary queries
CREATE INDEX CONCURRENTLY idx_accounts_covering 
ON accounts (id, customer_id, account_type_id, balance, status, opened_at) 
INCLUDE (account_number, closed_at);

-- Covering index for transaction history queries
CREATE INDEX CONCURRENTLY idx_transactions_covering 
ON transactions (account_id, created_at DESC) 
INCLUDE (id, transaction_type_id, amount, status, description, processed_at);

-- 9. Create function to analyze table statistics
CREATE OR REPLACE FUNCTION analyze_partitioned_tables()
RETURNS VOID AS $$
DECLARE
    table_name TEXT;
    tables TEXT[] := ARRAY['transactions', 'audit_logs', 'compliance_logs'];
BEGIN
    FOREACH table_name IN ARRAY tables LOOP
        EXECUTE format('ANALYZE %I', table_name);
        RAISE NOTICE 'Analyzed table %', table_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 10. Create view for partition monitoring
CREATE OR REPLACE VIEW partition_monitoring AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_stat_get_tuples_returned(c.oid) as tuples_returned,
    pg_stat_get_tuples_fetched(c.oid) as tuples_fetched,
    pg_stat_get_tuples_inserted(c.oid) as tuples_inserted,
    pg_stat_get_tuples_updated(c.oid) as tuples_updated,
    pg_stat_get_tuples_deleted(c.oid) as tuples_deleted
FROM pg_tables pt
JOIN pg_class c ON c.relname = pt.tablename
WHERE pt.tablename LIKE '%_20%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
