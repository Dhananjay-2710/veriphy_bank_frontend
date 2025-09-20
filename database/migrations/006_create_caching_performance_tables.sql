-- =============================================================================
-- CACHING & PERFORMANCE TABLES MIGRATION
-- =============================================================================
-- Migration: 006_create_caching_performance_tables.sql
-- Description: Creates tables for application caching, cache concurrency, and database migrations
-- Created: 2024-12-19
-- =============================================================================

-- =============================================================================
-- CACHE TABLE
-- =============================================================================
-- Stores application-level cache data for performance optimization

CREATE TABLE IF NOT EXISTS cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    cache_key VARCHAR(255) NOT NULL,
    cache_value JSONB NOT NULL,
    cache_type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'general', 'query', 'session', 'api_response'
    tags TEXT[] DEFAULT '{}', -- Array of tags for cache invalidation
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    size_bytes INTEGER DEFAULT 0,
    is_compressed BOOLEAN DEFAULT FALSE,
    compression_type VARCHAR(20) DEFAULT NULL, -- 'gzip', 'brotli', etc.
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT cache_key_org_unique UNIQUE (organization_id, cache_key),
    CONSTRAINT cache_expires_future CHECK (expires_at > created_at),
    CONSTRAINT cache_size_positive CHECK (size_bytes >= 0),
    CONSTRAINT cache_access_count_positive CHECK (access_count >= 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cache_organization_id ON cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_type ON cache(cache_type);
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_accessed_at ON cache(accessed_at);
CREATE INDEX IF NOT EXISTS idx_cache_tags ON cache USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_cache_created_at ON cache(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cache_org_type_expires ON cache(organization_id, cache_type, expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_org_key_expires ON cache(organization_id, cache_key, expires_at);

-- =============================================================================
-- CACHE_LOCKS TABLE
-- =============================================================================
-- Manages cache concurrency and prevents race conditions

CREATE TABLE IF NOT EXISTS cache_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    lock_key VARCHAR(255) NOT NULL,
    lock_type VARCHAR(50) NOT NULL DEFAULT 'exclusive', -- 'exclusive', 'shared', 'read', 'write'
    locked_by VARCHAR(255) NOT NULL, -- Process ID, session ID, or user ID
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    acquired_count INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT cache_locks_key_org_unique UNIQUE (organization_id, lock_key),
    CONSTRAINT cache_locks_expires_future CHECK (expires_at > locked_at),
    CONSTRAINT cache_locks_acquired_positive CHECK (acquired_count > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cache_locks_organization_id ON cache_locks(organization_id);
CREATE INDEX IF NOT EXISTS idx_cache_locks_key ON cache_locks(lock_key);
CREATE INDEX IF NOT EXISTS idx_cache_locks_type ON cache_locks(lock_type);
CREATE INDEX IF NOT EXISTS idx_cache_locks_locked_by ON cache_locks(locked_by);
CREATE INDEX IF NOT EXISTS idx_cache_locks_expires_at ON cache_locks(expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_locks_locked_at ON cache_locks(locked_at);

-- =============================================================================
-- MIGRATIONS TABLE
-- =============================================================================
-- Tracks database migrations and schema changes

CREATE TABLE IF NOT EXISTS migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    migration_version VARCHAR(50) NOT NULL,
    migration_type VARCHAR(50) NOT NULL DEFAULT 'schema', -- 'schema', 'data', 'function', 'trigger', 'index'
    description TEXT,
    sql_content TEXT NOT NULL,
    checksum VARCHAR(64) NOT NULL, -- SHA-256 hash of the migration content
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    applied_by VARCHAR(255) NOT NULL, -- User or system that applied the migration
    execution_time_ms INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'success', -- 'success', 'failed', 'rolled_back'
    error_message TEXT DEFAULT NULL,
    rollback_sql TEXT DEFAULT NULL,
    rollback_applied_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    rollback_applied_by VARCHAR(255) DEFAULT NULL,
    dependencies TEXT[] DEFAULT '{}', -- Array of migration names this depends on
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT migrations_version_format CHECK (migration_version ~ '^\d+\.\d+\.\d+$'),
    CONSTRAINT migrations_execution_time_positive CHECK (execution_time_ms >= 0),
    CONSTRAINT migrations_status_valid CHECK (status IN ('success', 'failed', 'rolled_back'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_migrations_name ON migrations(migration_name);
CREATE INDEX IF NOT EXISTS idx_migrations_version ON migrations(migration_version);
CREATE INDEX IF NOT EXISTS idx_migrations_type ON migrations(migration_type);
CREATE INDEX IF NOT EXISTS idx_migrations_applied_at ON migrations(applied_at);
CREATE INDEX IF NOT EXISTS idx_migrations_status ON migrations(status);
CREATE INDEX IF NOT EXISTS idx_migrations_applied_by ON migrations(applied_by);

-- =============================================================================
-- CACHE STATISTICS TABLE
-- =============================================================================
-- Tracks cache performance metrics and statistics

CREATE TABLE IF NOT EXISTS cache_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    cache_type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    total_requests INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    average_response_time_ms DECIMAL(10,3) DEFAULT 0,
    peak_memory_usage_bytes BIGINT DEFAULT 0,
    eviction_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT cache_stats_org_type_date_unique UNIQUE (organization_id, cache_type, date),
    CONSTRAINT cache_stats_requests_positive CHECK (total_requests >= 0),
    CONSTRAINT cache_stats_hits_positive CHECK (cache_hits >= 0),
    CONSTRAINT cache_stats_misses_positive CHECK (cache_misses >= 0),
    CONSTRAINT cache_stats_size_positive CHECK (total_size_bytes >= 0),
    CONSTRAINT cache_stats_response_time_positive CHECK (average_response_time_ms >= 0),
    CONSTRAINT cache_stats_peak_memory_positive CHECK (peak_memory_usage_bytes >= 0),
    CONSTRAINT cache_stats_evictions_positive CHECK (eviction_count >= 0),
    CONSTRAINT cache_stats_errors_positive CHECK (error_count >= 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cache_stats_organization_id ON cache_statistics(organization_id);
CREATE INDEX IF NOT EXISTS idx_cache_stats_type ON cache_statistics(cache_type);
CREATE INDEX IF NOT EXISTS idx_cache_stats_date ON cache_statistics(date);
CREATE INDEX IF NOT EXISTS idx_cache_stats_org_type_date ON cache_statistics(organization_id, cache_type, date);

-- =============================================================================
-- CACHE INVALIDATION LOGS TABLE
-- =============================================================================
-- Logs cache invalidation events for debugging and monitoring

CREATE TABLE IF NOT EXISTS cache_invalidation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    cache_key VARCHAR(255) NOT NULL,
    invalidation_type VARCHAR(50) NOT NULL, -- 'manual', 'automatic', 'expired', 'tag_based', 'pattern_based'
    invalidation_reason TEXT,
    invalidated_by VARCHAR(255) NOT NULL, -- User ID or system process
    invalidated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    affected_tags TEXT[] DEFAULT '{}',
    cache_size_before INTEGER DEFAULT 0,
    cache_size_after INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT cache_inv_logs_size_before_positive CHECK (cache_size_before >= 0),
    CONSTRAINT cache_inv_logs_size_after_positive CHECK (cache_size_after >= 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cache_inv_logs_organization_id ON cache_invalidation_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_cache_inv_logs_key ON cache_invalidation_logs(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_inv_logs_type ON cache_invalidation_logs(invalidation_type);
CREATE INDEX IF NOT EXISTS idx_cache_inv_logs_invalidated_at ON cache_invalidation_logs(invalidated_at);
CREATE INDEX IF NOT EXISTS idx_cache_inv_logs_invalidated_by ON cache_invalidation_logs(invalidated_by);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup
    INSERT INTO cache_invalidation_logs (
        organization_id,
        cache_key,
        invalidation_type,
        invalidation_reason,
        invalidated_by,
        invalidated_at
    ) VALUES (
        NULL, -- System-wide cleanup
        'CLEANUP_EXPIRED',
        'automatic',
        'Expired cache entries cleaned up',
        'system',
        NOW()
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired cache locks
CREATE OR REPLACE FUNCTION cleanup_expired_cache_locks()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cache_locks WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get cache hit ratio
CREATE OR REPLACE FUNCTION get_cache_hit_ratio(
    p_organization_id UUID DEFAULT NULL,
    p_cache_type VARCHAR(50) DEFAULT NULL,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    cache_type VARCHAR(50),
    hit_ratio DECIMAL(5,4),
    total_requests BIGINT,
    cache_hits BIGINT,
    cache_misses BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.cache_type,
        CASE 
            WHEN cs.total_requests > 0 THEN 
                ROUND((cs.cache_hits::DECIMAL / cs.total_requests::DECIMAL)::DECIMAL, 4)
            ELSE 0::DECIMAL
        END as hit_ratio,
        cs.total_requests,
        cs.cache_hits,
        cs.cache_misses
    FROM cache_statistics cs
    WHERE 
        (p_organization_id IS NULL OR cs.organization_id = p_organization_id)
        AND (p_cache_type IS NULL OR cs.cache_type = p_cache_type)
        AND cs.date >= CURRENT_DATE - INTERVAL '1 day' * p_days
    ORDER BY cs.date DESC, cs.cache_type;
END;
$$ LANGUAGE plpgsql;

-- Function to invalidate cache by tags
CREATE OR REPLACE FUNCTION invalidate_cache_by_tags(
    p_organization_id UUID,
    p_tags TEXT[],
    p_invalidated_by VARCHAR(255) DEFAULT 'system'
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    cache_record RECORD;
BEGIN
    -- Get cache records to be deleted for logging
    FOR cache_record IN 
        SELECT cache_key, size_bytes 
        FROM cache 
        WHERE organization_id = p_organization_id 
        AND tags && p_tags
    LOOP
        -- Log the invalidation
        INSERT INTO cache_invalidation_logs (
            organization_id,
            cache_key,
            invalidation_type,
            invalidation_reason,
            invalidated_by,
            invalidated_at,
            affected_tags,
            cache_size_before,
            cache_size_after
        ) VALUES (
            p_organization_id,
            cache_record.cache_key,
            'tag_based',
            'Cache invalidated by tags: ' || array_to_string(p_tags, ', '),
            p_invalidated_by,
            NOW(),
            p_tags,
            cache_record.size_bytes,
            0
        );
    END LOOP;
    
    -- Delete the cache entries
    DELETE FROM cache 
    WHERE organization_id = p_organization_id 
    AND tags && p_tags;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update triggers for updated_at columns
CREATE TRIGGER update_cache_updated_at
    BEFORE UPDATE ON cache
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cache_statistics_updated_at
    BEFORE UPDATE ON cache_statistics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_invalidation_logs ENABLE ROW LEVEL SECURITY;

-- Cache table policies
CREATE POLICY "Users can view cache for their organization" ON cache
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert cache for their organization" ON cache
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can update cache for their organization" ON cache
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete cache for their organization" ON cache
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Cache locks table policies
CREATE POLICY "Users can view cache locks for their organization" ON cache_locks
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage cache locks for their organization" ON cache_locks
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Migrations table policies (admin only)
CREATE POLICY "Only admins can view migrations" ON migrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can manage migrations" ON migrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Cache statistics table policies
CREATE POLICY "Users can view cache statistics for their organization" ON cache_statistics
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "System can manage cache statistics" ON cache_statistics
    FOR ALL USING (true); -- System processes need full access

-- Cache invalidation logs table policies
CREATE POLICY "Users can view cache invalidation logs for their organization" ON cache_invalidation_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "System can manage cache invalidation logs" ON cache_invalidation_logs
    FOR ALL USING (true); -- System processes need full access

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Insert initial migration record for this migration
INSERT INTO migrations (
    migration_name,
    migration_version,
    migration_type,
    description,
    sql_content,
    checksum,
    applied_by,
    execution_time_ms,
    status
) VALUES (
    '006_create_caching_performance_tables',
    '1.0.0',
    'schema',
    'Creates tables for application caching, cache concurrency, and database migrations',
    'See migration file: 006_create_caching_performance_tables.sql',
    'sha256_hash_placeholder', -- This would be calculated in practice
    'system',
    0,
    'success'
);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE cache IS 'Stores application-level cache data for performance optimization';
COMMENT ON TABLE cache_locks IS 'Manages cache concurrency and prevents race conditions';
COMMENT ON TABLE migrations IS 'Tracks database migrations and schema changes';
COMMENT ON TABLE cache_statistics IS 'Tracks cache performance metrics and statistics';
COMMENT ON TABLE cache_invalidation_logs IS 'Logs cache invalidation events for debugging and monitoring';

COMMENT ON COLUMN cache.cache_key IS 'Unique identifier for the cached data within an organization';
COMMENT ON COLUMN cache.cache_value IS 'The actual cached data stored as JSONB';
COMMENT ON COLUMN cache.cache_type IS 'Type of cache: general, query, session, api_response';
COMMENT ON COLUMN cache.tags IS 'Array of tags for cache invalidation and categorization';
COMMENT ON COLUMN cache.expires_at IS 'When the cache entry expires and should be removed';
COMMENT ON COLUMN cache.accessed_at IS 'Last time the cache entry was accessed';
COMMENT ON COLUMN cache.access_count IS 'Number of times the cache entry has been accessed';
COMMENT ON COLUMN cache.size_bytes IS 'Size of the cached data in bytes';
COMMENT ON COLUMN cache.is_compressed IS 'Whether the cached data is compressed';
COMMENT ON COLUMN cache.compression_type IS 'Type of compression used (gzip, brotli, etc.)';

COMMENT ON COLUMN cache_locks.lock_key IS 'Unique identifier for the lock within an organization';
COMMENT ON COLUMN cache_locks.lock_type IS 'Type of lock: exclusive, shared, read, write';
COMMENT ON COLUMN cache_locks.locked_by IS 'Process ID, session ID, or user ID that holds the lock';
COMMENT ON COLUMN cache_locks.expires_at IS 'When the lock expires and should be released';
COMMENT ON COLUMN cache_locks.acquired_count IS 'Number of times the lock has been acquired';

COMMENT ON COLUMN migrations.migration_name IS 'Unique name of the migration';
COMMENT ON COLUMN migrations.migration_version IS 'Version number in semantic versioning format';
COMMENT ON COLUMN migrations.migration_type IS 'Type of migration: schema, data, function, trigger, index';
COMMENT ON COLUMN migrations.sql_content IS 'The SQL content of the migration';
COMMENT ON COLUMN migrations.checksum IS 'SHA-256 hash of the migration content for integrity';
COMMENT ON COLUMN migrations.applied_by IS 'User or system that applied the migration';
COMMENT ON COLUMN migrations.execution_time_ms IS 'Time taken to execute the migration in milliseconds';
COMMENT ON COLUMN migrations.status IS 'Status of the migration: success, failed, rolled_back';
COMMENT ON COLUMN migrations.dependencies IS 'Array of migration names this migration depends on';

COMMENT ON COLUMN cache_statistics.cache_type IS 'Type of cache being measured';
COMMENT ON COLUMN cache_statistics.date IS 'Date for which statistics are recorded';
COMMENT ON COLUMN cache_statistics.total_requests IS 'Total number of cache requests';
COMMENT ON COLUMN cache_statistics.cache_hits IS 'Number of successful cache hits';
COMMENT ON COLUMN cache_statistics.cache_misses IS 'Number of cache misses';
COMMENT ON COLUMN cache_statistics.total_size_bytes IS 'Total size of cached data in bytes';
COMMENT ON COLUMN cache_statistics.average_response_time_ms IS 'Average response time in milliseconds';
COMMENT ON COLUMN cache_statistics.peak_memory_usage_bytes IS 'Peak memory usage in bytes';
COMMENT ON COLUMN cache_statistics.eviction_count IS 'Number of cache evictions';

COMMENT ON COLUMN cache_invalidation_logs.cache_key IS 'Key of the cache entry that was invalidated';
COMMENT ON COLUMN cache_invalidation_logs.invalidation_type IS 'Type of invalidation: manual, automatic, expired, tag_based, pattern_based';
COMMENT ON COLUMN cache_invalidation_logs.invalidation_reason IS 'Reason for the cache invalidation';
COMMENT ON COLUMN cache_invalidation_logs.invalidated_by IS 'User ID or system process that triggered the invalidation';
COMMENT ON COLUMN cache_invalidation_logs.affected_tags IS 'Tags that were used for invalidation';
COMMENT ON COLUMN cache_invalidation_logs.cache_size_before IS 'Size of cache before invalidation';
COMMENT ON COLUMN cache_invalidation_logs.cache_size_after IS 'Size of cache after invalidation';
