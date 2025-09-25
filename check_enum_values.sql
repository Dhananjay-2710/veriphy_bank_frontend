-- =============================================================================
-- CHECK VALID ENUM VALUES IN YOUR DATABASE
-- =============================================================================

-- Check what enum values are valid for case_status_t
SELECT 'Valid case_status_t enum values:' as info;
SELECT unnest(enum_range(NULL::case_status_t)) as valid_status_values;

-- Check if there are any existing cases and their statuses
SELECT 'Existing cases and their statuses:' as info;
SELECT DISTINCT status, COUNT(*) as count 
FROM cases 
GROUP BY status 
ORDER BY status;

-- Check the actual enum type definition
SELECT 'Enum type definition:' as info;
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'case_status_t'
ORDER BY e.enumsortorder;

-- Check if there are other enum types that might be relevant
SELECT 'All enum types in the database:' as info;
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typtype = 'e'
ORDER BY t.typname, e.enumsortorder;