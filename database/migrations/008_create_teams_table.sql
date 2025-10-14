-- =============================================================================
-- TEAM MANAGEMENT SYSTEM MIGRATION
-- =============================================================================
-- This migration creates the teams table and adds team_id to users table
-- Teams allow managers to organize users into groups for better management

-- =============================================================================
-- 1. CREATE TEAMS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id BIGINT NOT NULL,
    manager_id BIGINT,
    team_type VARCHAR(50) DEFAULT 'sales', -- sales, credit-ops, compliance, etc.
    is_active BOOLEAN DEFAULT true,
    target_cases_per_month INTEGER DEFAULT 50,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraints
    CONSTRAINT fk_teams_organization FOREIGN KEY (organization_id) 
        REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_teams_manager FOREIGN KEY (manager_id) 
        REFERENCES users(id) ON DELETE SET NULL,
    
    -- Ensure unique team names per organization
    CONSTRAINT unique_team_name_per_org UNIQUE (organization_id, name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON teams(manager_id);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);
CREATE INDEX IF NOT EXISTS idx_teams_team_type ON teams(team_type);

-- =============================================================================
-- 2. ADD TEAM_ID COLUMN TO USERS TABLE
-- =============================================================================

-- Add team_id column to users table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'team_id'
    ) THEN
        ALTER TABLE users ADD COLUMN team_id BIGINT;
        
        -- Add foreign key constraint
        ALTER TABLE users ADD CONSTRAINT fk_users_team 
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
        
        -- Create index for better query performance
        CREATE INDEX idx_users_team_id ON users(team_id);
    END IF;
END $$;

-- =============================================================================
-- 3. CREATE TEAM_MEMBERS VIEW (for easy querying)
-- =============================================================================

CREATE OR REPLACE VIEW team_members_view AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    t.organization_id,
    t.manager_id,
    u.id as user_id,
    u.full_name as user_name,
    u.email as user_email,
    u.role as user_role,
    u.is_active as is_active,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'open' OR c.status = 'in_progress') as active_cases,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'closed') as completed_cases
FROM teams t
LEFT JOIN users u ON u.team_id = t.id
LEFT JOIN cases c ON c.assigned_to = u.id
GROUP BY t.id, t.name, t.organization_id, t.manager_id, u.id, u.full_name, u.email, u.role, u.is_active;

-- =============================================================================
-- 4. CREATE UPDATED_AT TRIGGER FOR TEAMS TABLE
-- =============================================================================

CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_teams_updated_at();

-- =============================================================================
-- 5. INSERT DEFAULT TEAMS (based on organizations)
-- =============================================================================

-- Create default teams for each organization
INSERT INTO teams (name, description, organization_id, team_type, is_active, target_cases_per_month)
SELECT 
    CONCAT(o.name, ' - Sales Team') as name,
    CONCAT('Primary sales team for ', o.name) as description,
    o.id as organization_id,
    'sales' as team_type,
    true as is_active,
    50 as target_cases_per_month
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.organization_id = o.id AND t.team_type = 'sales'
)
ON CONFLICT (organization_id, name) DO NOTHING;

-- Create credit operations teams
INSERT INTO teams (name, description, organization_id, team_type, is_active, target_cases_per_month)
SELECT 
    CONCAT(o.name, ' - Credit Operations') as name,
    CONCAT('Credit operations team for ', o.name) as description,
    o.id as organization_id,
    'credit-ops' as team_type,
    true as is_active,
    30 as target_cases_per_month
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.organization_id = o.id AND t.team_type = 'credit-ops'
)
ON CONFLICT (organization_id, name) DO NOTHING;

-- Create compliance teams
INSERT INTO teams (name, description, organization_id, team_type, is_active, target_cases_per_month)
SELECT 
    CONCAT(o.name, ' - Compliance Team') as name,
    CONCAT('Compliance team for ', o.name) as description,
    o.id as organization_id,
    'compliance' as team_type,
    true as is_active,
    20 as target_cases_per_month
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.organization_id = o.id AND t.team_type = 'compliance'
)
ON CONFLICT (organization_id, name) DO NOTHING;

-- =============================================================================
-- 6. AUTO-ASSIGN USERS TO TEAMS BASED ON THEIR ROLE
-- =============================================================================

-- Assign salespersons to sales teams
UPDATE users u
SET team_id = (
    SELECT t.id 
    FROM teams t 
    WHERE t.organization_id = u.organization_id 
    AND t.team_type = 'sales' 
    AND t.is_active = true 
    LIMIT 1
)
WHERE u.role = 'salesperson' 
AND u.team_id IS NULL
AND u.organization_id IS NOT NULL;

-- Assign credit-ops to credit operations teams
UPDATE users u
SET team_id = (
    SELECT t.id 
    FROM teams t 
    WHERE t.organization_id = u.organization_id 
    AND t.team_type = 'credit-ops' 
    AND t.is_active = true 
    LIMIT 1
)
WHERE u.role = 'credit-ops' 
AND u.team_id IS NULL
AND u.organization_id IS NOT NULL;

-- Assign compliance users to compliance teams
UPDATE users u
SET team_id = (
    SELECT t.id 
    FROM teams t 
    WHERE t.organization_id = u.organization_id 
    AND t.team_type = 'compliance' 
    AND t.is_active = true 
    LIMIT 1
)
WHERE u.role = 'compliance' 
AND u.team_id IS NULL
AND u.organization_id IS NOT NULL;

-- Assign managers to the appropriate teams (they manage the teams)
UPDATE teams t
SET manager_id = (
    SELECT u.id 
    FROM users u 
    WHERE u.organization_id = t.organization_id 
    AND u.role = 'manager' 
    AND u.is_active = true 
    LIMIT 1
)
WHERE t.manager_id IS NULL;

-- =============================================================================
-- 7. VERIFICATION QUERIES
-- =============================================================================

-- View all teams
-- SELECT * FROM teams ORDER BY organization_id, team_type;

-- View team members
-- SELECT * FROM team_members_view ORDER BY team_id, user_name;

-- View users with their teams
-- SELECT 
--     u.id, u.full_name, u.role, u.email,
--     t.name as team_name, t.team_type
-- FROM users u
-- LEFT JOIN teams t ON u.team_id = t.id
-- ORDER BY u.organization_id, t.name;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Output success message
SELECT 
    'Teams table created successfully!' as status,
    COUNT(*) as total_teams 
FROM teams;

SELECT 
    'Users assigned to teams successfully!' as status,
    COUNT(*) as users_with_teams 
FROM users 
WHERE team_id IS NOT NULL;

