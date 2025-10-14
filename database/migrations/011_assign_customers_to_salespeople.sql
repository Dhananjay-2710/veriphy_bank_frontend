-- =============================================================================
-- ASSIGN CUSTOMERS TO SALESPEOPLE (HELPER SCRIPT)
-- =============================================================================
-- This script helps assign existing customers to salespeople
-- Run this AFTER migration 010 if you have existing customers without assignments
-- =============================================================================

-- Option 1: Auto-assign customers evenly to all active salespeople in the same organization
-- This distributes customers round-robin style

WITH ranked_customers AS (
    SELECT 
        c.id as customer_id,
        c.organization_id,
        ROW_NUMBER() OVER (PARTITION BY c.organization_id ORDER BY c.id) as customer_rank
    FROM customers c
    WHERE c.user_id IS NULL  -- Only unassigned customers
),
ranked_salespeople AS (
    SELECT 
        u.id as salesperson_id,
        u.organization_id,
        ROW_NUMBER() OVER (PARTITION BY u.organization_id ORDER BY u.id) as salesperson_rank,
        COUNT(*) OVER (PARTITION BY u.organization_id) as salespeople_count
    FROM users u
    WHERE u.role = 'salesperson' AND u.is_active = true
)
UPDATE customers c
SET user_id = rs.salesperson_id
FROM ranked_customers rc
JOIN ranked_salespeople rs ON rs.organization_id = rc.organization_id
WHERE c.id = rc.customer_id
AND rs.salesperson_rank = ((rc.customer_rank - 1) % rs.salespeople_count) + 1;

-- Verify the assignment
SELECT 
    u.full_name as salesperson_name,
    u.organization_id,
    COUNT(c.id) as assigned_customers
FROM users u
LEFT JOIN customers c ON c.user_id = u.id
WHERE u.role = 'salesperson' AND u.is_active = true
GROUP BY u.id, u.full_name, u.organization_id
ORDER BY u.organization_id, assigned_customers DESC;

-- =============================================================================
-- Option 2: Assign specific customers to specific salesperson (MANUAL)
-- =============================================================================
-- Replace the IDs with your actual values

-- Example: Assign customers 1, 2, 3 to salesperson with ID 10
/*
UPDATE customers 
SET user_id = 10 
WHERE id IN (1, 2, 3);
*/

-- Example: Assign all customers from a specific organization to a salesperson
/*
UPDATE customers 
SET user_id = 10 
WHERE organization_id = 1 AND user_id IS NULL;
*/

-- =============================================================================
-- Option 3: Assign customers based on team membership
-- =============================================================================
-- This assigns customers to salespeople based on their team, round-robin within each team

WITH ranked_customers AS (
    SELECT 
        c.id as customer_id,
        c.organization_id,
        ROW_NUMBER() OVER (PARTITION BY c.organization_id ORDER BY c.id) as customer_rank
    FROM customers c
    WHERE c.user_id IS NULL
),
team_salespeople AS (
    SELECT 
        u.id as salesperson_id,
        u.organization_id,
        u.team_id,
        t.team_type,
        ROW_NUMBER() OVER (PARTITION BY u.team_id ORDER BY u.id) as team_position,
        COUNT(*) OVER (PARTITION BY u.team_id) as team_size
    FROM users u
    JOIN teams t ON t.id = u.team_id
    WHERE u.role = 'salesperson' 
    AND u.is_active = true
    AND t.is_active = true
    AND t.team_type = 'sales'
)
UPDATE customers c
SET user_id = ts.salesperson_id
FROM ranked_customers rc
JOIN team_salespeople ts ON ts.organization_id = rc.organization_id
WHERE c.id = rc.customer_id
AND ts.team_position = ((rc.customer_rank - 1) % ts.team_size) + 1;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
SELECT '✅ Customer assignment completed!' as status;
SELECT 'Check the verification query above to see the distribution' as next_step;

