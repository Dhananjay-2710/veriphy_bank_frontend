-- =============================================================================
-- AUTHENTICATION & SYSTEM TABLES MIGRATION
-- =============================================================================
-- This migration creates the missing authentication and system tables
-- Required for: Authentication management, Session tracking, User role assignments,
-- Password reset functionality, API access management

-- =============================================================================
-- 1. AUTH_ACCOUNTS TABLE
-- =============================================================================
-- Manages user authentication accounts and credentials

CREATE TABLE IF NOT EXISTS auth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'email',
    provider_account_id TEXT,
    email TEXT,
    password_hash TEXT,
    salt TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    phone_verified BOOLEAN DEFAULT FALSE,
    phone_verified_at TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    backup_codes TEXT[],
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    last_login_user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for auth_accounts
CREATE INDEX IF NOT EXISTS idx_auth_accounts_user_id ON auth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_email ON auth_accounts(email);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_provider ON auth_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_provider_account_id ON auth_accounts(provider_account_id);
CREATE INDEX IF NOT EXISTS idx_auth_accounts_is_active ON auth_accounts(is_active);

-- =============================================================================
-- 2. SESSIONS TABLE
-- =============================================================================
-- Manages user sessions and session tracking

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    login_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    logout_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    is_remembered BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity_at ON sessions(last_activity_at);

-- =============================================================================
-- 3. USER_ROLES TABLE (Enhanced)
-- =============================================================================
-- Manages user role assignments (enhancing existing table if it exists)

-- Check if user_roles table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') THEN
        CREATE TABLE user_roles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
            organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
            assigned_by UUID REFERENCES users(id),
            assigned_at TIMESTAMPTZ DEFAULT NOW(),
            revoked_at TIMESTAMPTZ,
            revoked_by UUID REFERENCES users(id),
            is_active BOOLEAN DEFAULT TRUE,
            is_primary BOOLEAN DEFAULT FALSE,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, role_id, organization_id)
        );

        -- Indexes for user_roles
        CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON user_roles(organization_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_department_id ON user_roles(department_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);
        CREATE INDEX IF NOT EXISTS idx_user_roles_is_primary ON user_roles(is_primary);
    ELSE
        -- Add missing columns if table exists but columns are missing
        ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE CASCADE;
        ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES users(id);
        ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();
        ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
        ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS revoked_by UUID REFERENCES users(id);
        ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;
        ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
        
        -- Add unique constraint if it doesn't exist
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'user_roles_user_role_org_unique'
            ) THEN
                ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_role_org_unique 
                UNIQUE(user_id, role_id, organization_id);
            END IF;
        END $$;
    END IF;
END $$;

-- =============================================================================
-- 4. PASSWORD_RESET_TOKENS TABLE
-- =============================================================================
-- Manages password reset tokens and temporary access

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for password_reset_tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_is_used ON password_reset_tokens(is_used);

-- =============================================================================
-- 5. PERSONAL_ACCESS_TOKENS TABLE
-- =============================================================================
-- Manages API access tokens for programmatic access

CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    token_preview TEXT NOT NULL, -- First 8 characters for display
    scopes TEXT[] DEFAULT '{}',
    last_used_at TIMESTAMPTZ,
    last_used_ip INET,
    last_used_user_agent TEXT,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for personal_access_tokens
CREATE INDEX IF NOT EXISTS idx_personal_access_tokens_user_id ON personal_access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_access_tokens_token_hash ON personal_access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_personal_access_tokens_is_active ON personal_access_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_personal_access_tokens_expires_at ON personal_access_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_personal_access_tokens_last_used_at ON personal_access_tokens(last_used_at);

-- =============================================================================
-- 6. AUTHENTICATION AUDIT LOG TABLE
-- =============================================================================
-- Tracks authentication events for security and compliance

