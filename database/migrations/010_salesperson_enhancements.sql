-- =============================================================================
-- SALESPERSON DASHBOARD ENHANCEMENTS
-- =============================================================================
-- This migration adds necessary fields and indexes for salesperson functionality
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- Step 1: Ensure customers.user_id exists and is properly indexed
-- (This links customers to their assigned salesperson)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE customers ADD COLUMN user_id BIGINT REFERENCES users(id);
    END IF;
END $$;

-- Create index on user_id for fast lookup of salesperson's customers
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_kyc_status ON customers(kyc_status);

-- Step 2: Ensure cases have proper indexes for salesperson queries
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_customer_id ON cases(customer_id);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);

-- Step 3: Add monthly_target to users table for salesperson targets
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'monthly_target'
    ) THEN
        ALTER TABLE users ADD COLUMN monthly_target NUMERIC(15, 2) DEFAULT 2500000.00;
    END IF;
END $$;

-- Step 4: Add achieved_amount to users table for tracking
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'achieved_amount'
    ) THEN
        ALTER TABLE users ADD COLUMN achieved_amount NUMERIC(15, 2) DEFAULT 0.00;
    END IF;
END $$;

-- Step 5: Ensure teams table has proper indexes
CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_manager_id ON teams(manager_id);
CREATE INDEX IF NOT EXISTS idx_teams_team_type ON teams(team_type);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);

-- Step 6: Ensure users.team_id exists and is indexed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'team_id'
    ) THEN
        ALTER TABLE users ADD COLUMN team_id BIGINT REFERENCES teams(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Step 7: Ensure tasks table has proper indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Step 8: Ensure documents table has proper indexes
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- =============================================================================
-- SALESPERSON PERFORMANCE VIEW
-- =============================================================================
-- Create a materialized view for fast salesperson performance queries

CREATE MATERIALIZED VIEW IF NOT EXISTS salesperson_performance AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.organization_id,
    u.team_id,
    u.monthly_target,
    u.achieved_amount,
    
    -- Customer metrics
    COUNT(DISTINCT c.id) as total_customers,
    COUNT(DISTINCT CASE WHEN c.kyc_status = 'verified' THEN c.id END) as verified_customers,
    COUNT(DISTINCT CASE WHEN c.kyc_status = 'pending' THEN c.id END) as pending_kyc_customers,
    
    -- Case metrics
    COUNT(DISTINCT ca.id) as total_cases,
    COUNT(DISTINCT CASE WHEN ca.status = 'open' THEN ca.id END) as open_cases,
    COUNT(DISTINCT CASE WHEN ca.status = 'in_progress' THEN ca.id END) as active_cases,
    COUNT(DISTINCT CASE WHEN ca.status = 'closed' THEN ca.id END) as completed_cases,
    COUNT(DISTINCT CASE WHEN ca.status = 'rejected' THEN ca.id END) as rejected_cases,
    COUNT(DISTINCT CASE WHEN ca.priority = 'high' THEN ca.id END) as high_priority_cases,
    
    -- Amount metrics
    COALESCE(SUM(CASE WHEN ca.status = 'closed' THEN ca.loan_amount END), 0) as total_closed_amount,
    COALESCE(SUM(CASE WHEN ca.status = 'in_progress' THEN ca.loan_amount END), 0) as pipeline_amount,
    
    -- Task metrics
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'open' THEN t.id END) as open_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'overdue' THEN t.id END) as overdue_tasks,
    
    -- Document metrics
    COUNT(DISTINCT d.id) as total_documents,
    COUNT(DISTINCT CASE WHEN d.status = 'pending' THEN d.id END) as pending_documents,
    COUNT(DISTINCT CASE WHEN d.status = 'verified' THEN d.id END) as verified_documents,
    
    -- Time metrics
    MAX(u.last_login_at) as last_login_at,
    MAX(ca.updated_at) as last_case_activity,
    
    -- Current month metrics
    COUNT(DISTINCT CASE 
        WHEN ca.status = 'closed' 
        AND DATE_TRUNC('month', ca.updated_at) = DATE_TRUNC('month', CURRENT_DATE) 
        THEN ca.id 
    END) as completed_this_month,
    
    COALESCE(SUM(CASE 
        WHEN ca.status = 'closed' 
        AND DATE_TRUNC('month', ca.updated_at) = DATE_TRUNC('month', CURRENT_DATE) 
        THEN ca.loan_amount 
    END), 0) as achieved_this_month

