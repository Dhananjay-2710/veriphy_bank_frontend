# =============================================================================
# COMPREHENSIVE DATA INSERTION SCRIPT - PowerShell
# =============================================================================
# This PowerShell script executes the comprehensive data insertion

Write-Host "🎯 Veriphy Bank - Comprehensive Data Insertion" -ForegroundColor Green
Write-Host "=============================================="
Write-Host ""

# Check if psql is available
try {
    psql --version | Out-Null
    Write-Host "✅ PostgreSQL client (psql) found" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL client (psql) not found in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client or add it to your PATH" -ForegroundColor Yellow
    exit 1
}

# Database connection parameters
$DB_HOST = Read-Host "Enter database host (default: localhost)"
if ([string]::IsNullOrEmpty($DB_HOST)) { $DB_HOST = "localhost" }

$DB_PORT = Read-Host "Enter database port (default: 5432)"
if ([string]::IsNullOrEmpty($DB_PORT)) { $DB_PORT = "5432" }

$DB_NAME = Read-Host "Enter database name (default: veriphy_bank)"
if ([string]::IsNullOrEmpty($DB_NAME)) { $DB_NAME = "veriphy_bank" }

$DB_USER = Read-Host "Enter database username (default: postgres)"
if ([string]::IsNullOrEmpty($DB_USER)) { $DB_USER = "postgres" }

Write-Host ""
Write-Host "Database Configuration:" -ForegroundColor Cyan
Write-Host "Host: $DB_HOST"
Write-Host "Port: $DB_PORT"
Write-Host "Database: $DB_NAME"
Write-Host "User: $DB_USER"
Write-Host ""

$confirm = Read-Host "Do you want to proceed with data insertion? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Operation cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting comprehensive data insertion..." -ForegroundColor Yellow
Write-Host ""

# Set environment variable for password prompt
$env:PGPASSWORD = Read-Host "Enter database password" -AsSecureString | ConvertFrom-SecureString

try {
    # Execute Part 1
    Write-Host "📝 Executing Part 1: Basic Entities (Organizations, Users, etc.)" -ForegroundColor Blue
    psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f "comprehensive_mock_data_insert.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Part 1 completed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Part 1 failed" -ForegroundColor Red
        exit 1
    }
    
    # Execute Part 2
    Write-Host "📝 Executing Part 2: Business Entities (Customers, Cases, etc.)" -ForegroundColor Blue
    psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f "comprehensive_mock_data_insert_part2.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Part 2 completed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Part 2 failed" -ForegroundColor Red
        exit 1
    }
    
    # Execute Part 3
    Write-Host "📝 Executing Part 3: System Entities (Logs, Notifications, etc.)" -ForegroundColor Blue
    psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f "comprehensive_mock_data_insert_final.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Part 3 completed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Part 3 failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "🎉 All data insertion completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Verification Query - Record Counts:" -ForegroundColor Cyan
    
    # Run verification query
    $verificationQuery = @"
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
"@
    
    echo $verificationQuery | psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER
    
    Write-Host ""
    Write-Host "🎯 Test Credentials:" -ForegroundColor Cyan
    Write-Host "   - superadmin@veriphy.com"
    Write-Host "   - priya.sharma@happybank.in"
    Write-Host "   - rajesh.kumar@happybank.in"
    Write-Host "   - anita.patel@happybank.in"
    Write-Host "   - suresh.krishnamurthy@happybank.in"
    Write-Host "   Password for all: password123"
    Write-Host ""
    Write-Host "🚀 Your Veriphy Bank application should now have comprehensive test data!"
    
} catch {
    Write-Host "❌ Error during execution: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clear password environment variable
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}