CREATE TABLE IF NOT EXISTS auth_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- login, logout, password_change, token_created, etc.
    event_description TEXT,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    success BOOLEAN NOT NULL,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for auth_audit_log
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user_id ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_session_id ON auth_audit_log(session_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_event_type ON auth_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_success ON auth_audit_log(success);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_created_at ON auth_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_ip_address ON auth_audit_log(ip_address);

-- =============================================================================
-- 7. API_RATE_LIMITS TABLE
-- =============================================================================
-- Manages API rate limiting per user/token

CREATE TABLE IF NOT EXISTS api_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_id UUID REFERENCES personal_access_tokens(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    window_duration INTERVAL DEFAULT '1 hour',
    max_requests INTEGER DEFAULT 1000,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_until TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for api_rate_limits
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_user_id ON api_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_token_id ON api_rate_limits(token_id);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_endpoint ON api_rate_limits(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window_start ON api_rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_is_blocked ON api_rate_limits(is_blocked);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_auth_accounts_updated_at ON auth_accounts;
CREATE TRIGGER update_auth_accounts_updated_at
    BEFORE UPDATE ON auth_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_password_reset_tokens_updated_at ON password_reset_tokens;
CREATE TRIGGER update_password_reset_tokens_updated_at
    BEFORE UPDATE ON password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personal_access_tokens_updated_at ON personal_access_tokens;
CREATE TRIGGER update_personal_access_tokens_updated_at
    BEFORE UPDATE ON personal_access_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_rate_limits_updated_at ON api_rate_limits;
CREATE TRIGGER update_api_rate_limits_updated_at
    BEFORE UPDATE ON api_rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions 
    WHERE expires_at < NOW() 
    AND is_active = TRUE;
    
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() 
    AND is_used = FALSE;
    
    DELETE FROM personal_access_tokens 
    WHERE expires_at < NOW() 
    AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to generate secure token
CREATE OR REPLACE FUNCTION generate_secure_token(length INTEGER DEFAULT 32)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to hash password
CREATE OR REPLACE FUNCTION hash_password(password TEXT, salt TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Using bcrypt-like hashing (simplified for demo)
    -- In production, use proper bcrypt or argon2
    RETURN encode(sha256((password || salt)::bytea), 'hex');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE auth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auth_accounts
CREATE POLICY "Users can view their own auth accounts" ON auth_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own auth accounts" ON auth_accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions" ON sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for password_reset_tokens
CREATE POLICY "Users can view their own password reset tokens" ON password_reset_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for personal_access_tokens
CREATE POLICY "Users can view their own access tokens" ON personal_access_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own access tokens" ON personal_access_tokens
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for auth_audit_log
CREATE POLICY "Users can view their own audit logs" ON auth_audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for api_rate_limits
CREATE POLICY "Users can view their own rate limits" ON api_rate_limits
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- INITIAL DATA INSERTION
-- =============================================================================

-- Insert default roles if they don't exist
INSERT INTO roles (name, description, permissions, is_active) VALUES
    ('super_admin', 'Super Administrator with full system access', 
     '["*"]', true),
    ('admin', 'Administrator with organization-level access', 
     '["users:manage", "cases:manage", "reports:view", "settings:manage"]', true),
    ('manager', 'Manager with department-level access', 
     '["cases:view", "cases:assign", "reports:view", "team:manage"]', true),
    ('credit_ops', 'Credit Operations specialist', 
     '["cases:view", "cases:process", "documents:verify", "reports:view"]', true),
    ('salesperson', 'Sales representative', 
     '["cases:create", "cases:view", "customers:manage"]', true),
    ('compliance', 'Compliance officer', 
     '["cases:view", "compliance:manage", "reports:view"]', true)
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE auth_accounts IS 'Manages user authentication accounts and credentials';
COMMENT ON TABLE sessions IS 'Manages user sessions and session tracking';
COMMENT ON TABLE user_roles IS 'Manages user role assignments with organization/department context';
COMMENT ON TABLE password_reset_tokens IS 'Manages password reset tokens and temporary access';
COMMENT ON TABLE personal_access_tokens IS 'Manages API access tokens for programmatic access';
COMMENT ON TABLE auth_audit_log IS 'Tracks authentication events for security and compliance';
COMMENT ON TABLE api_rate_limits IS 'Manages API rate limiting per user/token';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log the completion
INSERT INTO audit_log (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    metadata
) VALUES (
    (SELECT id FROM organizations LIMIT 1),
    NULL,
    'migration_completed',
    'database',
    'authentication_tables',
    'Created authentication and system tables: auth_accounts, sessions, user_roles, password_reset_tokens, personal_access_tokens, auth_audit_log, api_rate_limits',
    '{"migration": "005_create_authentication_tables", "version": "1.0.0"}'
) ON CONFLICT DO NOTHING;