FROM users u
LEFT JOIN customers c ON c.user_id = u.id
LEFT JOIN cases ca ON ca.assigned_to = u.id
LEFT JOIN tasks t ON t.assigned_to = u.id
LEFT JOIN documents d ON d.customer_id = c.id
WHERE u.role = 'salesperson' AND u.is_active = true
GROUP BY u.id, u.full_name, u.email, u.organization_id, u.team_id, u.monthly_target, u.achieved_amount;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_salesperson_performance_user_id ON salesperson_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_salesperson_performance_org_id ON salesperson_performance(organization_id);
CREATE INDEX IF NOT EXISTS idx_salesperson_performance_team_id ON salesperson_performance(team_id);

-- =============================================================================
-- TEAM LEADERBOARD VIEW
-- =============================================================================
-- Create a view for team rankings and leaderboard

CREATE OR REPLACE VIEW team_leaderboard AS
SELECT 
    sp.user_id,
    sp.full_name,
    sp.email,
    sp.organization_id,
    sp.team_id,
    t.name as team_name,
    sp.monthly_target,
    sp.achieved_this_month,
    sp.completed_this_month,
    sp.active_cases,
    sp.total_customers,
    
    -- Calculate conversion rate
    CASE 
        WHEN sp.total_cases > 0 THEN 
            ROUND((sp.completed_cases::numeric / sp.total_cases::numeric) * 100, 2)
        ELSE 0 
    END as conversion_rate,
    
    -- Calculate target achievement percentage
    CASE 
        WHEN sp.monthly_target > 0 THEN 
            ROUND((sp.achieved_this_month / sp.monthly_target) * 100, 2)
        ELSE 0 
    END as target_achievement_percentage,
    
    -- Rank within team
    RANK() OVER (
        PARTITION BY sp.team_id 
        ORDER BY sp.achieved_this_month DESC, sp.completed_this_month DESC
    ) as team_rank,
    
    -- Overall rank in organization
    RANK() OVER (
        PARTITION BY sp.organization_id 
        ORDER BY sp.achieved_this_month DESC, sp.completed_this_month DESC
    ) as overall_rank,
    
    -- Performance score (weighted)
    (
        (sp.completed_this_month * 30) + 
        (sp.achieved_this_month / 100000 * 40) + 
        (CASE WHEN sp.total_cases > 0 THEN (sp.completed_cases::numeric / sp.total_cases::numeric) * 30 ELSE 0 END)
    ) as performance_score

FROM salesperson_performance sp
LEFT JOIN teams t ON t.id = sp.team_id
WHERE sp.user_id IS NOT NULL
ORDER BY performance_score DESC;

-- =============================================================================
-- FUNCTION TO REFRESH PERFORMANCE DATA
-- =============================================================================
-- Create a function to refresh the materialized view

CREATE OR REPLACE FUNCTION refresh_salesperson_performance()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY salesperson_performance;
END;
$$;

-- =============================================================================
-- SCHEDULED REFRESH (Optional - requires pg_cron extension)
-- =============================================================================
-- Uncomment the following if you have pg_cron enabled:
-- SELECT cron.schedule('refresh-salesperson-performance', '*/15 * * * *', 'SELECT refresh_salesperson_performance()');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these to verify the setup:

-- Check if customers have user_id
SELECT 
    'customers.user_id' as check_name,
    COUNT(*) as total_customers,
    COUNT(user_id) as customers_with_salesperson,
    COUNT(*) - COUNT(user_id) as unassigned_customers
FROM customers;

-- Check if users have team_id
SELECT 
    'users.team_id' as check_name,
    COUNT(*) as total_users,
    COUNT(team_id) as users_in_teams,
    COUNT(*) - COUNT(team_id) as users_without_team
FROM users
WHERE role = 'salesperson';

-- Check salesperson performance view
SELECT 
    'salesperson_performance' as check_name,
    COUNT(*) as total_salespeople,
    SUM(total_customers) as total_customers_assigned,
    SUM(active_cases) as total_active_cases,
    SUM(completed_this_month) as total_completed_this_month
FROM salesperson_performance;

-- Check team leaderboard
SELECT 
    'team_leaderboard' as check_name,
    COUNT(*) as total_salespeople,
    COUNT(DISTINCT team_id) as total_teams
FROM team_leaderboard;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
SELECT '✅ Salesperson enhancements completed successfully!' as status;
SELECT 'Run the verification queries above to check the setup' as next_step;

