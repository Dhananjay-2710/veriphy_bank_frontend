# =============================================================================
# POWERSHELL SCRIPT TO INSERT MOCK DATA INTO SUPABASE DATABASE
# =============================================================================
# This script provides multiple ways to execute the mock data insertion

Write-Host "🚀 Veriphy Bank - Mock Data Insertion Script" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it first:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor Cyan
    Write-Host "  or" -ForegroundColor Yellow
    Write-Host "  Visit: https://supabase.com/docs/guides/cli/getting-started" -ForegroundColor Cyan
    exit 1
}

# Check if we're in a Supabase project
if (-not (Test-Path "supabase/config.toml")) {
    Write-Host "❌ Not in a Supabase project directory." -ForegroundColor Red
    Write-Host "Please run this script from your project root or initialize Supabase first:" -ForegroundColor Yellow
    Write-Host "  supabase init" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Supabase project detected" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Method 1: Supabase Dashboard (Easiest)" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow
Write-Host "1. Go to your Supabase project dashboard" -ForegroundColor White
Write-Host "2. Navigate to SQL Editor" -ForegroundColor White
Write-Host "3. Copy and paste the contents of database/insert_mock_data.sql" -ForegroundColor White
Write-Host "4. Click 'Run' to execute the script" -ForegroundColor White
Write-Host ""

Write-Host "📋 Method 2: Using Supabase CLI" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow
Write-Host "For local development:" -ForegroundColor White
Write-Host "  supabase start" -ForegroundColor Cyan
Write-Host "  Get-Content database/insert_mock_data.sql | supabase db reset" -ForegroundColor Cyan
Write-Host ""
Write-Host "For remote database:" -ForegroundColor White
Write-Host "  Get-Content database/insert_mock_data.sql | supabase db push --db-url 'your-remote-database-url'" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Method 3: Direct PostgreSQL connection" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow
Write-Host "If you have psql installed:" -ForegroundColor White
Write-Host "  psql -h your-db-host -p 5432 -U postgres -d postgres -f database/insert_mock_data.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "For local Supabase:" -ForegroundColor White
Write-Host "  psql -h localhost -p 54322 -U postgres -d postgres -f database/insert_mock_data.sql" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Method 4: Using pgAdmin or other GUI tools" -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Yellow
Write-Host "1. Open pgAdmin or your preferred PostgreSQL GUI" -ForegroundColor White
Write-Host "2. Connect to your Supabase database" -ForegroundColor White
Write-Host "3. Open Query Tool" -ForegroundColor White
Write-Host "4. Copy and paste the contents of database/insert_mock_data.sql" -ForegroundColor White
Write-Host "5. Execute the query" -ForegroundColor White
Write-Host ""

Write-Host "🔍 Verification" -ForegroundColor Yellow
Write-Host "===============" -ForegroundColor Yellow
Write-Host "After running the script, verify the data by running these queries:" -ForegroundColor White
Write-Host ""
Write-Host "  SELECT 'Organizations' as table_name, count(*) as count FROM organizations;" -ForegroundColor Cyan
Write-Host "  SELECT 'Users' as table_name, count(*) as count FROM users;" -ForegroundColor Cyan
Write-Host "  SELECT 'Loan Applications' as table_name, count(*) as count FROM loan_applications;" -ForegroundColor Cyan
Write-Host "  SELECT 'Documents' as table_name, count(*) as count FROM documents;" -ForegroundColor Cyan
Write-Host ""

Write-Host "🎯 Test Credentials" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow
Write-Host "After insertion, you can login with these test credentials:" -ForegroundColor White
Write-Host ""
Write-Host "  Email: superadmin@veriphy.com" -ForegroundColor Cyan
Write-Host "  Password: password123" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Email: priya.sharma@happybank.in" -ForegroundColor Cyan
Write-Host "  Password: password123" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Email: rajesh.kumar@happybank.in" -ForegroundColor Cyan
Write-Host "  Password: password123" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Script completed! Choose one of the methods above to execute the SQL script." -ForegroundColor Green
