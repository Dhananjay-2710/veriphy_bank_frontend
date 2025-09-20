#!/bin/bash

# =============================================================================
# COMPREHENSIVE DATA INSERTION SCRIPT - Bash
# =============================================================================
# This bash script executes the comprehensive data insertion

echo "🎯 Veriphy Bank - Comprehensive Data Insertion"
echo "=============================================="
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client (psql) not found in PATH"
    echo "Please install PostgreSQL client or add it to your PATH"
    exit 1
fi
echo "✅ PostgreSQL client (psql) found"

# Database connection parameters
read -p "Enter database host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter database port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Enter database name (default: veriphy_bank): " DB_NAME
DB_NAME=${DB_NAME:-veriphy_bank}

read -p "Enter database username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

echo ""
echo "Database Configuration:"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

read -p "Do you want to proceed with data insertion? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "Operation cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting comprehensive data insertion..."
echo ""

# Function to execute SQL file
execute_sql() {
    local file=$1
    local description=$2
    
    echo "📝 Executing $description"
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -f "$file"; then
        echo "✅ $description completed successfully"
        return 0
    else
        echo "❌ $description failed"
        return 1
    fi
}

# Execute all parts
if execute_sql "comprehensive_mock_data_insert.sql" "Part 1: Basic Entities (Organizations, Users, etc.)"; then
    if execute_sql "comprehensive_mock_data_insert_part2.sql" "Part 2: Business Entities (Customers, Cases, etc.)"; then
        if execute_sql "comprehensive_mock_data_insert_final.sql" "Part 3: System Entities (Logs, Notifications, etc.)"; then
            echo ""
            echo "🎉 All data insertion completed successfully!"
            echo ""
            echo "📊 Verification Query - Record Counts:"
            
            # Run verification query
            psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USER" -c "
            SELECT 
                'organizations' as table_name, count(*) as record_count FROM organizations
            UNION ALL
            SELECT 'users' as table_name, count(*) as record_count FROM users
            UNION ALL
            SELECT 'customers' as table_name, count(*) as record_count FROM customers
            UNION ALL
            SELECT 'cases' as table_name, count(*) as record_count FROM cases
            UNION ALL
            SELECT 'documents' as table_name, count(*) as record_count FROM documents
            UNION ALL
            SELECT 'tasks' as table_name, count(*) as record_count FROM tasks
            UNION ALL
            SELECT 'notifications' as table_name, count(*) as record_count FROM notifications
            ORDER BY table_name;
            "
            
            echo ""
            echo "🎯 Test Credentials:"
            echo "   - superadmin@veriphy.com"
            echo "   - priya.sharma@happybank.in"
            echo "   - rajesh.kumar@happybank.in"
            echo "   - anita.patel@happybank.in"
            echo "   - suresh.krishnamurthy@happybank.in"
            echo "   Password for all: password123"
            echo ""
            echo "🚀 Your Veriphy Bank application should now have comprehensive test data!"
        else
            exit 1
        fi
    else
        exit 1
    fi
else
    exit 1
fi
