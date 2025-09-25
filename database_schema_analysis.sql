-- =============================================================================
-- COMPREHENSIVE DATABASE SCHEMA ANALYSIS & VALIDATION
-- =============================================================================

-- 1. COMPLETE TABLE STRUCTURE ANALYSIS
SELECT 'COMPLETE TABLE STRUCTURE:' as analysis_type;
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    c.character_maximum_length,
    CASE 
        WHEN c.data_type = 'USER-DEFINED' THEN c.udt_name
        ELSE c.data_type 
    END as actual_type
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 2. ALL ENUM TYPES AND THEIR VALUES
SELECT 'ALL ENUM TYPES:' as analysis_type;
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typtype = 'e'
ORDER BY t.typname, e.enumsortorder;

-- 3. FOREIGN KEY RELATIONSHIPS
SELECT 'FOREIGN KEY RELATIONSHIPS:' as analysis_type;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 4. PRIMARY KEY CONSTRAINTS
SELECT 'PRIMARY KEY CONSTRAINTS:' as analysis_type;
SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 5. UNIQUE CONSTRAINTS
SELECT 'UNIQUE CONSTRAINTS:' as analysis_type;
SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 6. NOT NULL CONSTRAINTS
SELECT 'NOT NULL CONSTRAINTS:' as analysis_type;
SELECT 
    table_name,
    column_name,
    'NOT NULL' as constraint_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND is_nullable = 'NO'
ORDER BY table_name, column_name;

-- 7. INDEXES
SELECT 'DATABASE INDEXES:' as analysis_type;
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 8. DATA SAMPLE FOR EACH TABLE
SELECT 'DATA SAMPLE - USERS:' as analysis_type;
SELECT * FROM users LIMIT 3;

SELECT 'DATA SAMPLE - CASES:' as analysis_type;
SELECT * FROM cases LIMIT 3;

SELECT 'DATA SAMPLE - DOCUMENTS:' as analysis_type;
SELECT * FROM documents LIMIT 3;

SELECT 'DATA SAMPLE - TASKS:' as analysis_type;
SELECT * FROM tasks LIMIT 3;

SELECT 'DATA SAMPLE - CUSTOMERS:' as analysis_type;
SELECT * FROM customers LIMIT 3;
