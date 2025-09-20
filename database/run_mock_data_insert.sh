#!/bin/bash

# =============================================================================
# SCRIPT TO INSERT MOCK DATA INTO SUPABASE DATABASE
# =============================================================================
# This script provides multiple ways to execute the mock data insertion

echo "🚀 Veriphy Bank - Mock Data Insertion Script"
echo "=============================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo "  or"
    echo "  curl -fsSL https://supabase.com/install.sh | sh"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory."
    echo "Please run this script from your project root or initialize Supabase first:"
    echo "  supabase init"
    exit 1
fi

echo "✅ Supabase project detected"

# Method 1: Using Supabase CLI (Recommended for local development)
echo ""
echo "📋 Method 1: Execute via Supabase CLI (Recommended)"
echo "----------------------------------------------------"
echo "Run this command to execute the SQL script:"
echo ""
echo "  supabase db reset --db-url 'postgresql://postgres:postgres@localhost:54322/postgres' < database/insert_mock_data.sql"
echo ""
echo "Or if you want to apply it to your remote database:"
echo "  supabase db push --db-url 'your-remote-database-url' < database/insert_mock_data.sql"
echo ""

# Method 2: Direct psql connection
echo "📋 Method 2: Direct PostgreSQL connection"
echo "------------------------------------------"
echo "If you have direct access to your database, you can run:"
echo ""
echo "  psql -h your-db-host -p 5432 -U postgres -d postgres -f database/insert_mock_data.sql"
echo ""
echo "Or for local Supabase:"
echo "  psql -h localhost -p 54322 -U postgres -d postgres -f database/insert_mock_data.sql"
echo ""

# Method 3: Supabase Dashboard
echo "📋 Method 3: Supabase Dashboard (Easiest)"
echo "------------------------------------------"
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the contents of database/insert_mock_data.sql"
echo "4. Click 'Run' to execute the script"
echo ""

# Method 4: Using environment variables
echo "📋 Method 4: Using Environment Variables"
echo "----------------------------------------"
echo "If you have your database credentials in environment variables:"
echo ""
echo "  PGPASSWORD=\$DB_PASSWORD psql -h \$DB_HOST -p \$DB_PORT -U \$DB_USER -d \$DB_NAME -f database/insert_mock_data.sql"
echo ""

echo "🔍 Verification"
echo "==============="
echo "After running the script, you can verify the data was inserted by running these queries in your Supabase SQL Editor:"
echo ""
echo "  SELECT 'Organizations' as table_name, count(*) as count FROM organizations;"
echo "  SELECT 'Users' as table_name, count(*) as count FROM users;"
echo "  SELECT 'Loan Applications' as table_name, count(*) as count FROM loan_applications;"
echo "  SELECT 'Documents' as table_name, count(*) as count FROM documents;"
echo ""

echo "🎯 Test Credentials"
echo "==================="
echo "After insertion, you can login with these test credentials:"
echo ""
echo "  Email: superadmin@veriphy.com"
echo "  Password: password123"
echo ""
echo "  Email: priya.sharma@happybank.in"
echo "  Password: password123"
echo ""
echo "  Email: rajesh.kumar@happybank.in"
echo "  Password: password123"
echo ""

echo "✅ Script completed! Choose one of the methods above to execute the SQL script."
